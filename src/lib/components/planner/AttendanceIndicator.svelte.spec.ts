import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import type { components } from '$lib/api-types';
import AttendanceIndicator from './AttendanceIndicator.svelte';

type MealAttendee = components['schemas']['MealAttendee'];

function makeAttendees(overrides: Partial<MealAttendee>[] = []): MealAttendee[] {
	const defaults: MealAttendee[] = [
		{ memberId: 'u1', memberName: 'James', isAttending: true },
		{ memberId: 'u2', memberName: 'Sarah', isAttending: true },
		{ memberId: 'dep-1', memberName: 'Lily', isAttending: true }
	];
	if (overrides.length === 0) return defaults;
	return defaults.map((d, i) => ({ ...d, ...(overrides[i] ?? {}) }));
}

describe('AttendanceIndicator.svelte', () => {
	it('should render an initial for each attendee', async () => {
		render(AttendanceIndicator, { attendees: makeAttendees(), guestCovers: 0 });

		await expect.element(page.getByText('J')).toBeInTheDocument();
		await expect.element(page.getByText('S')).toBeInTheDocument();
		await expect.element(page.getByText('L')).toBeInTheDocument();
	});

	it('should show attending count in aria-label', async () => {
		render(AttendanceIndicator, { attendees: makeAttendees(), guestCovers: 0 });

		await expect
			.element(page.getByRole('button'))
			.toHaveAttribute('aria-label', 'Manage attendance (3 eating)');
	});

	it('should show guest pill when guestCovers > 0', async () => {
		render(AttendanceIndicator, { attendees: makeAttendees(), guestCovers: 2 });

		await expect.element(page.getByText('+2')).toBeInTheDocument();
	});

	it('should not show guest pill when guestCovers is 0', async () => {
		render(AttendanceIndicator, { attendees: makeAttendees(), guestCovers: 0 });

		await expect.element(page.getByText(/^\+\d+$/)).not.toBeInTheDocument();
	});

	it('should include guests in attendance count', async () => {
		render(AttendanceIndicator, { attendees: makeAttendees(), guestCovers: 2 });

		await expect
			.element(page.getByRole('button'))
			.toHaveAttribute('aria-label', 'Manage attendance (5 eating)');
	});

	it('should show absent member with title indicating absent', async () => {
		const attendees = makeAttendees([{}, { isAttending: false }, {}]);
		render(AttendanceIndicator, { attendees, guestCovers: 0 });

		await expect
			.element(page.getByTitle('Sarah (absent)'))
			.toBeInTheDocument();
	});

	it('should exclude absent members from attendance count', async () => {
		const attendees = makeAttendees([{}, { isAttending: false }, {}]);
		render(AttendanceIndicator, { attendees, guestCovers: 0 });

		await expect
			.element(page.getByRole('button'))
			.toHaveAttribute('aria-label', 'Manage attendance (2 eating)');
	});
});
