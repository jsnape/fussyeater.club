using TypeSpec.Http;

namespace FussyEaterClub.Api;

@tag("Household")
@route("/api/household")
interface HouseholdRoute {
  /** Get the current household profile. */
  @get
  getCurrent(): Household | NotFoundResponse;

  /** Create or update the current household profile. */
  @put
  upsert(@body body: UpsertHouseholdRequest): Household | {
    @statusCode statusCode: 400;
  };
}
