using FussyEaterClub.Domain.Entities;

namespace FussyEaterClub.Domain.Interfaces;

/// <summary>
/// Repository for recipe operations.
/// </summary>
public interface IRecipeRepository
{
    /// <summary>Gets a recipe by its identifier.</summary>
    /// <param name="id">The recipe identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The recipe if found; otherwise <see langword="null"/>.</returns>
    Task<Recipe?> GetByIdAsync(string id, string householdId, CancellationToken cancellationToken = default);

    /// <summary>Gets all recipes for a household.</summary>
    /// <param name="householdId">The household identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A read-only list of recipes belonging to the household.</returns>
    Task<IReadOnlyList<Recipe>> GetByHouseholdAsync(string householdId, CancellationToken cancellationToken = default);

    /// <summary>Searches public recipes by tags.</summary>
    /// <param name="tags">The tags to filter by.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A read-only list of matching public recipes.</returns>
    Task<IReadOnlyList<Recipe>> SearchPublicAsync(IEnumerable<string> tags, CancellationToken cancellationToken = default);

    /// <summary>Creates a new recipe.</summary>
    /// <param name="recipe">The recipe to create.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The created recipe.</returns>
    Task<Recipe> CreateAsync(Recipe recipe, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing recipe.</summary>
    /// <param name="recipe">The recipe to update.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated recipe.</returns>
    Task<Recipe> UpdateAsync(Recipe recipe, CancellationToken cancellationToken = default);

    /// <summary>Deletes a recipe.</summary>
    /// <param name="id">The recipe identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(string id, string householdId, CancellationToken cancellationToken = default);
}
