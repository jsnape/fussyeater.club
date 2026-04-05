import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HouseholdPage from './+page.svelte';
import { ApiError, apiFetch } from '$lib/api';

vi.mock('$lib/api', async () => {
    class ApiError extends Error {
        status: number;

        constructor(message: string, status: number) {
            super(message);
            this.status = status;
        }
    }

    return { apiFetch: vi.fn(), ApiError };
});

const mockedApiFetch = vi.mocked(apiFetch);

describe('household page ui', () => {
    beforeEach(() => {
        mockedApiFetch.mockReset();
    });

    it('should render members and masked invites', async () => {
        render(HouseholdPage, {
            data: {
                sessionUser: null,
                members: [
                    {
                        userId: 'owner-1',
                        name: 'Owner',
                        email: 'owner@example.com',
                        role: 'owner',
                        joinedAt: '2026-01-01T00:00:00.000Z'
                    }
                ],
                invites: [
                    {
                        id: 'inv-1',
                        codeMasked: 'ABC…FGH',
                        maxUses: 3,
                        remainingUses: 2,
                        expiresAt: '2026-01-10T00:00:00.000Z',
                        status: 'active'
                    }
                ],
                loadError: null
            }
        });

        await expect.element(page.getByRole('heading', { name: 'Household' })).toBeInTheDocument();
        await expect.element(page.getByText('owner@example.com')).toBeInTheDocument();
        await expect.element(page.getByText('ABC…FGH')).toBeInTheDocument();
        await expect.element(page.getByText('2/3')).toBeInTheDocument();
    });

    it('should preserve form state on create invite failure', async () => {
        mockedApiFetch.mockRejectedValueOnce(new ApiError('Forbidden', 403));

        render(HouseholdPage, {
            data: {
                sessionUser: null,
                members: [],
                invites: [],
                loadError: null
            }
        });

        await page.getByRole('spinbutton', { name: 'Max uses' }).fill('5');
        await page.getByRole('spinbutton', { name: 'Expires in days' }).fill('14');
        await page.getByRole('button', { name: 'Create invite' }).click();

        await expect
            .element(page.getByText('Only the household owner can manage invites.'))
            .toBeInTheDocument();
        await expect.element(page.getByRole('spinbutton', { name: 'Max uses' })).toHaveValue(5);
        await expect
            .element(page.getByRole('spinbutton', { name: 'Expires in days' }))
            .toHaveValue(14);
    });
});
