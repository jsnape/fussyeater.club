using Microsoft.Azure.Cosmos;

namespace FussyEaterClub.Infrastructure.Persistence;

/// <summary>
/// Provides access to Cosmos DB containers.
/// </summary>
public sealed class CosmosContainerFactory
{
    private readonly CosmosClient cosmosClient;
    private readonly string databaseName;

    /// <summary>
    /// Initializes a new instance of the <see cref="CosmosContainerFactory"/> class.
    /// </summary>
    /// <param name="cosmosClient">The Cosmos DB client.</param>
    /// <param name="databaseName">The database name.</param>
    public CosmosContainerFactory(CosmosClient cosmosClient, string databaseName)
    {
        this.cosmosClient = cosmosClient;
        this.databaseName = databaseName;
    }

    /// <summary>Gets the recipes container.</summary>
    public Container Recipes => this.cosmosClient.GetContainer(this.databaseName, "recipes");

    /// <summary>Gets the households container.</summary>
    public Container Households => this.cosmosClient.GetContainer(this.databaseName, "households");

    /// <summary>Gets the meal-plans container.</summary>
    public Container MealPlans => this.cosmosClient.GetContainer(this.databaseName, "meal-plans");

    /// <summary>Gets the shopping-lists container.</summary>
    public Container ShoppingLists => this.cosmosClient.GetContainer(this.databaseName, "shopping-lists");
}
