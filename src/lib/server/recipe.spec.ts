import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from './test-db';
import {
    getRecipeBySlug,
    canViewRecipe,
    canEditRecipe,
    generateUniqueSlug,
    createRecipe,
    updateRecipe,
    deleteRecipe
} from '$lib/server/recipe';
import type { RecipeRow, CreateRecipeInput, UpdateRecipeInput } from '$lib/server/recipe';
import type { AuthContext } from './security';

describe('getRecipeBySlug', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    async function seedRecipe(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, type, visibility, ingredients, tags)
				 VALUES ('test-recipe', 'Test Recipe', 'full', 'public', '[]', '[]')`
            )
            .run();
    }

    it('should return a recipe for an existing slug', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        await seedRecipe(pair);

        const recipe = await getRecipeBySlug(pair.first, 'test-recipe');
        expect(recipe).not.toBeNull();
        expect(recipe!.id).toBe('test-recipe');
        expect(recipe!.title).toBe('Test Recipe');
        expect(recipe!.type).toBe('full');
    });

    it('should return null for a non-existent slug', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const recipe = await getRecipeBySlug(pair.first, 'does-not-exist');
        expect(recipe).toBeNull();
    });

    it('should return all recipe fields', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, description, image_url, type, visibility,
				 servings, yield, prep_minutes, cook_minutes, ingredients, method, notes, tags)
				 VALUES ('full-recipe', 'Full Recipe', 'A description', 'https://example.com/img.jpg',
				 'full', 'public', 4, '1 bowl', 10, 15,
				 '[{"amount":1,"ingredient":"flour"}]',
				 '["Step 1","Step 2"]',
				 'Some notes',
				 '["tag1","tag2"]')`
            )
            .run();

        const recipe = await getRecipeBySlug(pair.first, 'full-recipe');
        expect(recipe).not.toBeNull();
        expect(recipe!.description).toBe('A description');
        expect(recipe!.image_url).toBe('https://example.com/img.jpg');
        expect(recipe!.servings).toBe(4);
        expect(recipe!.yield).toBe('1 bowl');
        expect(recipe!.prep_minutes).toBe(10);
        expect(recipe!.cook_minutes).toBe(15);
        expect(recipe!.notes).toBe('Some notes');
    });
});

describe('canViewRecipe', () => {
    const publicRecipe: RecipeRow = {
        id: 'public-recipe',
        title: 'Public',
        description: null,
        image_url: null,
        type: 'full',
        visibility: 'public',
        household_id: null,
        created_by: null,
        servings: null,
        yield: null,
        prep_minutes: null,
        cook_minutes: null,
        ingredients: '[]',
        method: null,
        source_reference: null,
        notes: null,
        tags: '[]'
    };

    const privateRecipe: RecipeRow = {
        ...publicRecipe,
        id: 'private-recipe',
        visibility: 'private',
        household_id: 'house-1'
    };

    const authenticatedAuth: AuthContext = {
        userId: 'user-1',
        email: 'user@example.com',
        name: 'User',
        socialProvider: null
    };

    const anonymousAuth: AuthContext = {
        userId: null,
        email: null,
        name: null,
        socialProvider: null
    };

    it('should allow anyone to view a public recipe', () => {
        expect(canViewRecipe(publicRecipe, anonymousAuth, null)).toBe(true);
    });

    it('should allow authenticated user to view a public recipe', () => {
        expect(canViewRecipe(publicRecipe, authenticatedAuth, null)).toBe(true);
    });

    it('should deny anonymous user access to a private recipe', () => {
        expect(canViewRecipe(privateRecipe, anonymousAuth, null)).toBe(false);
    });

    it('should allow household member to view their private recipe', () => {
        expect(canViewRecipe(privateRecipe, authenticatedAuth, 'house-1')).toBe(true);
    });

    it('should deny non-member access to a private recipe', () => {
        expect(canViewRecipe(privateRecipe, authenticatedAuth, 'other-house')).toBe(false);
    });

    it('should deny authenticated user without household access to a private recipe', () => {
        expect(canViewRecipe(privateRecipe, authenticatedAuth, null)).toBe(false);
    });
});

