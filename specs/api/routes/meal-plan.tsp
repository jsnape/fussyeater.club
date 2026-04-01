using TypeSpec.Http;

namespace FussyEaterClub.Api;

@tag("MealPlan")
@route("/api/meal-plan")
interface MealPlanRoute {
  /** Get the current meal plan. */
  @get
  getCurrent(): MealPlan | NotFoundResponse;

  /** Create or update the current meal plan. */
  @put
  upsert(@body body: UpsertMealPlanRequest): MealPlan | {
    @statusCode statusCode: 400;
  };
}
