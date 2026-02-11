using FussyEaterClub.Domain.Enums;

namespace FussyEaterClub.Domain.ValueObjects;

/// <summary>
/// A single meal in a meal plan — links a recipe to a specific day and meal type.
/// </summary>
/// <param name="Date">The date of the meal.</param>
/// <param name="MealType">Type of meal (Breakfast, Lunch, Dinner, Snack).</param>
/// <param name="RecipeId">Reference to the recipe.</param>
/// <param name="Servings">Number of servings to prepare.</param>
public sealed record MealSlot(
    DateOnly Date,
    MealType MealType,
    string RecipeId,
    int Servings);
