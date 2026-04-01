using TypeSpec.Http;

namespace FussyEaterClub.Api;

@tag("ShoppingList")
@route("/api/shopping-list")
interface ShoppingListRoute {
  /** Get the current shopping list. */
  @get
  getCurrent(): ShoppingList | NotFoundResponse;

  /** Create or update the current shopping list. */
  @put
  upsert(@body body: UpsertShoppingListRequest): ShoppingList | {
    @statusCode statusCode: 400;
  };
}
