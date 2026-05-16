import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecipeSidebar from './RecipeSidebar.svelte';

const printFn = vi.fn();
const writeText = vi.fn<(_: string) => Promise<void>>().mockResolvedValue(undefined);

function renderSidebar(): void {
    render(RecipeSidebar, { recipeTitle: 'Test Recipe' });
}

describe('RecipeSidebar.svelte', () => {
    beforeEach(() => {
        printFn.mockReset();
        writeText.mockReset();
        writeText.mockResolvedValue(undefined);
        history.replaceState(null, '', '/recipes/test-recipe');
        vi.stubGlobal('print', printFn);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText }
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should render Quick Actions heading', async () => {
        renderSidebar();

        await expect.element(page.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should render all four action buttons', async () => {
        renderSidebar();

        await expect.element(page.getByRole('button', { name: 'Add to Meal Plan' })).toBeInTheDocument();
        await expect
            .element(page.getByRole('button', { name: 'Add to Shopping List' }))
            .toBeInTheDocument();
        await expect.element(page.getByRole('button', { name: 'Print Recipe' })).toBeInTheDocument();
        await expect.element(page.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    });

    it('should disable placeholder buttons', async () => {
        renderSidebar();

        await expect.element(page.getByRole('button', { name: 'Add to Meal Plan' })).toBeDisabled();
        await expect
            .element(page.getByRole('button', { name: 'Add to Shopping List' }))
            .toBeDisabled();
    });

    it('should enable Print and Share buttons', async () => {
        renderSidebar();

        await expect.element(page.getByRole('button', { name: 'Print Recipe' })).toBeEnabled();
        await expect.element(page.getByRole('button', { name: 'Share' })).toBeEnabled();
    });

    it('should call window.print when Print clicked', async () => {
        renderSidebar();

        await page.getByRole('button', { name: 'Print Recipe' }).click();

        expect(printFn).toHaveBeenCalledTimes(1);
    });

    it('should copy URL and show "Copied!" on Share click', async () => {
        renderSidebar();

        await page.getByRole('button', { name: 'Share' }).click();

        expect(writeText).toHaveBeenCalledWith(window.location.href);
        await expect.element(page.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    });

    it('should not show "Copied!" when clipboard fails', async () => {
        writeText.mockRejectedValueOnce(new Error('Clipboard unavailable'));
        renderSidebar();

        await page.getByRole('button', { name: 'Share' }).click();

        await expect.element(page.getByRole('button', { name: 'Share' })).toBeInTheDocument();
        await expect.element(page.getByText('Copied!')).not.toBeInTheDocument();
    });
});
