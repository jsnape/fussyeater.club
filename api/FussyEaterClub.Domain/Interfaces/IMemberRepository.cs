using FussyEaterClub.Domain.Entities;

namespace FussyEaterClub.Domain.Interfaces;

/// <summary>
/// Repository for member operations.
/// </summary>
public interface IMemberRepository
{
    /// <summary>Gets a member by identifier.</summary>
    /// <param name="id">The member identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The member if found; otherwise <see langword="null"/>.</returns>
    Task<Member?> GetByIdAsync(string id, string householdId, CancellationToken cancellationToken = default);

    /// <summary>Gets a member by their Entra ID user identifier.</summary>
    /// <param name="userId">The Entra ID user identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The member if found; otherwise <see langword="null"/>.</returns>
    Task<Member?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>Gets all members for a household.</summary>
    /// <param name="householdId">The household identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A read-only list of members in the household.</returns>
    Task<IReadOnlyList<Member>> GetByHouseholdAsync(string householdId, CancellationToken cancellationToken = default);

    /// <summary>Creates a new member.</summary>
    /// <param name="member">The member to create.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The created member.</returns>
    Task<Member> CreateAsync(Member member, CancellationToken cancellationToken = default);

    /// <summary>Updates a member.</summary>
    /// <param name="member">The member to update.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated member.</returns>
    Task<Member> UpdateAsync(Member member, CancellationToken cancellationToken = default);
}
