import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "@typespec/openapi3";

import "./models/enums.tsp";
import "./models/ingredients.tsp";
import "./models/recipes.tsp";
import "./models/household.tsp";
import "./models/meal-plan.tsp";
import "./models/shopping-list.tsp";
import "./models/store-cupboard.tsp";
import "./routes/health.tsp";
import "./routes/recipes.tsp";
import "./routes/household.tsp";
import "./routes/meal-plan.tsp";
import "./routes/shopping-list.tsp";
import "./routes/store-cupboard.tsp";

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
