using FussyEaterClub.Application.Common.Interfaces;
using FussyEaterClub.Domain.Interfaces;
using FussyEaterClub.Infrastructure.Identity;
using FussyEaterClub.Infrastructure.Persistence;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FussyEaterClub.Infrastructure;

/// <summary>
/// Registers Infrastructure layer services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Infrastructure layer services to the DI container.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Cosmos DB
        string connectionString = configuration.GetConnectionString("CosmosDb")
            ?? throw new InvalidOperationException("CosmosDb connection string is not configured.");

        string databaseName = configuration.GetValue<string>("CosmosDb:DatabaseName") ?? "fussy-eater-club";

        services.AddSingleton(sp =>
        {
            var options = new CosmosClientOptions
            {
                SerializerOptions = new CosmosSerializationOptions
                {
                    PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase,
                },
            };

            return new CosmosClient(connectionString, options);
        });

        services.AddSingleton(sp =>
            new CosmosContainerFactory(sp.GetRequiredService<CosmosClient>(), databaseName));

        // Repositories
        services.AddScoped<IRecipeRepository, RecipeRepository>();

        // Identity
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}
