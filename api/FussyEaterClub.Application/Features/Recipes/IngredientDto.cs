using FussyEaterClub.Domain.Enums;

namespace FussyEaterClub.Application.Features.Recipes;

/// <summary>
/// DTO representing an ingredient in API responses.
/// </summary>
/// <param name="Name">Ingredient name.</param>
/// <param name="Quantity">Amount required.</param>
/// <param name="Unit">Measurement unit.</param>
/// <param name="Category">Food category.</param>
/// <param name="Notes">Optional preparation notes.</param>
public sealed record IngredientDto(
    string Name,
    decimal Quantity,
    Unit Unit,
    FoodCategory Category,
    string? Notes);
