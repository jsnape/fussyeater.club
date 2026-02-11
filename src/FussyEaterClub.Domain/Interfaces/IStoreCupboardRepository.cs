using FussyEaterClub.Domain.Entities;

namespace FussyEaterClub.Domain.Interfaces;

/// <summary>
/// Repository for store cupboard operations.
/// </summary>
public interface IStoreCupboardRepository
{
    /// <summary>Gets the store cupboard for a household.</summary>
    /// <param name="householdId">The household identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The store cupboard if found; otherwise <see langword="null"/>.</returns>
    Task<StoreCupboard?> GetByHouseholdAsync(string householdId, CancellationToken cancellationToken = default);

    /// <summary>Creates or replaces a store cupboard.</summary>
    /// <param name="storeCupboard">The store cupboard to upsert.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The created or updated store cupboard.</returns>
    Task<StoreCupboard> UpsertAsync(StoreCupboard storeCupboard, CancellationToken cancellationToken = default);
}
