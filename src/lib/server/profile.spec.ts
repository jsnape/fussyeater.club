import { afterEach, describe, expect, it } from 'vitest';
import { createTestDbPair } from './test-db';
import {
	createDependent,
	deleteDependent,
	getProfilesForHousehold,
	getProfileForMember,
	getHouseholdSettings,
	saveProfile,
	updateDependent,
	updateHouseholdSettings,
	validateDependentInput,
	validateProfileInput
} from './profile';

describe('profile', () => {
	const pairs: Array<ReturnType<typeof createTestDbPair>> = [];

	afterEach(() => {
		for (const pair of pairs.splice(0)) {
			pair.cleanup();
		}
	});

	async function seedHousehold(pair: ReturnType<typeof createTestDbPair>): Promise<void> {
		await pair.first
			.prepare(
				`INSERT INTO users (id, email, name, auth_provider) VALUES ('user-1', 'a@test.com', 'Alice', 'password')`
			)
			.run();
		await pair.first
			.prepare(
				`INSERT INTO users (id, email, name, auth_provider) VALUES ('user-2', 'b@test.com', 'Bob', 'password')`
			)
			.run();
		await pair.first
			.prepare(
				`INSERT INTO households (id, owner_user_id, name) VALUES ('hh-1', 'user-1', 'Test Family')`
			)
			.run();
		await pair.first
			.prepare(
				`INSERT INTO household_memberships (user_id, household_id, role) VALUES ('user-1', 'hh-1', 'owner')`
			)
			.run();
		await pair.first
			.prepare(
				`INSERT INTO household_memberships (user_id, household_id, role) VALUES ('user-2', 'hh-1', 'member')`
			)
			.run();
	}

	describe('getProfilesForHousehold', () => {
		it('should return empty array when no profiles exist', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles).toEqual([]);
		});

		it('should return all profiles for a household', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			await saveProfile(pair.first, 'user-1', 'hh-1', {
				allergies: [{ ingredient: 'Peanuts', severity: 'severe' }],
				textures: ['Mushy'],
				safeFoods: ['Pasta'],
				dislikes: ['Broccoli']
			});
			await saveProfile(pair.first, 'user-2', 'hh-1', {
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			});

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles).toHaveLength(2);
			expect(profiles[0].name).toBe('Alice');
			expect(profiles[0].allergies).toEqual([{ ingredient: 'Peanuts', severity: 'severe' }]);
			expect(profiles[1].name).toBe('Bob');
		});
	});

	describe('getProfileForMember', () => {
		it('should return null for non-existent profile', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const profile = await getProfileForMember(pair.first, 'user-1', 'hh-1');
			expect(profile).toBeNull();
		});

		it('should return profile for existing member', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			await saveProfile(pair.first, 'user-1', 'hh-1', {
				allergies: [{ ingredient: 'Dairy', severity: 'moderate' }],
				textures: ['Slimy', 'Crunchy'],
				safeFoods: ['Rice', 'Chicken'],
				dislikes: ['Mushrooms']
			});

			const profile = await getProfileForMember(pair.first, 'user-1', 'hh-1');
			expect(profile).not.toBeNull();
			expect(profile!.userId).toBe('user-1');
			expect(profile!.allergies).toEqual([{ ingredient: 'Dairy', severity: 'moderate' }]);
			expect(profile!.textures).toEqual(['Slimy', 'Crunchy']);
			expect(profile!.safeFoods).toEqual(['Rice', 'Chicken']);
			expect(profile!.dislikes).toEqual(['Mushrooms']);
		});
	});

	describe('saveProfile', () => {
		it('should upsert a profile', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			await saveProfile(pair.first, 'user-1', 'hh-1', {
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			});

			let profile = await getProfileForMember(pair.first, 'user-1', 'hh-1');
			expect(profile!.allergies).toEqual([]);

			await saveProfile(pair.first, 'user-1', 'hh-1', {
				allergies: [{ ingredient: 'Eggs', severity: 'mild' }],
				textures: ['Grainy'],
				safeFoods: ['Toast'],
				dislikes: ['Onions']
			});

			profile = await getProfileForMember(pair.first, 'user-1', 'hh-1');
			expect(profile!.allergies).toEqual([{ ingredient: 'Eggs', severity: 'mild' }]);
			expect(profile!.textures).toEqual(['Grainy']);
		});
	});

	describe('householdSettings', () => {
		it('should return false when no settings exist', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const settings = await getHouseholdSettings(pair.first, 'hh-1');
			expect(settings.syncProfilesEnabled).toBe(false);
		});

		it('should update and retrieve settings', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			await updateHouseholdSettings(pair.first, 'hh-1', true);
			let settings = await getHouseholdSettings(pair.first, 'hh-1');
			expect(settings.syncProfilesEnabled).toBe(true);

			await updateHouseholdSettings(pair.first, 'hh-1', false);
			settings = await getHouseholdSettings(pair.first, 'hh-1');
			expect(settings.syncProfilesEnabled).toBe(false);
		});
	});

	describe('validateProfileInput', () => {
		it('should accept valid input', () => {
			const result = validateProfileInput({
				allergies: [{ ingredient: 'Peanuts', severity: 'severe' }],
				textures: ['Mushy'],
				safeFoods: ['Pasta'],
				dislikes: ['Broccoli']
			});
			expect(result.valid).toBe(true);
		});

		it('should reject invalid allergy severity', () => {
			const result = validateProfileInput({
				allergies: [{ ingredient: 'Peanuts', severity: 'extreme' }],
				textures: [],
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(false);
		});

		it('should reject non-array textures', () => {
			const result = validateProfileInput({
				allergies: [],
				textures: 'Mushy',
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(false);
		});

		it('should reject missing body', () => {
			const result = validateProfileInput(null);
			expect(result.valid).toBe(false);
		});

		it('should trim and filter empty strings', () => {
			const result = validateProfileInput({
				allergies: [{ ingredient: '  Milk  ', severity: 'mild' }],
				textures: ['  Slimy  ', ''],
				safeFoods: ['  Pasta  ', '  '],
				dislikes: ['  Onions  ']
			});
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.data.allergies[0].ingredient).toBe('Milk');
				expect(result.data.textures).toEqual(['Slimy']);
				expect(result.data.safeFoods).toEqual(['Pasta']);
				expect(result.data.dislikes).toEqual(['Onions']);
			}
		});
	});

	describe('createDependent', () => {
		it('should create a dependent and return id', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const dependentId = await createDependent(pair.first, 'hh-1', {
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: [],
				safeFoods: [],
				dislikes: []
			});

			expect(dependentId).toEqual(expect.any(String));
			expect(dependentId).toBeTruthy();
		});

		it('should include dependent in getProfilesForHousehold', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			await createDependent(pair.first, 'hh-1', {
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Yogurt'],
				dislikes: ['Spinach']
			});

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles).toHaveLength(1);
			expect(profiles[0]).toMatchObject({
				name: 'Charlie',
				role: 'dependent',
				isDependent: true,
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Yogurt'],
				dislikes: ['Spinach']
			});
			expect(profiles[0].userId.startsWith('dep-')).toBe(true);
		});
	});

	describe('updateDependent', () => {
		it('should update dependent fields', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const dependentId = await createDependent(pair.first, 'hh-1', {
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Toast'],
				dislikes: ['Peas']
			});

			const updated = await updateDependent(pair.first, dependentId, 'hh-1', {
				name: 'Charlotte',
				allergies: [{ ingredient: 'Eggs', severity: 'moderate' }],
				textures: ['Crunchy'],
				safeFoods: ['Rice'],
				dislikes: ['Beans']
			});

			expect(updated).toBe(true);

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles).toHaveLength(1);
			expect(profiles[0]).toMatchObject({
				name: 'Charlotte',
				allergies: [{ ingredient: 'Eggs', severity: 'moderate' }],
				textures: ['Crunchy'],
				safeFoods: ['Rice'],
				dislikes: ['Beans']
			});
		});

		it('should return false for non-existent dependent', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const updated = await updateDependent(pair.first, 'missing-dependent', 'hh-1', {
				name: 'Charlotte',
				allergies: [{ ingredient: 'Eggs', severity: 'moderate' }],
				textures: [],
				safeFoods: [],
				dislikes: []
			});

			expect(updated).toBe(false);
		});

		it('should not update dependent in different household', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const dependentId = await createDependent(pair.first, 'hh-1', {
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Toast'],
				dislikes: ['Peas']
			});

			const updated = await updateDependent(pair.first, dependentId, 'hh-2', {
				name: 'Charlotte',
				allergies: [{ ingredient: 'Eggs', severity: 'moderate' }],
				textures: ['Crunchy'],
				safeFoods: ['Rice'],
				dislikes: ['Beans']
			});

			expect(updated).toBe(false);

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles[0]).toMatchObject({
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Toast'],
				dislikes: ['Peas']
			});
		});
	});

	describe('deleteDependent', () => {
		it('should delete a dependent', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const dependentId = await createDependent(pair.first, 'hh-1', {
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Toast'],
				dislikes: ['Peas']
			});

			const deleted = await deleteDependent(pair.first, dependentId, 'hh-1');
			expect(deleted).toBe(true);

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles).toEqual([]);
		});

		it('should return false for non-existent dependent', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			const deleted = await deleteDependent(pair.first, 'missing-dependent', 'hh-1');
			expect(deleted).toBe(false);
		});
	});

	describe('validateDependentInput', () => {
		it('should accept valid input with name', () => {
			const result = validateDependentInput({
				name: 'Charlie',
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(true);
		});

		it('should reject missing name', () => {
			const result = validateDependentInput({
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(false);
		});

		it('should reject empty name', () => {
			const result = validateDependentInput({
				name: '   ',
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(false);
		});

		it('should reject invalid allergy in dependent input', () => {
			const result = validateDependentInput({
				name: 'Charlie',
				allergies: [{ ingredient: 'Peanuts', severity: 'extreme' }],
				textures: [],
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(false);
		});

		it('should trim name', () => {
			const result = validateDependentInput({
				name: '  Charlie  ',
				allergies: [],
				textures: [],
				safeFoods: [],
				dislikes: []
			});
			expect(result.valid).toBe(true);
			if (result.valid) {
				expect(result.data.name).toBe('Charlie');
			}
		});
	});

	describe('getProfilesForHousehold with dependents', () => {
		it('should return both member and dependent profiles', async () => {
			const pair = createTestDbPair();
			pairs.push(pair);
			await seedHousehold(pair);

			await saveProfile(pair.first, 'user-1', 'hh-1', {
				allergies: [{ ingredient: 'Peanuts', severity: 'severe' }],
				textures: ['Mushy'],
				safeFoods: ['Pasta'],
				dislikes: ['Broccoli']
			});
			await createDependent(pair.first, 'hh-1', {
				name: 'Charlie',
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Yogurt'],
				dislikes: ['Spinach']
			});

			const profiles = await getProfilesForHousehold(pair.first, 'hh-1');
			expect(profiles).toHaveLength(2);
			expect(profiles[0]).toMatchObject({
				userId: 'user-1',
				name: 'Alice',
				role: 'owner',
				allergies: [{ ingredient: 'Peanuts', severity: 'severe' }],
				textures: ['Mushy'],
				safeFoods: ['Pasta'],
				dislikes: ['Broccoli']
			});
			expect(profiles[1]).toMatchObject({
				name: 'Charlie',
				role: 'dependent',
				isDependent: true,
				allergies: [{ ingredient: 'Dairy', severity: 'mild' }],
				textures: ['Soft'],
				safeFoods: ['Yogurt'],
				dislikes: ['Spinach']
			});
			expect(profiles[1].userId.startsWith('dep-')).toBe(true);
		});
	});
});
