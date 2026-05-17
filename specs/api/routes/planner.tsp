import "@typespec/http";
import "../models.tsp";

using TypeSpec.Http;

namespace FussyEaterClub.Api;

@route("/api/planner")
@tag("MealPlanner")
namespace MealPlanner {
  @get
  op getWeekPlan(
    @query week?: string,
  ): MealPlanResponse | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 401;
    @body body: ErrorResponse;
  } | {
    @statusCode statusCode: 503;
    @body body: ErrorResponse;
  };

  @route("entries")
  namespace Entries {
    @post
    op upsertEntry(@body body: CreateMealEntryRequest): {
      @statusCode statusCode: 200;
      @body body: CreateMealEntryResponse;
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
      @statusCode statusCode: 503;
      @body body: ErrorResponse;
    };

    @delete
    @route("{id}")
    op removeEntry(@path id: string): {
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

  @route("repeat")
  namespace Repeat {
    @post
    op repeatWeek(@body body: RepeatWeekRequest): RepeatWeekResponse | {
      @statusCode statusCode: 400;
      @body body: ErrorResponse;
    } | {
      @statusCode statusCode: 401;
      @body body: ErrorResponse;
    } | {
      @statusCode statusCode: 403;
      @body body: ErrorResponse;
    } | {
      @statusCode statusCode: 503;
      @body body: ErrorResponse;
    };
  }
}
