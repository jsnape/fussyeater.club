using FussyEaterClub.Domain.Entities;

namespace FussyEaterClub.Domain.Interfaces;

/// <summary>
/// Repository for shopping list operations.
/// </summary>
public interface IShoppingListRepository
{
    /// <summary>Gets a shopping list by identifier.</summary>
    /// <param name="id">The shopping list identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The shopping list if found; otherwise <see langword="null"/>.</returns>
    Task<ShoppingList?> GetByIdAsync(string id, string householdId, CancellationToken cancellationToken = default);

    /// <summary>Gets a shopping list by meal plan.</summary>
    /// <param name="mealPlanId">The associated meal plan identifier.</param>
    /// <param name="householdId">The household identifier used as partition key.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The shopping list if found; otherwise <see langword="null"/>.</returns>
    Task<ShoppingList?> GetByMealPlanIdAsync(string mealPlanId, string householdId, CancellationToken cancellationToken = default);

    /// <summary>Creates or replaces a shopping list.</summary>
    /// <param name="shoppingList">The shopping list to upsert.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The created or updated shopping list.</returns>
    Task<ShoppingList> UpsertAsync(ShoppingList shoppingList, CancellationToken cancellationToken = default);
}
