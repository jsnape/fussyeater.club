import "@typespec/http";
import "../models.tsp";

using TypeSpec.Http;

namespace FussyEaterClub.Api;

@route("/api/recipes")
@tag("Recipes")
namespace Recipes {
  @get
  op list(
    @query q?: string,
    @query page?: int32,
    @query pageSize?: int32,
    @query sort?: string,
    @query visibility?: string,
  ): RecipeListResponse | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 503;
    @body body: ErrorResponse;
  };

  @post
  op create(@body body: CreateRecipeRequest): {
    @statusCode statusCode: 201;
    @body body: RecipeDetail;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 401;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 403;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 409;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 503;
    @body body: ErrorResponse;
  };

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

  @put
  @route("{id}")
  op update(@path id: string, @body body: UpdateRecipeRequest): RecipeDetail | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 401;
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

  @delete
  @route("{id}")
  op remove(@path id: string): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 401;
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
