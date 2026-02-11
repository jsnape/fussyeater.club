using FussyEaterClub.Domain.ValueObjects;

namespace FussyEaterClub.Domain.Entities;

/// <summary>
/// A recipe — the core content entity.
/// </summary>
public class Recipe
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public required string Id { get; set; }

    /// <summary>Gets or sets the owning household identifier.</summary>
    public required string HouseholdId { get; set; }

    /// <summary>Gets or sets the recipe title.</summary>
    public required string Title { get; set; }

    /// <summary>Gets or sets the recipe description/intro.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the number of servings.</summary>
    public int Servings { get; set; } = 4;

    /// <summary>Gets or sets the preparation time in minutes.</summary>
    public int? PrepTimeMinutes { get; set; }

    /// <summary>Gets or sets the cooking time in minutes.</summary>
    public int? CookTimeMinutes { get; set; }

    /// <summary>Gets or sets the list of ingredients.</summary>
    public List<Ingredient> Ingredients { get; set; } = [];

    /// <summary>Gets or sets the cooking steps in order.</summary>
    public List<string> Steps { get; set; } = [];

    /// <summary>Gets or sets tags for filtering and categorisation.</summary>
    public List<string> Tags { get; set; } = [];

    /// <summary>Gets or sets a value indicating whether this recipe is publicly visible.</summary>
    public bool IsPublic { get; set; }

    /// <summary>Gets or sets when the recipe was created.</summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>Gets or sets when the recipe was last updated.</summary>
    public DateTimeOffset? UpdatedAt { get; set; }
}
