namespace FussyEaterClub.Api;

/**
 * An ingredient with quantity and unit.
 *
 * Note: Quantity is represented as float64 in the spec. The C# domain model
 * uses `decimal` for precision; consumers should treat this as a decimal value.
 */
model Ingredient {
  /** Ingredient name. */
  @minLength(1)
  name: string;

  /** Amount required. */
  @minValue(0)
  quantity: float64;

  /** Measurement unit. */
  unit: Unit;

  /** Food category for shopping list grouping. */
  category: FoodCategory;

  /** Optional preparation notes (e.g., "finely chopped"). */
  notes?: string;
}
