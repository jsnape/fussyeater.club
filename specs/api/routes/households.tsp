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

@tag("HouseholdProfiles")
@route("/api/households/profiles")
interface HouseholdProfiles {
	@get
	list():
		| ListProfilesResponse
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@put
	@route("/{userId}")
	save(@path userId: string, @body body: SaveProfileRequest):
		| SaveProfileResponse
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
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };
}

@tag("HouseholdDependents")
@route("/api/households/dependents")
interface HouseholdDependents {
	@post
	create(@body body: SaveDependentRequest):
		| {
				@statusCode statusCode: 201;
				@body body: SaveDependentResponse;
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
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@put
	@route("/{dependentId}")
	update(@path dependentId: string, @body body: SaveDependentRequest):
		| SaveDependentResponse
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
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@delete
	@route("/{dependentId}")
	remove(@path dependentId: string): {
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

@tag("HouseholdSettings")
@route("/api/households/settings")
interface HouseholdSettings {
	@get
	get():
		| HouseholdSettingsResponse
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 503;
				@body body: ErrorResponse;
		  };

	@put
	update(@body body: HouseholdSettingsRequest):
		| HouseholdSettingsResponse
		| {
				@statusCode statusCode: 403;
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
