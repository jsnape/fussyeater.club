namespace FussyEaterClub.Api;
using TypeSpec.Http;

model HealthCheckResponse {
	status: string;
}

@tag("Health")
@route("/api/health")
interface Health {
	@get
	check(): HealthCheckResponse;
}
