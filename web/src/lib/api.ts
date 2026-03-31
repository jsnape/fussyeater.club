import type { components } from "./api-types.js";

/** Recipe model from the API spec. */
export type Recipe = components["schemas"]["Recipe"];

/** Ingredient model from the API spec. */
export type Ingredient = components["schemas"]["Ingredient"];

/** Request body for creating a recipe. */
export type CreateRecipeRequest = components["schemas"]["CreateRecipeRequest"];

const API_BASE = "/api";

/**
 * Typed fetch wrapper for the backend API.
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}

export const recipes = {
    list: () => apiFetch<Recipe[]>("/recipes"),
    get: (id: string) => apiFetch<Recipe>(`/recipes/${id}`),
    create: (recipe: CreateRecipeRequest) =>
        apiFetch<Recipe>("/recipes", {
            method: "POST",
            body: JSON.stringify(recipe),
        }),
};
