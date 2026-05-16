import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { components } from '$lib/api-types';
import RecipesPage from './+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

type RecipeSummary = components['schemas']['RecipeSummary'];
type RecipesPageData = {
    sessionUser: null;
    canManageHousehold: boolean;
    items: RecipeSummary[];
    page: number;
    pageSize: number;
    total: number;
    q: string;
    sort: 'latest' | 'quickest' | 'alphabetical';
    error: null | 'unavailable';
};

const sampleRecipes: RecipeSummary[] = [
    {
        id: 'pasta-bake',
        title: 'Pasta Bake',
        description: 'Easy family pasta.',
        type: 'full',
        visibility: 'public',
        timings: { prepMinutes: 5, cookMinutes: 20 },
        tags: ['quick', 'family']
    },
    {
        id: 'slow-stew',
        title: 'Slow Stew',
        description: 'A hearty stew.',
        type: 'reference',
        visibility: 'public',
        tags: ['comfort'],
        sourceReference: { kind: 'url', label: 'BBC', url: 'https://bbc.co.uk' }
    }
];

function makeData(overrides: Partial<RecipesPageData> = {}): RecipesPageData {
    return {
        sessionUser: null,
        canManageHousehold: false,
        items: sampleRecipes,
        page: 1,
        pageSize: 24,
        total: sampleRecipes.length,
        q: '',
        sort: 'latest',
        error: null,
        ...overrides
    };
}

function renderPage(overrides: Partial<RecipesPageData> = {}): void {
    render(RecipesPage, { data: makeData(overrides) as never });
}

describe('recipes page ui', () => {
    it('should render recipe cards', async () => {
        renderPage();

        await expect.element(page.getByText('Pasta Bake')).toBeInTheDocument();
        await expect.element(page.getByText('Slow Stew')).toBeInTheDocument();
    });

    it('should show recipe count in subtitle', async () => {
        renderPage({ total: 5 });

        await expect.element(page.getByText('5 recipes available')).toBeInTheDocument();
    });

    it('should show empty state when no recipes', async () => {
        renderPage({ items: [], total: 0 });

        await expect
            .element(page.getByRole('heading', { name: 'No recipes found' }))
            .toBeInTheDocument();
        await expect
            .element(page.getByText("Your household hasn't added any recipes yet."))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('link', { name: 'Add Your First Recipe' }))
            .toBeInTheDocument();
    });

    it('should show filtered empty state', async () => {
        renderPage({ items: [], total: 0, q: 'pizza' });

        await expect
            .element(page.getByRole('heading', { name: 'No recipes found' }))
            .toBeInTheDocument();
        await expect
            .element(page.getByText('No recipes match your current filters.'))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('link', { name: 'Clear Filters' }))
            .toBeInTheDocument();
    });

    it('should show error state', async () => {
        renderPage({ items: [], total: 0, error: 'unavailable' });

        await expect
            .element(page.getByRole('heading', { name: 'Something went wrong' }))
            .toBeInTheDocument();
        await expect
            .element(page.getByText("We're having trouble loading recipes right now. Please try again later."))
            .toBeInTheDocument();
    });

    it('should display sort dropdown with correct value', async () => {
        renderPage({ sort: 'quickest' });

        await expect.element(page.getByRole('combobox')).toHaveValue('quickest');
    });
});
