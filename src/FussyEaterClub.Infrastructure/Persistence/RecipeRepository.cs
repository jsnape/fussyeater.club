using FussyEaterClub.Domain.Entities;
using FussyEaterClub.Domain.Interfaces;
using Microsoft.Azure.Cosmos;

namespace FussyEaterClub.Infrastructure.Persistence;

/// <summary>
/// Cosmos DB implementation of <see cref="IRecipeRepository"/>.
/// </summary>
public sealed class RecipeRepository(CosmosContainerFactory containers) : IRecipeRepository
{
    private Container Container => containers.Recipes;

    /// <inheritdoc />
    public async Task<Recipe?> GetByIdAsync(string id, string householdId, CancellationToken cancellationToken = default)
    {
        try
        {
            ItemResponse<Recipe> response = await this.Container.ReadItemAsync<Recipe>(
                id,
                new PartitionKey(householdId),
                cancellationToken: cancellationToken);

            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Recipe>> GetByHouseholdAsync(string householdId, CancellationToken cancellationToken = default)
    {
        var query = new QueryDefinition("SELECT * FROM c WHERE c.householdId = @householdId")
            .WithParameter("@householdId", householdId);

        return await this.ExecuteQueryAsync(query, householdId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Recipe>> SearchPublicAsync(IEnumerable<string> tags, CancellationToken cancellationToken = default)
    {
        var tagList = tags.ToList();
        var query = new QueryDefinition("SELECT * FROM c WHERE c.isPublic = true AND ARRAY_LENGTH(SetIntersect(c.tags, @tags)) > 0")
            .WithParameter("@tags", tagList);

        return await this.ExecuteQueryAsync(query, partitionKey: null, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Recipe> CreateAsync(Recipe recipe, CancellationToken cancellationToken = default)
    {
        ItemResponse<Recipe> response = await this.Container.CreateItemAsync(
            recipe,
            new PartitionKey(recipe.HouseholdId),
            cancellationToken: cancellationToken);

        return response.Resource;
    }

    /// <inheritdoc />
    public async Task<Recipe> UpdateAsync(Recipe recipe, CancellationToken cancellationToken = default)
    {
        recipe.UpdatedAt = DateTimeOffset.UtcNow;

        ItemResponse<Recipe> response = await this.Container.ReplaceItemAsync(
            recipe,
            recipe.Id,
            new PartitionKey(recipe.HouseholdId),
            cancellationToken: cancellationToken);

        return response.Resource;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(string id, string householdId, CancellationToken cancellationToken = default)
    {
        await this.Container.DeleteItemAsync<Recipe>(
            id,
            new PartitionKey(householdId),
            cancellationToken: cancellationToken);
    }

    private async Task<IReadOnlyList<Recipe>> ExecuteQueryAsync(
        QueryDefinition queryDefinition,
        string? partitionKey,
        CancellationToken cancellationToken)
    {
        var options = partitionKey is not null
            ? new QueryRequestOptions { PartitionKey = new PartitionKey(partitionKey) }
            : null;

        using FeedIterator<Recipe> iterator = this.Container.GetItemQueryIterator<Recipe>(queryDefinition, requestOptions: options);

        var results = new List<Recipe>();

        while (iterator.HasMoreResults)
        {
            FeedResponse<Recipe> response = await iterator.ReadNextAsync(cancellationToken);
            results.AddRange(response);
        }

        return results;
    }
}
