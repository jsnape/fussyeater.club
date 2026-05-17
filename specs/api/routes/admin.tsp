namespace FussyEaterClub.Api;
using TypeSpec.Http;

@tag("Admin")
@route("/api/admin/ingredients")
interface AdminIngredients {
	@get
	list(
		@query search?: string,
		@query foodGroup?: string,
		@query allergen?: string,
		@query plantColour?: string,
		@query sort?: "name" | "name-desc" | "updated" | "food-group",
		@query page?: int32,
		@query pageSize?: int32,
	):
		| IngredientListResponse
		| {
				@statusCode statusCode: 401;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  };

	@post
	create(@body body: CreateIngredientRequest):
		| {
				@statusCode statusCode: 201;
				@body body: CanonicalIngredient;
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
				@statusCode statusCode: 409;
				@body body: ErrorResponse;
		  };

	@get
	@route("/{id}")
	get(@path id: string):
		| CanonicalIngredient
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
		  };

	@put
	@route("/{id}")
	update(@path id: string, @body body: UpdateIngredientRequest):
		| CanonicalIngredient
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
		  };

	@delete
	@route("/{id}")
	delete(@path id: string):
		| {
				@statusCode statusCode: 204;
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
		  };

	@get
	@route("/unmapped")
	unmapped():
		| UnmappedIngredientsResponse
		| {
				@statusCode statusCode: 401;
				@body body: ErrorResponse;
		  }
		| {
				@statusCode statusCode: 403;
				@body body: ErrorResponse;
		  };
}
