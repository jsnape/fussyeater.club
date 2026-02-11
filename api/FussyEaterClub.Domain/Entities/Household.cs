namespace FussyEaterClub.Domain.Entities;

/// <summary>
/// A household — the shared account for a family of users.
/// </summary>
public class Household
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public required string Id { get; set; }

    /// <summary>Gets or sets the household display name.</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the invite code for joining this household.</summary>
    public required string InviteCode { get; set; }

    /// <summary>Gets or sets when the household was created.</summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
