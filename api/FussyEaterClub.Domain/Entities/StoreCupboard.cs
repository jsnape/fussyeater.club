using FussyEaterClub.Domain.ValueObjects;

namespace FussyEaterClub.Domain.Entities;

/// <summary>
/// A household's store cupboard — items they always keep stocked.
/// </summary>
public class StoreCupboard
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public required string Id { get; set; }

    /// <summary>Gets or sets the owning household identifier.</summary>
    public required string HouseholdId { get; set; }

    /// <summary>Gets or sets the store cupboard items.</summary>
    public List<StoreCupboardItem> Items { get; set; } = [];
}
