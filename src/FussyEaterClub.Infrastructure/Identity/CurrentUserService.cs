using System.Security.Claims;
using FussyEaterClub.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FussyEaterClub.Infrastructure.Identity;

/// <summary>
/// Extracts the current user from the HTTP context Entra ID claims.
/// </summary>
public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    /// <inheritdoc />
    public string? UserId =>
        httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    /// <inheritdoc />
    public string? HouseholdId =>
        httpContextAccessor.HttpContext?.User?.FindFirstValue("household_id");
}
