using FussyEaterClub.Domain.ValueObjects;

namespace FussyEaterClub.Domain.Entities;

/// <summary>
/// A member of a household — represents a person (possibly a fussy eater) within a family.
/// </summary>
public class Member
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public required string Id { get; set; }

    /// <summary>Gets or sets the household this member belongs to.</summary>
    public required string HouseholdId { get; set; }

    /// <summary>Gets or sets the Entra ID user identifier (null if child/non-login member).</summary>
    public string? UserId { get; set; }

    /// <summary>Gets or sets the display name.</summary>
    public required string DisplayName { get; set; }

    /// <summary>Gets or sets the member's food preferences (dislikes, allergies).</summary>
    public FoodPreference Preferences { get; set; } = new([], []);
}