describe('canEditRecipe', () => {
    const publicRecipe: RecipeRow = {
        id: 'public-recipe',
        title: 'Public',
        description: null,
        image_url: null,
        type: 'full',
        visibility: 'public',
        household_id: null,
        created_by: null,
        servings: null,
        yield: null,
        prep_minutes: null,
        cook_minutes: null,
        ingredients: '[]',
        method: null,
        source_reference: null,
        notes: null,
        tags: '[]'
    };

    const authenticatedAuth: AuthContext = {
        userId: 'user-1',
        email: 'user@example.com',
        name: 'User',
        socialProvider: null
    };

    const anonymousAuth: AuthContext = {
        userId: null,
        email: null,
        name: null,
        socialProvider: null
    };

    it('should allow creator to edit their own recipe', () => {
        const recipe: RecipeRow = {
            ...publicRecipe,
            id: 'creator-recipe',
            created_by: 'user-1'
        };

        expect(canEditRecipe(recipe, authenticatedAuth, null)).toBe(true);
    });

    it('should allow household member to edit household recipe', () => {
        const recipe: RecipeRow = {
            ...publicRecipe,
            id: 'household-recipe',
            visibility: 'private',
            household_id: 'house-1'
        };

        expect(canEditRecipe(recipe, authenticatedAuth, 'house-1')).toBe(true);
    });

    it('should deny anonymous users', () => {
        const recipe: RecipeRow = {
            ...publicRecipe,
            id: 'anonymous-recipe',
            created_by: 'user-1'
        };

        expect(canEditRecipe(recipe, anonymousAuth, 'house-1')).toBe(false);
    });

    it('should deny users who are not creator and not in the household', () => {
        const recipe: RecipeRow = {
            ...publicRecipe,
            id: 'restricted-recipe',
            visibility: 'private',
            household_id: 'house-1',
            created_by: 'other-user'
        };

        expect(canEditRecipe(recipe, authenticatedAuth, 'other-house')).toBe(false);
    });

    it('should deny editing public recipes with no creator and no household', () => {
        expect(canEditRecipe(publicRecipe, authenticatedAuth, null)).toBe(false);
    });
});

describe('generateUniqueSlug', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    it('should generate a slug from a title', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const slug = await generateUniqueSlug(pair.first, 'Spaghetti Carbonara');
        expect(slug).toBe('spaghetti-carbonara');
    });

    it('should append -2 suffix on first collision', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare(
                `INSERT INTO recipes (id, title, type, visibility, ingredients, tags)
				 VALUES ('spaghetti-carbonara', 'Spaghetti Carbonara', 'full', 'public', '[]', '[]')`
            )
            .run();

        const slug = await generateUniqueSlug(pair.first, 'Spaghetti Carbonara');
        expect(slug).toBe('spaghetti-carbonara-2');
    });

    it('should increment suffix for multiple collisions', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        for (const id of ['spaghetti-carbonara', 'spaghetti-carbonara-2']) {
            await pair.first
                .prepare(
                    `INSERT INTO recipes (id, title, type, visibility, ingredients, tags)
					 VALUES (?1, 'Spaghetti Carbonara', 'full', 'public', '[]', '[]')`
                )
                .bind(id)
                .run();
        }

        const slug = await generateUniqueSlug(pair.first, 'Spaghetti Carbonara');
        expect(slug).toBe('spaghetti-carbonara-3');
    });

    it('should throw for empty slug generation', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await expect(generateUniqueSlug(pair.first, '   ')).rejects.toThrow('EMPTY_SLUG');
    });
});

describe('createRecipe', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    const baseInput: CreateRecipeInput = {
        title: 'Test Pasta',
        type: 'full',
        visibility: 'public',
        ingredients: [{ amount: 400, unit: 'g', ingredient: 'spaghetti' }],
        method: ['Cook spaghetti.', 'Serve.'],
        tags: ['Italian', 'Quick'],
        householdId: null,
        createdBy: null
    };

    it('should create a recipe and return it', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const recipe = await createRecipe(pair.first, baseInput);

        expect(recipe.id).toBe('test-pasta');
        expect(recipe.title).toBe('Test Pasta');
        expect(recipe.type).toBe('full');
        expect(recipe.visibility).toBe('public');
    });

    it('should persist ingredients as JSON', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const recipe = await createRecipe(pair.first, baseInput);
        const ingredients = JSON.parse(recipe.ingredients);

        expect(ingredients).toHaveLength(1);
        expect(ingredients[0].ingredient).toBe('spaghetti');
        expect(ingredients[0].amount).toBe(400);
    });

    it('should persist method as JSON', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const recipe = await createRecipe(pair.first, baseInput);
        const method = JSON.parse(recipe.method!);

        expect(method).toEqual(['Cook spaghetti.', 'Serve.']);
    });

    it('should lowercase and deduplicate tags', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const recipe = await createRecipe(pair.first, {
            ...baseInput,
            tags: ['Italian', 'quick', 'ITALIAN', ' Quick ']
        });
        const tags = JSON.parse(recipe.tags);

        expect(tags).toEqual(['italian', 'quick']);
    });

    it('should handle slug collision when creating', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const first = await createRecipe(pair.first, baseInput);
        expect(first.id).toBe('test-pasta');

        const second = await createRecipe(pair.first, { ...baseInput, title: 'Test Pasta' });
        expect(second.id).toBe('test-pasta-2');
    });

    it('should set household_id for private recipes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        await pair.first
            .prepare("INSERT INTO users (id, email, name) VALUES ('u1', 'u@e.com', 'U')")
            .run();
        await pair.first
            .prepare("INSERT INTO households (id, owner_user_id, name) VALUES ('h1', 'u1', 'Home')")
            .run();

        const recipe = await createRecipe(pair.first, {
            ...baseInput,
            visibility: 'private',
            householdId: 'h1'
        });

        expect(recipe.visibility).toBe('private');
        expect(recipe.household_id).toBe('h1');
    });

    it('should store null method for reference recipes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const recipe = await createRecipe(pair.first, {
            ...baseInput,
            type: 'reference',
            method: undefined,
            sourceReference: { kind: 'book', label: 'My Cookbook', pageNumber: 42 }
        });

        expect(recipe.method).toBeNull();
        expect(recipe.source_reference).not.toBeNull();
        const src = JSON.parse(recipe.source_reference!);
        expect(src.kind).toBe('book');
        expect(src.label).toBe('My Cookbook');
    });
});

