using FussyEaterClub.Domain.Enums;

namespace FussyEaterClub.Domain.ValueObjects;

/// <summary>
/// A recipe ingredient with quantity and unit.
/// </summary>
/// <param name="Name">Display name of the ingredient.</param>
/// <param name="Quantity">Amount required.</param>
/// <param name="Unit">Measurement unit.</param>
/// <param name="Category">Food category for shopping list grouping.</param>
/// <param name="Notes">Optional preparation notes (e.g., "finely chopped").</param>
public sealed record Ingredient(
    string Name,
    decimal Quantity,
    Unit Unit,
    FoodCategory Category,
    string? Notes = null);
