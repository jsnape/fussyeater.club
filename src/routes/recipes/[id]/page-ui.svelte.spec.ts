import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { components } from '$lib/api-types';
import RecipeDetailPage from './+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (p: string) => p }));

type RecipeDetail = components['schemas']['RecipeDetail'];

type RecipeDetailPageData = {
    recipe: RecipeDetail | null;
    error: 'not-found' | 'forbidden' | 'unavailable' | null;
};

const fullRecipe: RecipeDetail = {
    id: 'pasta-bake',
    title: 'Pasta Bake',
    description: 'Easy family pasta.',
    type: 'full',
    visibility: 'public',
    timings: { prepMinutes: 10, cookMinutes: 20 },
    servings: 4,
    yield: '1 large dish',
    tags: ['quick', 'italian'],
    ingredients: [
        { amount: 400, unit: 'g', ingredient: 'pasta' },
        { amount: 200, unit: 'g', ingredient: 'cheese', preparation: { type: 'text', text: 'grated' } }
    ],
    method: ['Cook the pasta.', 'Add cheese and bake.'],
    notes: 'Let it cool before serving.'
};

const referenceRecipe: RecipeDetail = {
    id: 'beef-stew',
    title: 'Beef Bourguignon',
    description: 'A French classic.',
    type: 'reference',
    visibility: 'public',
    tags: ['french'],
    ingredients: [{ amount: 1.5, unit: 'kg', ingredient: 'beef chuck' }],
    sourceReference: {
        kind: 'url',
        label: 'BBC Good Food',
        url: 'https://bbcgoodfood.com/recipe'
    }
};

function makeData(overrides: Partial<RecipeDetailPageData> = {}): RecipeDetailPageData {
    return {
        recipe: fullRecipe,
        error: null,
        ...overrides
    };
}

function renderPage(overrides: Partial<RecipeDetailPageData> = {}): void {
    render(RecipeDetailPage, { data: makeData(overrides) as never });
}

describe('recipe detail page ui', () => {
    const writeText = vi.fn<(_: string) => Promise<void>>().mockResolvedValue(undefined);

    beforeEach(() => {
        writeText.mockReset();
        writeText.mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText }
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should render recipe title and description', async () => {
        renderPage();

        await expect.element(page.getByRole('heading', { name: 'Pasta Bake' })).toBeInTheDocument();
        await expect.element(page.getByText('Easy family pasta.')).toBeInTheDocument();
    });

    it('should render metadata pills', async () => {
        renderPage();

        await expect.element(page.getByText('Prep: 10 min')).toBeInTheDocument();
        await expect.element(page.getByText('Cook: 20 min')).toBeInTheDocument();
        await expect.element(page.getByText('Total: 30 min')).toBeInTheDocument();
    });

    it('should render ingredients list', async () => {
        renderPage();

        await expect.element(page.getByText('400g pasta')).toBeInTheDocument();
        await expect.element(page.getByText('200g cheese (grated)')).toBeInTheDocument();
    });

    it('should render method steps', async () => {
        renderPage();

        await expect.element(page.getByText('Cook the pasta.')).toBeInTheDocument();
        await expect.element(page.getByText('Add cheese and bake.')).toBeInTheDocument();
    });

    it('should render source reference for reference recipe', async () => {
        renderPage({ recipe: referenceRecipe });

        await expect.element(page.getByText('BBC Good Food')).toBeInTheDocument();
    });

    it('should show not-found error', async () => {
        renderPage({ recipe: null, error: 'not-found' });

        await expect.element(page.getByRole('heading', { name: 'Recipe not found' })).toBeInTheDocument();
    });

    it('should show forbidden error', async () => {
        renderPage({ recipe: null, error: 'forbidden' });

        await expect
            .element(page.getByRole('heading', { name: "You don't have access to this recipe" }))
            .toBeInTheDocument();
    });

    it('should show sidebar on desktop', async () => {
        renderPage();

        await expect.element(page.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should render tags', async () => {
        renderPage();

        await expect.element(page.getByRole('link', { name: 'quick' })).toBeInTheDocument();
        await expect.element(page.getByRole('link', { name: 'italian' })).toBeInTheDocument();
    });
});
