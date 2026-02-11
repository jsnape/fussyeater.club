using FluentAssertions;
using FussyEaterClub.Domain.Entities;
using FussyEaterClub.Domain.Enums;
using FussyEaterClub.Domain.ValueObjects;

namespace FussyEaterClub.Domain.Tests;

/// <summary>
/// Tests for the <see cref="Recipe"/> entity.
/// </summary>
public class RecipeTests
{
    [Fact]
    public void Recipe_Should_Initialise_With_Empty_Collections()
    {
        var recipe = new Recipe
        {
            Id = "recipe-1",
            HouseholdId = "household-1",
            Title = "Test Recipe",
        };

        recipe.Ingredients.Should().BeEmpty();
        recipe.Steps.Should().BeEmpty();
        recipe.Tags.Should().BeEmpty();
        recipe.IsPublic.Should().BeFalse();
        recipe.Servings.Should().Be(4);
    }

    [Fact]
    public void Ingredient_Should_Store_All_Properties()
    {
        var ingredient = new Ingredient(
            Name: "Flour",
            Quantity: 250,
            Unit: Unit.Grams,
            Category: FoodCategory.Grains,
            Notes: "sifted");

        ingredient.Name.Should().Be("Flour");
        ingredient.Quantity.Should().Be(250);
        ingredient.Unit.Should().Be(Unit.Grams);
        ingredient.Category.Should().Be(FoodCategory.Grains);
        ingredient.Notes.Should().Be("sifted");
    }
}
