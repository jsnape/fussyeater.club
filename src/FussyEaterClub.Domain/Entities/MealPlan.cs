using FussyEaterClub.Domain.ValueObjects;

namespace FussyEaterClub.Domain.Entities;

/// <summary>
/// A meal plan spanning multiple days for a household.
/// </summary>
public class MealPlan
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public required string Id { get; set; }

    /// <summary>Gets or sets the owning household identifier.</summary>
    public required string HouseholdId { get; set; }

    /// <summary>Gets or sets the plan title (e.g., "Week of 10 Feb").</summary>
    public required string Title { get; set; }

    /// <summary>Gets or sets the plan start date.</summary>
    public DateOnly StartDate { get; set; }

    /// <summary>Gets or sets the plan end date.</summary>
    public DateOnly EndDate { get; set; }

    /// <summary>Gets or sets the individual meal slots.</summary>
    public List<MealSlot> Meals { get; set; } = [];

    /// <summary>Gets or sets when the meal plan was created.</summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
