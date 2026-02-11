using FussyEaterClub.Domain.Entities;

namespace FussyEaterClub.Domain.Interfaces;

/// <summary>
/// Repository for household operations.
/// </summary>
public interface IHouseholdRepository
{
    /// <summary>Gets a household by its identifier.</summary>
    /// <param name="id">The household identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The household if found; otherwise <see langword="null"/>.</returns>
    Task<Household?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    /// <summary>Gets a household by invite code.</summary>
    /// <param name="inviteCode">The unique invite code.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The household if found; otherwise <see langword="null"/>.</returns>
    Task<Household?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default);

    /// <summary>Creates a new household.</summary>
    /// <param name="household">The household to create.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The created household.</returns>
    Task<Household> CreateAsync(Household household, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing household.</summary>
    /// <param name="household">The household to update.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated household.</returns>
    Task<Household> UpdateAsync(Household household, CancellationToken cancellationToken = default);
}
