namespace FussyEaterClub.Api;

/** Item on a shopping list. */
model ShoppingItem {
  /** Item name. */
  @minLength(1)
  name: string;

  /** Quantity to purchase. */
  @minValue(0)
  quantity: float64;

  /** Unit label for quantity. */
  unit: string;

  /** Category label for grouping. */
  category: string;

  /** Whether the item has been checked off. */
  isChecked: boolean;
}

/** Current shopping list for a household. */
model ShoppingList {
  /** Shopping list identifier. */
  id: string;

  /** Owning household identifier. */
  householdId: string;

  /** Linked meal plan identifier. */
  mealPlanId: string;

  /** Shopping list items. */
  items: ShoppingItem[];

  /** ISO timestamp when this list was created or updated. */
  createdAt: utcDateTime;
}

/** Request body for creating or updating the current shopping list. */
model UpsertShoppingListRequest {
  /** Linked meal plan identifier. */
  @minLength(1)
  mealPlanId: string;

  /** Shopping list items. */
  items: ShoppingItem[];
}
