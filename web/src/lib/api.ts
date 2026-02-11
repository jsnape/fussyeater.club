const API_BASE = '/api';

/**
 * Typed fetch wrapper for the backend API.
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		},
		...options
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}

export interface Recipe {
	id: string;
	title: string;
	description?: string;
	servings: number;
	prepTimeMinutes?: number;
	cookTimeMinutes?: number;
	ingredients: Ingredient[];
	steps: string[];
	tags: string[];
	isPublic: boolean;
}

export interface Ingredient {
	name: string;
	quantity: number;
	unit: string;
	category: string;
	notes?: string;
}

export const recipes = {
	get: (id: string) => apiFetch<Recipe>(`/recipes/${id}`),
	create: (recipe: Omit<Recipe, 'id'>) =>
		apiFetch<Recipe>('/recipes', {
			method: 'POST',
			body: JSON.stringify(recipe)
		})
};
