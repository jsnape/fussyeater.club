using FussyEaterClub.Domain.Enums;

namespace FussyEaterClub.Domain.ValueObjects;

/// <summary>
/// An item on a shopping list.
/// </summary>
/// <param name="Name">Ingredient name.</param>
/// <param name="Quantity">Total quantity needed.</param>
/// <param name="Unit">Measurement unit.</param>
/// <param name="Category">Food category for grouping.</param>
/// <param name="IsChecked">Whether the item has been ticked off.</param>
public sealed record ShoppingItem(
    string Name,
    decimal Quantity,
    Unit Unit,
    FoodCategory Category,
    bool IsChecked = false);
