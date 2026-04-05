namespace FussyEaterClub.Api;
using TypeSpec.Http;

@tag("Auth")
@route("/api/auth")
interface Auth {
	@post
	@route("/login")
	login(@body body: LoginRequest):
		| LoginResponse
		| {
				@statusCode statusCode: 400;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 401;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@get
	@route("/session")
	session(): AuthSessionResponse;
}
