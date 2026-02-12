namespace FussyEaterClub.Api;

/** A recipe in API responses. */
model Recipe {
  /** Recipe identifier. */
  id: string;

  /** Recipe title. */
  @minLength(1)
  @maxLength(200)
  title: string;

  /** Recipe description. */
  description?: string;

  /** Number of servings. */
  @minValue(1)
  servings: int32;

  /** Preparation time in minutes. */
  @minValue(1)
  prepTimeMinutes?: int32;

  /** Cooking time in minutes. */
  @minValue(1)
  cookTimeMinutes?: int32;

  /** List of ingredients. */
  @minItems(1)
  ingredients: Ingredient[];

  /** Cooking steps in order. */
  @minItems(1)
  steps: string[];

  /** Recipe tags. */
  tags: string[];

  /** Whether the recipe is publicly visible. */
  isPublic: boolean;
}

/** Request body for creating a new recipe. */
model CreateRecipeRequest {
  /** Recipe title. */
  @minLength(1)
  @maxLength(200)
  title: string;

  /** Recipe description. */
  description?: string;

  /** Number of servings. Defaults to 4. */
  @minValue(1)
  servings?: int32 = 4;

  /** Preparation time in minutes. */
  @minValue(1)
  prepTimeMinutes?: int32;

  /** Cooking time in minutes. */
  @minValue(1)
  cookTimeMinutes?: int32;

  /** List of ingredients. */
  @minItems(1)
  ingredients: Ingredient[];

  /** Cooking steps in order. */
  @minItems(1)
  steps: string[];

  /** Recipe tags. */
  tags?: string[];

  /** Whether the recipe is publicly visible. */
  isPublic?: boolean;
}
