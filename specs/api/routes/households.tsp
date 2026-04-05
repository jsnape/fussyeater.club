namespace FussyEaterClub.Api;
using TypeSpec.Http;

@tag("HouseholdMembers")
@route("/api/households/members")
interface HouseholdMembers {
	@get
	list():
		| ListHouseholdMembersResponse
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 404;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };
}

@tag("HouseholdInvites")
@route("/api/households/invites")
interface HouseholdInvites {
	@get
	list():
		| ListHouseholdInvitesResponse
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 404;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@post
	create(@body body: CreateHouseholdInviteRequest):
		| {
				@statusCode statusCode: 201;
				@body body: CreateHouseholdInviteResponse;
		  }
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
				@statusCode statusCode: 429;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@delete
	@route("/{inviteId}")
	revoke(@path inviteId: string): {
		@statusCode statusCode: 204;
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
