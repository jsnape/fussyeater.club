import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { components } from '$lib/api-types';
import AttendancePopover from './AttendancePopover.svelte';

type MealAttendee = components['schemas']['MealAttendee'];
type HouseholdMemberSummary = components['schemas']['HouseholdMemberSummary'];

const defaultAttendees: MealAttendee[] = [
	{ memberId: 'u1', memberName: 'James', isAttending: true },
	{ memberId: 'u2', memberName: 'Sarah', isAttending: true },
	{ memberId: 'dep-1', memberName: 'Lily', isAttending: true }
];

const defaultMembers: HouseholdMemberSummary[] = [
	{ memberId: 'u1', name: 'James', isDependent: false },
	{ memberId: 'u2', name: 'Sarah', isDependent: false },
	{ memberId: 'dep-1', name: 'Lily', isDependent: true }
];

function renderPopover(overrides: {
	attendees?: MealAttendee[];
	guestCovers?: number;
	members?: HouseholdMemberSummary[];
	onSave?: (attendees: MealAttendee[], guestCovers: number) => void;
	onClose?: () => void;
} = {}) {
	return render(AttendancePopover, {
		attendees: overrides.attendees ?? defaultAttendees,
		guestCovers: overrides.guestCovers ?? 0,
		members: overrides.members ?? defaultMembers,
		onSave: overrides.onSave ?? vi.fn(),
		onClose: overrides.onClose ?? vi.fn()
	});
}

describe('AttendancePopover.svelte', () => {
	it('should render heading', async () => {
		renderPopover();

		await expect
			.element(page.getByRole('heading', { level: 4 }))
			.toHaveTextContent("Who's eating?");
	});

	it('should render a checkbox for each member', async () => {
		renderPopover();

		const checkboxes = page.getByRole('checkbox');
		await expect.element(checkboxes.nth(0)).toBeChecked();
		await expect.element(checkboxes.nth(1)).toBeChecked();
		await expect.element(checkboxes.nth(2)).toBeChecked();
	});

	it('should show member names', async () => {
		renderPopover();

		await expect.element(page.getByText('James')).toBeInTheDocument();
		await expect.element(page.getByText('Sarah')).toBeInTheDocument();
		await expect.element(page.getByText('Lily')).toBeInTheDocument();
	});

	it('should show servings count matching attendee count', async () => {
		renderPopover();

		await expect.element(page.getByText('🍽️ 3 servings')).toBeInTheDocument();
	});

	it('should show guest counter with initial value', async () => {
		renderPopover({ guestCovers: 2 });

		await expect.element(page.getByText('2')).toBeInTheDocument();
		await expect.element(page.getByText('🍽️ 5 servings')).toBeInTheDocument();
	});

	it('should toggle member attendance on checkbox click', async () => {
		renderPopover();

		const checkboxes = page.getByRole('checkbox');
		await checkboxes.nth(1).click();

		await expect.element(checkboxes.nth(1)).not.toBeChecked();
		await expect.element(page.getByText('🍽️ 2 servings')).toBeInTheDocument();
	});

	it('should increment guest count when + clicked', async () => {
		renderPopover({ guestCovers: 0 });

		await page.getByRole('button', { name: 'Increase guests' }).click();

		await expect.element(page.getByText('🍽️ 4 servings')).toBeInTheDocument();
	});

	it('should decrement guest count when − clicked', async () => {
		renderPopover({ guestCovers: 2 });

		await page.getByRole('button', { name: 'Decrease guests' }).click();

		await expect.element(page.getByText('🍽️ 4 servings')).toBeInTheDocument();
	});

	it('should disable decrease button when guests is 0', async () => {
		renderPopover({ guestCovers: 0 });

		await expect
			.element(page.getByRole('button', { name: 'Decrease guests' }))
			.toBeDisabled();
	});

	it('should call onSave and onClose when Done clicked', async () => {
		const onSave = vi.fn();
		const onClose = vi.fn();
		renderPopover({ onSave, onClose });

		await page.getByRole('button', { name: 'Done' }).click();

		expect(onSave).toHaveBeenCalledOnce();
		expect(onClose).toHaveBeenCalledOnce();

		const savedAttendees = onSave.mock.calls[0][0] as MealAttendee[];
		expect(savedAttendees).toHaveLength(3);
		expect(savedAttendees.every((a: MealAttendee) => a.isAttending)).toBe(true);
		expect(onSave.mock.calls[0][1]).toBe(0);
	});

	it('should pass updated attendance when saving after toggle', async () => {
		const onSave = vi.fn();
		const onClose = vi.fn();
		renderPopover({ onSave, onClose });

		// Uncheck Sarah
		const checkboxes = page.getByRole('checkbox');
		await checkboxes.nth(1).click();

		await page.getByRole('button', { name: 'Done' }).click();

		const savedAttendees = onSave.mock.calls[0][0] as MealAttendee[];
		const sarah = savedAttendees.find((a: MealAttendee) => a.memberId === 'u2');
		expect(sarah?.isAttending).toBe(false);
	});

	it('should close when Escape is pressed', async () => {
		const onSave = vi.fn();
		const onClose = vi.fn();
		renderPopover({ onSave, onClose });

		await userEvent.keyboard('{Escape}');

		expect(onSave).toHaveBeenCalledOnce();
		expect(onClose).toHaveBeenCalledOnce();
	});
});
