namespace FussyEaterClub.Application.Features.Recipes;

/// <summary>
/// DTO representing a recipe in API responses.
/// </summary>
/// <param name="Id">Recipe identifier.</param>
/// <param name="Title">Recipe title.</param>
/// <param name="Description">Recipe description.</param>
/// <param name="Servings">Number of servings.</param>
/// <param name="PrepTimeMinutes">Preparation time in minutes.</param>
/// <param name="CookTimeMinutes">Cooking time in minutes.</param>
/// <param name="Ingredients">List of ingredients.</param>
/// <param name="Steps">Cooking steps in order.</param>
/// <param name="Tags">Recipe tags.</param>
/// <param name="IsPublic">Whether the recipe is public.</param>
public sealed record RecipeDto(
    string Id,
    string Title,
    string? Description,
    int Servings,
    int? PrepTimeMinutes,
    int? CookTimeMinutes,
    IReadOnlyList<IngredientDto> Ingredients,
    IReadOnlyList<string> Steps,
    IReadOnlyList<string> Tags,
    bool IsPublic);
