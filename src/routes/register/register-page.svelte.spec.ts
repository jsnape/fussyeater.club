import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from './+page.svelte';
import { ApiError, apiFetch } from '$lib/api';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));
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

describe('register page ui', () => {
    beforeEach(() => {
        mockedApiFetch.mockReset();
        history.replaceState(null, '', '/register');
        sessionStorage.clear();
    });

    it('should switch between create and join household modes', async () => {
        render(RegisterPage, {
            data: {
                canManageHousehold: false,
                sessionUser: null,
                inviteCode: '',
                socialContinuation: false,
                socialEmail: ''
            }
        });

        await expect
            .element(page.getByRole('textbox', { name: 'Household name' }))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('radio', { name: 'Join with an invite' }))
            .toBeInTheDocument();

        await page.getByRole('radio', { name: 'Join with an invite' }).click();
        await expect
            .element(page.getByRole('textbox', { name: 'Invite code' }))
            .toBeInTheDocument();
    });

    it('should not redeem invite automatically when invite code comes from link', async () => {
        render(RegisterPage, {
            data: {
                canManageHousehold: false,
                sessionUser: null,
                inviteCode: 'ABC12345',
                socialContinuation: false,
                socialEmail: ''
            }
        });

        await expect
            .element(page.getByRole('textbox', { name: 'Invite code' }))
            .toHaveValue('ABC12345');
        expect(mockedApiFetch).not.toHaveBeenCalled();
    });

    it('should redeem invite only after redeem invite button is clicked', async () => {
        mockedApiFetch.mockResolvedValueOnce({
            joinIntentToken: 'join_token_123',
            household: {
                id: 'household_123',
                name: 'Taylor Family'
            }
        });

        render(RegisterPage, {
            data: {
                canManageHousehold: false,
                sessionUser: null,
                inviteCode: 'ABC12345',
                socialContinuation: false,
                socialEmail: ''
            }
        });

        expect(mockedApiFetch).not.toHaveBeenCalled();

        await page.getByRole('button', { name: 'Redeem invite' }).click();

        expect(mockedApiFetch).toHaveBeenCalledWith(
            '/api/invites/redeem',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ code: 'ABC12345' })
            })
        );
        await expect
            .element(page.getByText('Joined invite for Taylor Family.'))
            .toBeInTheDocument();
    });

    it('should hide password and keep readonly email in social continuation mode', async () => {
        render(RegisterPage, {
            data: {
                canManageHousehold: false,
                sessionUser: null,
                inviteCode: '',
                socialContinuation: true,
                socialEmail: 'microsoft.user@example.com'
            }
        });

        await expect
            .element(page.getByText('Continuing with Microsoft. Password is not required.'))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('textbox', { name: 'Password' }))
            .not.toBeInTheDocument();
        await expect
            .element(page.getByRole('textbox', { name: 'Email' }))
            .toHaveValue('microsoft.user@example.com');
        await expect
            .element(page.getByRole('textbox', { name: 'Email' }))
            .toHaveAttribute('readonly', '');
    });

    it('should preserve user input when registration submit fails', async () => {
        mockedApiFetch.mockRejectedValueOnce(new ApiError('temporary failure', 503));

        render(RegisterPage, {
            data: {
                canManageHousehold: false,
                sessionUser: null,
                inviteCode: '',
                socialContinuation: false,
                socialEmail: ''
            }
        });

        await page.getByRole('textbox', { name: 'Full name' }).fill('Taylor');
        await page.getByRole('textbox', { name: 'Email' }).fill('taylor@example.com');
        await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123');
        await page.getByRole('textbox', { name: 'Confirm password' }).fill('Password123');
        await page.getByRole('textbox', { name: 'Household name' }).fill('Taylor Family');

        await page.getByRole('button', { name: 'Complete registration' }).click();

        await expect
            .element(page.getByText('Registration is temporarily unavailable. Please try again.'))
            .toBeInTheDocument();
        await expect
            .element(page.getByRole('textbox', { name: 'Full name' }))
            .toHaveValue('Taylor');
        await expect
            .element(page.getByRole('textbox', { name: 'Email' }))
            .toHaveValue('taylor@example.com');
        await expect
            .element(page.getByRole('textbox', { name: 'Household name' }))
            .toHaveValue('Taylor Family');
        await expect
            .element(page.getByRole('textbox', { name: 'Password', exact: true }))
            .toHaveValue('Password123');
        await expect
            .element(page.getByRole('textbox', { name: 'Confirm password' }))
            .toHaveValue('Password123');
        expect(mockedApiFetch).toHaveBeenCalledWith(
            '/api/register/complete',
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('should block submit when password confirmation does not match', async () => {
        render(RegisterPage, {
            data: {
                canManageHousehold: false,
                sessionUser: null,
                inviteCode: '',
                socialContinuation: false,
                socialEmail: ''
            }
        });

        await page.getByRole('textbox', { name: 'Full name' }).fill('Taylor');
        await page.getByRole('textbox', { name: 'Email' }).fill('taylor@example.com');
        await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123');
        await page.getByRole('textbox', { name: 'Confirm password' }).fill('Password456');
        await page.getByRole('textbox', { name: 'Household name' }).fill('Taylor Family');

        await page.getByRole('button', { name: 'Complete registration' }).click();

        await expect.element(page.getByText('Passwords do not match.')).toBeInTheDocument();
        expect(mockedApiFetch).not.toHaveBeenCalled();
    });
});
