using FussyEaterClub.Domain.ValueObjects;

namespace FussyEaterClub.Domain.Entities;

/// <summary>
/// A shopping list generated from a meal plan, adjusted for store cupboard items.
/// </summary>
public class ShoppingList
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public required string Id { get; set; }

    /// <summary>Gets or sets the owning household identifier.</summary>
    public required string HouseholdId { get; set; }

    /// <summary>Gets or sets the meal plan this list was generated from.</summary>
    public required string MealPlanId { get; set; }

    /// <summary>Gets or sets the shopping items.</summary>
    public List<ShoppingItem> Items { get; set; } = [];

    /// <summary>Gets or sets when the list was generated.</summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
