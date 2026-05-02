import "@typespec/http";
import "../models.tsp";

using TypeSpec.Http;

namespace FussyEaterClub.Api;

@route("/api/recipes")
@tag("Recipes")
namespace Recipes {
  @get
  @route("{id}")
  op getDetail(@path id: string): RecipeDetail | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 403;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 503;
    @body body: ErrorResponse;
  };
}
