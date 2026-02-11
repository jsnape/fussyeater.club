namespace FussyEaterClub.Application.Common.Interfaces;

/// <summary>
/// Provides access to the current authenticated user's identity.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>Gets the Entra ID user identifier.</summary>
    string? UserId { get; }

    /// <summary>Gets the household identifier for the current user.</summary>
    string? HouseholdId { get; }
}
