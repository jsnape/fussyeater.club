namespace FussyEaterClub.Api;

/** A planned meal entry for a specific date. */
model MealSlot {
  /** Date for this planned meal (YYYY-MM-DD). */
  date: plainDate;

  /** Meal type label. */
  mealType: string;

  /** Linked recipe identifier. */
  recipeId: string;

  /** Number of servings planned. */
  @minValue(1)
  servings: int32;
}

/** Current meal plan for a household. */
model MealPlan {
  /** Meal plan identifier. */
  id: string;

  /** Owning household identifier. */
  householdId: string;

  /** Meal plan title. */
  @minLength(1)
  @maxLength(200)
  title: string;

  /** Meal plan start date (YYYY-MM-DD). */
  startDate: plainDate;

  /** Meal plan end date (YYYY-MM-DD). */
  endDate: plainDate;

  /** Planned meals for the period. */
  meals: MealSlot[];

  /** ISO timestamp when this meal plan was created. */
  createdAt: utcDateTime;
}

/** Request body for creating or updating the current meal plan. */
model UpsertMealPlanRequest {
  /** Meal plan title. */
  @minLength(1)
  @maxLength(200)
  title: string;

  /** Meal plan start date (YYYY-MM-DD). */
  startDate: plainDate;

  /** Meal plan end date (YYYY-MM-DD). */
  endDate: plainDate;

  /** Planned meals for the period. */
  meals: MealSlot[];
}
