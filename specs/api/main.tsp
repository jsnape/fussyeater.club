import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "@typespec/openapi3";

import "./models/enums.tsp";
import "./models/ingredients.tsp";
import "./models/recipes.tsp";
import "./routes/health.tsp";
import "./routes/recipes.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

/**
 * FussyEater.club API — a recipe website for families with fussy eaters.
 */
@service(#{
  title: "FussyEater.club API",
})
@server("http://localhost:5167", "Local development server")
namespace FussyEaterClub.Api;
