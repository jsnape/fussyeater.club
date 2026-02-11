using FussyEaterClub.Application.Common.Interfaces;
using FussyEaterClub.Domain.Entities;
using FussyEaterClub.Domain.Interfaces;
using MediatR;

namespace FussyEaterClub.Application.Features.Recipes.GetRecipe;

/// <summary>
/// Handles getting a recipe by identifier.
/// </summary>
public sealed class GetRecipeQueryHandler(
    IRecipeRepository recipeRepository,
    ICurrentUserService currentUser) : IRequestHandler<GetRecipeQuery, RecipeDto?>
{
    /// <inheritdoc />
    public async Task<RecipeDto?> Handle(GetRecipeQuery request, CancellationToken cancellationToken)
    {
        string householdId = currentUser.HouseholdId
            ?? throw new UnauthorizedAccessException("User is not associated with a household.");

        Recipe? recipe = await recipeRepository.GetByIdAsync(request.Id, householdId, cancellationToken);

        if (recipe is null)
        {
            return null;
        }

        return new RecipeDto(
            Id: recipe.Id,
            Title: recipe.Title,
            Description: recipe.Description,
            Servings: recipe.Servings,
            PrepTimeMinutes: recipe.PrepTimeMinutes,
            CookTimeMinutes: recipe.CookTimeMinutes,
            Ingredients: recipe.Ingredients
                .Select(i => new IngredientDto(i.Name, i.Quantity, i.Unit, i.Category, i.Notes))
                .ToList(),
            Steps: recipe.Steps,
            Tags: recipe.Tags,
            IsPublic: recipe.IsPublic);
    }
}
