using FussyEaterClub.Domain.Enums;

namespace FussyEaterClub.Domain.ValueObjects;

/// <summary>
/// An item in the household's store cupboard.
/// </summary>
/// <param name="Name">Item name.</param>
/// <param name="Category">Food category.</param>
/// <param name="AlwaysStocked">If true, this item is excluded from shopping lists automatically.</param>
public sealed record StoreCupboardItem(
    string Name,
    FoodCategory Category,
    bool AlwaysStocked = true);
