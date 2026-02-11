using FussyEaterClub.Domain.Enums;

namespace FussyEaterClub.Domain.ValueObjects;

/// <summary>
/// A family member's food preference — things they dislike or can't eat.
/// </summary>
/// <param name="FoodDislikes">Specific foods this person won't eat.</param>
/// <param name="DietaryRestrictions">Dietary restrictions (allergies, lifestyle choices).</param>
public sealed record FoodPreference(
    IReadOnlyList<string> FoodDislikes,
    IReadOnlyList<DietaryRestriction> DietaryRestrictions);
