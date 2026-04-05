namespace FussyEaterClub.Api;
using TypeSpec.Http;

@tag("Registration")
@route("/api/register")
interface Registration {
	@post
	@route("/complete")
	complete(@body body: RegisterCompleteRequest):
		| {
				@statusCode statusCode: 201;
				@body body: RegisterCompleteResponse;
		  }
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
				@statusCode statusCode: 404;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 409;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 410;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 429;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };
}
