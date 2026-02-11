namespace FussyEaterClub.Api.Endpoints;

/// <summary>
/// Maps health check endpoints.
/// </summary>
public static class HealthEndpoints
{
    /// <summary>
    /// Maps health check endpoints to the application.
    /// </summary>
    /// <param name="app">The endpoint route builder.</param>
    /// <returns>The route group for chaining.</returns>
    public static RouteGroupBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/health")
            .WithTags("Health")
            .AllowAnonymous();

        group.MapGet("/", () => Results.Ok(new { Status = "Healthy" }))
            .WithName("HealthCheck");

        return group;
    }
}
