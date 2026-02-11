using FussyEaterClub.Application.Features.Recipes;
using FussyEaterClub.Application.Features.Recipes.CreateRecipe;
using FussyEaterClub.Application.Features.Recipes.GetRecipe;
using MediatR;

namespace FussyEaterClub.Api.Endpoints;

/// <summary>
/// Maps recipe-related API endpoints.
/// </summary>
public static class RecipeEndpoints
{
    /// <summary>
    /// Maps recipe endpoints to the application.
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    /// <returns>The route group for chaining.</returns>
    public static RouteGroupBuilder MapRecipeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/recipes")
            .WithTags("Recipes")
            .RequireAuthorization();

        group.MapGet("/{id}", async (string id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            RecipeDto? result = await mediator.Send(new GetRecipeQuery(id), cancellationToken);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetRecipe")
        .Produces<RecipeDto>()
        .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (CreateRecipeCommand command, IMediator mediator, CancellationToken cancellationToken) =>
        {
            RecipeDto result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/api/recipes/{result.Id}", result);
        })
        .WithName("CreateRecipe")
        .Produces<RecipeDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        return group;
    }
}
