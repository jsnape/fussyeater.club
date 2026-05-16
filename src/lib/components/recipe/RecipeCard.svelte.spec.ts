import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { components } from '$lib/api-types';
import RecipeCard from './RecipeCard.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

type RecipeSummary = components['schemas']['RecipeSummary'];

const recipe: RecipeSummary = {
    id: 'test-recipe',
    title: 'Test Recipe',
    description: 'A **tasty** meal',
    type: 'full',
    visibility: 'public',
    timings: { prepMinutes: 15, cookMinutes: 30 },
    tags: ['quick', 'italian', 'pasta']
};

function makeRecipe(overrides: Partial<RecipeSummary> = {}): RecipeSummary {
    return {
        ...recipe,
        ...overrides
    };
}

function renderCard(overrides: Partial<RecipeSummary> = {}): void {
    render(RecipeCard, { recipe: makeRecipe(overrides) });
}

describe('RecipeCard.svelte', () => {
    it('should render title', async () => {
        renderCard();

        await expect
            .element(page.getByRole('heading', { level: 3, name: 'Test Recipe' }))
            .toBeInTheDocument();
    });

    it('should render description with markdown stripped', async () => {
        renderCard({ description: '**Bold** text' });

        await expect.element(page.getByText('Bold text')).toBeInTheDocument();
    });

    it('should show time overlay when timings provided', async () => {
        renderCard({ timings: { prepMinutes: 15, cookMinutes: 30 } });

        await expect.element(page.getByText('45 min')).toBeInTheDocument();
    });

    it('should format time in hours for long recipes', async () => {
        renderCard({ timings: { prepMinutes: 30, cookMinutes: 90 } });

        await expect.element(page.getByText('2 hr')).toBeInTheDocument();
    });

    it('should not show time when no timings', async () => {
        renderCard({ timings: undefined });

        await expect.element(page.getByText(/\d+\s*(min|hr)/)).not.toBeInTheDocument();
    });

    it('should show max 3 tags plus overflow count', async () => {
        renderCard({ tags: ['quick', 'italian', 'pasta', 'easy', 'family'] });

        await expect.element(page.getByText('quick')).toBeInTheDocument();
        await expect.element(page.getByText('italian')).toBeInTheDocument();
        await expect.element(page.getByText('pasta')).toBeInTheDocument();
        await expect.element(page.getByText('+2 more')).toBeInTheDocument();
    });

    it('should show external source label for reference recipes', async () => {
        renderCard({ type: 'reference' });

        await expect.element(page.getByText('External source')).toBeInTheDocument();
    });

    it('should link to recipe detail page', async () => {
        renderCard();

        await expect.element(page.getByRole('link')).toHaveAttribute('href', '/recipes/test-recipe');
    });

    it('should use fallback image when no imageUrl', async () => {
        renderCard({ imageUrl: undefined });

        await expect
            .element(page.getByRole('img', { name: 'Test Recipe' }))
            .toHaveAttribute('src', '/images/recipe-no-image.jpg');
    });
});
