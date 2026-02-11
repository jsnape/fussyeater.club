using FussyEaterClub.Application.Common.Interfaces;
using FussyEaterClub.Domain.Entities;
using FussyEaterClub.Domain.Interfaces;
using FussyEaterClub.Domain.ValueObjects;
using MediatR;

namespace FussyEaterClub.Application.Features.Recipes.CreateRecipe;

/// <summary>
/// Handles creating a new recipe.
/// </summary>
public sealed class CreateRecipeCommandHandler(
    IRecipeRepository recipeRepository,
    ICurrentUserService currentUser) : IRequestHandler<CreateRecipeCommand, RecipeDto>
{
    /// <inheritdoc />
    public async Task<RecipeDto> Handle(CreateRecipeCommand request, CancellationToken cancellationToken)
    {
        string householdId = currentUser.HouseholdId
            ?? throw new UnauthorizedAccessException("User is not associated with a household.");

        var recipe = new Recipe
        {
            Id = Guid.NewGuid().ToString(),
            HouseholdId = householdId,
            Title = request.Title,
            Description = request.Description,
            Servings = request.Servings,
            PrepTimeMinutes = request.PrepTimeMinutes,
            CookTimeMinutes = request.CookTimeMinutes,
            Ingredients = request.Ingredients
                .Select(i => new Ingredient(i.Name, i.Quantity, i.Unit, i.Category, i.Notes))
                .ToList(),
            Steps = request.Steps,
            Tags = request.Tags,
            IsPublic = request.IsPublic,
        };

        Recipe created = await recipeRepository.CreateAsync(recipe, cancellationToken);

        return MapToDto(created);
    }

    private static RecipeDto MapToDto(Recipe recipe) => new(
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
