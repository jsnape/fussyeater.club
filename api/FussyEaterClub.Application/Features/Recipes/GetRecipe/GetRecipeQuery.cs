using MediatR;

namespace FussyEaterClub.Application.Features.Recipes.GetRecipe;

/// <summary>
/// Query to get a recipe by its identifier.
/// </summary>
/// <param name="Id">The recipe identifier.</param>
public sealed record GetRecipeQuery(string Id) : IRequest<RecipeDto?>;
