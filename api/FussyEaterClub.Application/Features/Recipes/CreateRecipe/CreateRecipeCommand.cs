using MediatR;

namespace FussyEaterClub.Application.Features.Recipes.CreateRecipe;

/// <summary>
/// Command to create a new recipe.
/// </summary>
public sealed record CreateRecipeCommand : IRequest<RecipeDto>
{
    /// <summary>Gets the recipe title.</summary>
    public required string Title { get; init; }

    /// <summary>Gets the recipe description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the number of servings.</summary>
    public int Servings { get; init; } = 4;

    /// <summary>Gets the preparation time in minutes.</summary>
    public int? PrepTimeMinutes { get; init; }

    /// <summary>Gets the cooking time in minutes.</summary>
    public int? CookTimeMinutes { get; init; }

    /// <summary>Gets the ingredients.</summary>
    public List<IngredientDto> Ingredients { get; init; } = [];

    /// <summary>Gets the cooking steps.</summary>
    public List<string> Steps { get; init; } = [];

    /// <summary>Gets the tags.</summary>
    public List<string> Tags { get; init; } = [];

    /// <summary>Gets a value indicating whether this recipe is public.</summary>
    public bool IsPublic { get; init; }
}
