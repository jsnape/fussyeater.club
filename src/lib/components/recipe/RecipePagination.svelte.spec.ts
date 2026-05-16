import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import RecipePagination from './RecipePagination.svelte';

type PaginationProps = {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
};

function makeProps(overrides: Partial<PaginationProps> = {}): PaginationProps {
    return {
        page: 1,
        totalPages: 5,
        total: 60,
        pageSize: 12,
        onPageChange: vi.fn(),
        ...overrides
    };
}

function renderPagination(overrides: Partial<PaginationProps> = {}): PaginationProps {
    const props = makeProps(overrides);
    render(RecipePagination, props);
    return props;
}

describe('RecipePagination.svelte', () => {
    it('should not render when totalPages is 1', async () => {
        renderPagination({ totalPages: 1 });

        await expect
            .element(page.getByRole('navigation', { name: 'Pagination' }))
            .not.toBeInTheDocument();
    });

    it('should show page numbers for small page count', async () => {
        renderPagination({ totalPages: 3 });

        await expect.element(page.getByRole('button', { name: '1' })).toBeInTheDocument();
        await expect.element(page.getByRole('button', { name: '2' })).toBeInTheDocument();
        await expect.element(page.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('should show "Showing X-Y of Z" summary', async () => {
        renderPagination({ page: 2, totalPages: 3, total: 30, pageSize: 12 });

        await expect.element(page.getByText('Showing 13–24 of 30 recipes')).toBeInTheDocument();
    });

    it('should disable Previous on first page', async () => {
        renderPagination({ page: 1 });

        await expect.element(page.getByRole('button', { name: '← Previous' })).toBeDisabled();
    });

    it('should disable Next on last page', async () => {
        renderPagination({ page: 5, totalPages: 5 });

        await expect.element(page.getByRole('button', { name: 'Next →' })).toBeDisabled();
    });

    it('should call onPageChange when page number clicked', async () => {
        const { onPageChange } = renderPagination({ page: 1, totalPages: 3 });

        await page.getByRole('button', { name: '2' }).click();

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should show ellipsis for many pages', async () => {
        renderPagination({ page: 10, totalPages: 20, total: 240 });

        await expect
            .element(page.getByRole('navigation', { name: 'Pagination' }))
            .toHaveTextContent('…');
    });

    it('should mark current page with aria-current', async () => {
        renderPagination({ page: 3, totalPages: 5 });

        await expect
            .element(page.getByRole('button', { name: '3' }))
            .toHaveAttribute('aria-current', 'page');
    });
});
