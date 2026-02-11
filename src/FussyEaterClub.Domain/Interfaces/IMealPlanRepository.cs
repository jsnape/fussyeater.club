using FussyEaterClub.Domain.Entities;

namespace FussyEaterClub.Domain.Interfaces;

/// <summary>
/// Repository for meal plan operations.
/// </summary>
public interface IMealPlanRepository
{
    /// <summary>Gets a meal plan by identifier.</summary>
    /// <param name="id">The meal plan identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The meal plan if found; otherwise <see langword="null"/>.</returns>
    Task<MealPlan?> GetByIdAsync(string id, string householdId, CancellationToken cancellationToken = default);

    /// <summary>Gets all meal plans for a household.</summary>
    /// <param name="householdId">The household identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A read-only list of meal plans belonging to the household.</returns>
    Task<IReadOnlyList<MealPlan>> GetByHouseholdAsync(string householdId, CancellationToken cancellationToken = default);

    /// <summary>Creates a new meal plan.</summary>
    /// <param name="mealPlan">The meal plan to create.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The created meal plan.</returns>
    Task<MealPlan> CreateAsync(MealPlan mealPlan, CancellationToken cancellationToken = default);

    /// <summary>Updates a meal plan.</summary>
    /// <param name="mealPlan">The meal plan to update.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated meal plan.</returns>
    Task<MealPlan> UpdateAsync(MealPlan mealPlan, CancellationToken cancellationToken = default);

    /// <summary>Deletes a meal plan.</summary>
    /// <param name="id">The meal plan identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(string id, string householdId, CancellationToken cancellationToken = default);
}
