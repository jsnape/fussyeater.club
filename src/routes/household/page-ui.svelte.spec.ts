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
    const writeText = vi.fn<(_: string) => Promise<void>>().mockResolvedValue(undefined);

    beforeEach(() => {
        mockedApiFetch.mockReset();
        writeText.mockReset();
        writeText.mockResolvedValue(undefined);
        vi.stubGlobal('crypto', { randomUUID: () => 'idem-key-1' });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText }
        });
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
                    },
                    {
                        id: 'inv-2',
                        codeMasked: 'JKL…QRS',
                        maxUses: 3,
                        remainingUses: 3,
                        expiresAt: '2026-01-05T00:00:00.000Z',
                        status: 'revoked'
                    }
                ],
                loadError: null
            }
        });

        await expect.element(page.getByRole('heading', { name: 'Household' })).toBeInTheDocument();
        await expect.element(page.getByText('owner@example.com')).toBeInTheDocument();
        await expect.element(page.getByText('ABC…FGH')).toBeInTheDocument();
        await expect
            .element(page.getByRole('heading', { name: 'Expired Invites' }))
            .toBeInTheDocument();
        await expect.element(page.getByText('Uses: 1 / 3')).toBeInTheDocument();
        await expect.element(page.getByText('Uses: 0 / 3')).toBeInTheDocument();
        await expect
            .element(page.getByRole('button', { name: 'Regenerate invite' }))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('button', { name: 'Create invite' }))
            .not.toBeInTheDocument();
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

    it('should show create invite button when no active invite exists', async () => {
        render(HouseholdPage, {
            data: {
                sessionUser: null,
                members: [],
                invites: [
                    {
                        id: 'inv-2',
                        codeMasked: 'JKL…QRS',
                        maxUses: 3,
                        remainingUses: 3,
                        expiresAt: '2026-01-05T00:00:00.000Z',
                        status: 'expired'
                    }
                ],
                loadError: null
            }
        });

        await expect
            .element(page.getByRole('button', { name: 'Create invite' }))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('button', { name: 'Regenerate invite' }))
            .not.toBeInTheDocument();
    });

    it('should copy registration link after creating invite', async () => {
        mockedApiFetch
            .mockResolvedValueOnce({
                code: 'ABCDEFGH',
                maxUses: 3,
                remainingUses: 3,
                expiresAt: '2026-01-10T00:00:00.000Z'
            })
            .mockResolvedValueOnce({
                invites: [
                    {
                        id: 'inv-1',
                        codeMasked: 'ABC…FGH',
                        maxUses: 3,
                        remainingUses: 3,
                        expiresAt: '2026-01-10T00:00:00.000Z',
                        status: 'active'
                    }
                ]
            });

        render(HouseholdPage, {
            data: {
                sessionUser: null,
                members: [],
                invites: [],
                loadError: null
            }
        });

        await page.getByRole('button', { name: 'Create invite' }).click();
        await expect.element(page.getByRole('button', { name: 'Copy Link' })).toBeEnabled();
        await page.getByRole('button', { name: 'Copy Link' }).click();

        expect(writeText).toHaveBeenCalledTimes(1);
        const copiedLink = writeText.mock.calls[0]?.[0] ?? '';
        expect(copiedLink).toMatch(/\/register\?invite=ABCDEFGH$/);
        await expect.element(page.getByText('Registration link copied.')).toBeInTheDocument();
    });
});
