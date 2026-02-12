namespace FussyEaterClub.Api;

/** Common dietary restrictions. */
enum DietaryRestriction {
  /** No dietary restriction. */
  None,

  /** Vegetarian diet. */
  Vegetarian,

  /** Vegan diet. */
  Vegan,

  /** Gluten-free diet. */
  GlutenFree,

  /** Dairy-free diet. */
  DairyFree,

  /** Nut-free diet. */
  NutFree,

  /** Egg-free diet. */
  EggFree,

  /** Shellfish-free diet. */
  ShellfishFree,

  /** Soy-free diet. */
  SoyFree,

  /** Halal diet. */
  Halal,

  /** Kosher diet. */
  Kosher,
}

/** Category of food item for grouping in shopping lists. */
enum FoodCategory {
  /** Fruits and vegetables. */
  FruitAndVeg,

  /** Meat and poultry. */
  Meat,

  /** Fish and seafood. */
  Fish,

  /** Dairy products. */
  Dairy,

  /** Bakery items. */
  Bakery,

  /** Grains, pasta, rice. */
  Grains,

  /** Canned and jarred goods. */
  Canned,

  /** Frozen foods. */
  Frozen,

  /** Herbs and spices. */
  HerbsAndSpices,

  /** Oils, sauces, condiments. */
  Condiments,

  /** Drinks and beverages. */
  Drinks,

  /** Snacks and confectionery. */
  Snacks,

  /** Other or uncategorised. */
  Other,
}

/** Type of meal in a day. */
enum MealType {
  /** Breakfast meal. */
  Breakfast,

  /** Lunch meal. */
  Lunch,

  /** Dinner meal. */
  Dinner,

  /** Snack. */
  Snack,
}

/** Unit of measurement for ingredients. */
enum Unit {
  /** No specific unit (e.g., "2 eggs"). */
  Piece,

  /** Grams. */
  Grams,

  /** Kilograms. */
  Kilograms,

  /** Millilitres. */
  Millilitres,

  /** Litres. */
  Litres,

  /** Teaspoon. */
  Teaspoon,

  /** Tablespoon. */
  Tablespoon,

  /** Cup. */
  Cup,

  /** A pinch. */
  Pinch,

  /** A handful. */
  Handful,
}
