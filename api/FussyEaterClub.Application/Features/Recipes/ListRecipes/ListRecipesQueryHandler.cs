using FussyEaterClub.Application.Common.Interfaces;
using FussyEaterClub.Domain.Entities;
using FussyEaterClub.Domain.Interfaces;
using MediatR;

namespace FussyEaterClub.Application.Features.Recipes.ListRecipes;

/// <summary>
/// Handles listing all recipes for the current household.
/// </summary>
public sealed class ListRecipesQueryHandler(
    IRecipeRepository recipeRepository,
    ICurrentUserService currentUser) : IRequestHandler<ListRecipesQuery, IReadOnlyList<RecipeDto>>
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<RecipeDto>> Handle(ListRecipesQuery request, CancellationToken cancellationToken)
    {
        string householdId = currentUser.HouseholdId
            ?? throw new UnauthorizedAccessException("User is not associated with a household.");

        IReadOnlyList<Recipe> recipes = await recipeRepository.GetByHouseholdAsync(householdId, cancellationToken);

        return recipes
            .Select(recipe => new RecipeDto(
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
                IsPublic: recipe.IsPublic))
            .ToList();
    }
}
