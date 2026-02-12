using TypeSpec.Http;

namespace FussyEaterClub.Api;

/** Health check response. */
model HealthCheckResponse {
  /** Health status. */
  status: string;
}

@tag("Health")
@route("/api/health")
interface Health {
  /** Check API health. */
  @get
  check(): HealthCheckResponse;
}
