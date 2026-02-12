import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recipes } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
	mockFetch.mockReset();
});

describe('apiFetch', () => {
	it('should set Content-Type to application/json', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({})
		});

		await recipes.get('123');

		expect(mockFetch).toHaveBeenCalledWith(
			'/api/recipes/123',
			expect.objectContaining({
				headers: expect.objectContaining({
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('should throw on non-OK response', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 404,
			statusText: 'Not Found'
		});

		await expect(recipes.get('missing')).rejects.toThrow('API error: 404 Not Found');
	});

	it('should return parsed JSON on success', async () => {
		const recipe = { id: '1', title: 'Pasta', servings: 4 };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(recipe)
		});

		const result = await recipes.get('1');

		expect(result).toEqual(recipe);
	});
});

describe('recipes.create', () => {
	it('should POST with JSON body', async () => {
		const newRecipe = {
			title: 'Toast',
			servings: 2,
			ingredients: [],
			steps: ['Put bread in toaster'],
			tags: ['easy'],
			isPublic: false
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ id: '99', ...newRecipe })
		});

		await recipes.create(newRecipe);

		expect(mockFetch).toHaveBeenCalledWith(
			'/api/recipes',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify(newRecipe),
				headers: expect.objectContaining({
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('should return the created recipe with id', async () => {
		const newRecipe = {
			title: 'Beans on Toast',
			servings: 1,
			ingredients: [],
			steps: ['Open tin', 'Heat beans', 'Toast bread'],
			tags: ['quick'],
			isPublic: true
		};
		const created = { id: '42', ...newRecipe };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(created)
		});

		const result = await recipes.create(newRecipe);

		expect(result).toEqual(created);
		expect(result.id).toBe('42');
	});
});
