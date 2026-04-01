import type { components } from "./api-types.js";

/** Recipe model from the API spec. */
export type Recipe = components["schemas"]["Recipe"];

/** Ingredient model from the API spec. */
export type Ingredient = components["schemas"]["Ingredient"];

/** Request body for creating a recipe. */
export type CreateRecipeRequest = components["schemas"]["CreateRecipeRequest"];

export type Household = {
    id: string;
    name: string;
    inviteCode: string;
    createdAt: string;
};

export type ShoppingItem = {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    isChecked: boolean;
};

export type ShoppingList = {
    id: string;
    householdId: string;
    mealPlanId: string;
    items: ShoppingItem[];
    createdAt: string;
};

export type MealSlot = {
    date: string;
    mealType: string;
    recipeId: string;
    servings: number;
};

export type MealPlan = {
    id: string;
    householdId: string;
    title: string;
    startDate: string;
    endDate: string;
    meals: MealSlot[];
    createdAt: string;
};

export type StoreCupboardItem = {
    name: string;
    category: string;
    alwaysStocked: boolean;
};

export type StoreCupboard = {
    id: string;
    householdId: string;
    items: StoreCupboardItem[];
    updatedAt: string;
};

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL ?? "/api";
type ApiFetch = (
    input: RequestInfo | URL,
    init?: RequestInit,
) => Promise<Response>;

/**
 * Typed fetch wrapper for the backend API.
 */
function createApiFetch(fetchImpl: ApiFetch) {
    return async function apiFetch<T>(
        path: string,
        options?: RequestInit,
    ): Promise<T> {
        const response = await fetchImpl(`${API_BASE}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status} ${response.statusText}`,
            );
        }

        return response.json() as Promise<T>;
    };
}

export function createApiClient(fetchImpl?: ApiFetch) {
    const apiFetch = createApiFetch((input, init) =>
        (fetchImpl ?? fetch)(input, init),
    );

    return {
        recipes: {
            list: () => apiFetch<Recipe[]>("/recipes"),
            get: (id: string) => apiFetch<Recipe>(`/recipes/${id}`),
            create: (recipe: CreateRecipeRequest) =>
                apiFetch<Recipe>("/recipes", {
                    method: "POST",
                    body: JSON.stringify(recipe),
                }),
        },
        household: {
            getCurrent: () => apiFetch<Household>("/household"),
        },
        shoppingList: {
            getCurrent: () => apiFetch<ShoppingList>("/shopping-list"),
        },
        mealPlan: {
            getCurrent: () => apiFetch<MealPlan>("/meal-plan"),
        },
        storeCupboard: {
            getCurrent: () => apiFetch<StoreCupboard>("/store-cupboard"),
        },
    };
}

export const recipes = createApiClient().recipes;
