import "@typespec/http";
import "../models.tsp";

using TypeSpec.Http;

namespace FussyEaterClub.Api;

@route("/api/shopping")
@tag("ShoppingList")
namespace ShoppingList {
  @get
  op getShoppingList(
    @query week?: string,
  ): ShoppingListResponse | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 401;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 403;
    @body body: ErrorResponse;
  };
}
