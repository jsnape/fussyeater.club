namespace FussyEaterClub.Api;
using TypeSpec.Http;

@tag("Invites")
@route("/api/invites")
interface InviteRedemption {
	@post
	@route("/redeem")
	redeem(@body body: InviteRedeemRequest):
		| InviteRedeemResponse
		| {
				@statusCode statusCode: 400;
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
