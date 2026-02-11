using FluentAssertions;
using FluentValidation.TestHelper;
using FussyEaterClub.Application.Features.Recipes.CreateRecipe;

namespace FussyEaterClub.Application.Tests;

/// <summary>
/// Tests for <see cref="CreateRecipeCommandValidator"/>.
/// </summary>
public class CreateRecipeCommandValidatorTests
{
    private readonly CreateRecipeCommandValidator validator = new();

    [Fact]
    public void Should_Have_Error_When_Title_Is_Empty()
    {
        var command = new CreateRecipeCommand { Title = string.Empty };

        TestValidationResult<CreateRecipeCommand> result = this.validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_Have_Error_When_No_Steps()
    {
        var command = new CreateRecipeCommand
        {
            Title = "Valid Title",
            Steps = [],
            Ingredients = [new("Flour", 250, Domain.Enums.Unit.Grams, Domain.Enums.FoodCategory.Grains, null)],
        };

        TestValidationResult<CreateRecipeCommand> result = this.validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Steps);
    }

    [Fact]
    public void Should_Pass_With_Valid_Command()
    {
        var command = new CreateRecipeCommand
        {
            Title = "Spaghetti Bolognese",
            Servings = 4,
            Steps = ["Cook pasta", "Make sauce", "Combine"],
            Ingredients = [new("Spaghetti", 500, Domain.Enums.Unit.Grams, Domain.Enums.FoodCategory.Grains, null)],
        };

        TestValidationResult<CreateRecipeCommand> result = this.validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
