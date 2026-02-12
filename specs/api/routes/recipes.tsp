using TypeSpec.Http;

namespace FussyEaterClub.Api;

@tag("Recipes")
@route("/api/recipes")
interface Recipes {
  /** Get a recipe by its identifier. */
  @get
  get(@path id: string): Recipe | NotFoundResponse;

  /** Create a new recipe. */
  @post
  create(@body body: CreateRecipeRequest): CreatedResponse & {
    @body body: Recipe;
  } | {
    @statusCode statusCode: 400;
  };
}
