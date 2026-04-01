using TypeSpec.Http;

namespace FussyEaterClub.Api;

@tag("StoreCupboard")
@route("/api/store-cupboard")
interface StoreCupboardRoute {
  /** Get the current store cupboard. */
  @get
  getCurrent(): StoreCupboard | NotFoundResponse;

  /** Create or update the current store cupboard. */
  @put
  upsert(@body body: UpsertStoreCupboardRequest): StoreCupboard | {
    @statusCode statusCode: 400;
  };
}
