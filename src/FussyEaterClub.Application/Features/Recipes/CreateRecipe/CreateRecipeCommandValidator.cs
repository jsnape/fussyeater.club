using FluentValidation;

namespace FussyEaterClub.Application.Features.Recipes.CreateRecipe;

/// <summary>
/// Validates the <see cref="CreateRecipeCommand"/>.
/// </summary>
public sealed class CreateRecipeCommandValidator : AbstractValidator<CreateRecipeCommand>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="CreateRecipeCommandValidator"/> class.
    /// </summary>
    public CreateRecipeCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Servings)
            .GreaterThan(0);

        RuleFor(x => x.PrepTimeMinutes)
            .GreaterThan(0)
            .When(x => x.PrepTimeMinutes.HasValue);

        RuleFor(x => x.CookTimeMinutes)
            .GreaterThan(0)
            .When(x => x.CookTimeMinutes.HasValue);

        RuleFor(x => x.Steps)
            .NotEmpty()
            .WithMessage("At least one cooking step is required.");

        RuleFor(x => x.Ingredients)
            .NotEmpty()
            .WithMessage("At least one ingredient is required.");
    }
}