describe('updateRecipe', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    const baseInput: CreateRecipeInput = {
        title: 'Original Pasta',
        description: 'Original description',
        type: 'full',
        visibility: 'public',
        ingredients: [{ amount: 400, unit: 'g', ingredient: 'spaghetti' }],
        method: ['Cook spaghetti.', 'Serve.'],
        tags: ['Italian', 'Quick'],
        householdId: null,
        createdBy: null
    };

    const baseUpdateInput: UpdateRecipeInput = {
        title: 'Updated Pasta',
        description: 'Updated description',
        imageUrl: 'https://example.com/updated.jpg',
        type: 'full',
        visibility: 'public',
        servings: 6,
        yield: '2 bowls',
        prepMinutes: 15,
        cookMinutes: 20,
        ingredients: [{ amount: 500, unit: 'g', ingredient: 'linguine' }],
        method: ['Mix.', 'Serve.'],
        tags: ['Family', 'Quick'],
        notes: 'Updated notes',
        householdId: null
    };

    it('should update recipe fields', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        const recipe = await createRecipe(pair.first, baseInput);

        await updateRecipe(pair.first, recipe.id, baseUpdateInput);

        const updatedRecipe = await getRecipeBySlug(pair.first, recipe.id);
        expect(updatedRecipe).not.toBeNull();
        expect(updatedRecipe!.title).toBe('Updated Pasta');
        expect(updatedRecipe!.description).toBe('Updated description');
        expect(updatedRecipe!.image_url).toBe('https://example.com/updated.jpg');
        expect(updatedRecipe!.servings).toBe(6);
    });

    it('should update recipe type from full to reference', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        const recipe = await createRecipe(pair.first, baseInput);
        const updateInput: UpdateRecipeInput = {
            ...baseUpdateInput,
            title: 'Cookbook Pasta',
            type: 'reference',
            method: undefined,
            sourceReference: { kind: 'book', label: 'My Cookbook', pageNumber: 12 }
        };

        const updatedRecipe = await updateRecipe(pair.first, recipe.id, updateInput);

        expect(updatedRecipe).not.toBeNull();
        expect(updatedRecipe!.type).toBe('reference');
        expect(updatedRecipe!.method).toBeNull();
        expect(updatedRecipe!.source_reference).not.toBeNull();
        expect(JSON.parse(updatedRecipe!.source_reference!)).toEqual({
            kind: 'book',
            label: 'My Cookbook',
            pageNumber: 12
        });
    });

    it('should return null for non-existent slug', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const updatedRecipe = await updateRecipe(pair.first, 'does-not-exist', baseUpdateInput);

        expect(updatedRecipe).toBeNull();
    });

    it('should preserve slug when title changes', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        const recipe = await createRecipe(pair.first, baseInput);

        const updatedRecipe = await updateRecipe(pair.first, recipe.id, {
            ...baseUpdateInput,
            title: 'Renamed Pasta'
        });

        expect(updatedRecipe).not.toBeNull();
        expect(updatedRecipe!.id).toBe(recipe.id);
        expect(await getRecipeBySlug(pair.first, recipe.id)).not.toBeNull();
        expect(await getRecipeBySlug(pair.first, 'renamed-pasta')).toBeNull();
    });
});

describe('deleteRecipe', () => {
    const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

    afterEach(() => {
        for (const pair of pairs.splice(0)) {
            pair.cleanup();
        }
    });

    const baseInput: CreateRecipeInput = {
        title: 'Delete Me Pasta',
        type: 'full',
        visibility: 'public',
        ingredients: [{ amount: 400, unit: 'g', ingredient: 'spaghetti' }],
        method: ['Cook spaghetti.', 'Serve.'],
        tags: ['Italian', 'Quick'],
        householdId: null,
        createdBy: null
    };

    it('should delete an existing recipe and return true', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        const recipe = await createRecipe(pair.first, baseInput);

        const deleted = await deleteRecipe(pair.first, recipe.id);

        expect(deleted).toBe(true);
    });

    it('should return false for non-existent slug', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);

        const deleted = await deleteRecipe(pair.first, 'does-not-exist');

        expect(deleted).toBe(false);
    });

    it('should make recipe unfindable after deletion', async () => {
        const pair = createTestDbPair();
        pairs.push(pair);
        const recipe = await createRecipe(pair.first, baseInput);

        await deleteRecipe(pair.first, recipe.id);

        const deletedRecipe = await getRecipeBySlug(pair.first, recipe.id);
        expect(deletedRecipe).toBeNull();
    });
});
