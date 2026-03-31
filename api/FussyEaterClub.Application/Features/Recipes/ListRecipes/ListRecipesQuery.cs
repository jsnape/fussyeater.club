using MediatR;

namespace FussyEaterClub.Application.Features.Recipes.ListRecipes;

/// <summary>
/// Query to list all recipes for the current household.
/// </summary>
public sealed record ListRecipesQuery : IRequest<IReadOnlyList<RecipeDto>>;
