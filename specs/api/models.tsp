namespace FussyEaterClub.Api;

model ErrorResponse {
message: string;
code?: string;
}

model HouseholdSummary {
id: string;
name: string;
}

model InviteStatus {
id: string;
codeMasked: string;
code?: string;
maxUses: int32;
remainingUses: int32;
expiresAt: utcDateTime;
status: "active" | "expired" | "exhausted" | "revoked";
}

model InviteRedeemRequest {
code: string;
}

model InviteRedeemResponse {
joinIntentToken: string;
household: HouseholdSummary;
remainingUses: int32;
expiresAt: utcDateTime;
}

model LoginRequest {
email: string;
password: string;
}

model LoginResponse {
ok: boolean;
}

model AuthSessionFeatureFlags {
microsoftOAuthEnabled: boolean;
}

model AuthSessionUser {
id: string;
email?: string;
name?: string;
authProvider: string;
}

model AuthSessionResponse {
user: AuthSessionUser | null;
featureFlags: AuthSessionFeatureFlags;
canManageHousehold: boolean;
}

model RegisterCompleteRequest {
name: string;
email?: string;
password?: string;
confirmPassword?: string;
householdAction: "create" | "join";
householdName?: string;
joinIntentToken?: string;
idempotencyKey: string;
}

model RegisterCompleteResponse {
userId: string;
householdId: string;
actionApplied: "create" | "join";
}

model CreateHouseholdInviteRequest {
maxUses: int32;
expiresInDays?: int32;
regenerate?: boolean;
idempotencyKey: string;
}

model CreateHouseholdInviteResponse {
code: string;
maxUses: int32;
remainingUses: int32;
expiresAt: utcDateTime;
}

model ListHouseholdInvitesResponse {
invites: InviteStatus[];
}

model HouseholdMember {
userId: string;
name: string;
email: string;
role: string;
joinedAt: utcDateTime;
}

model ListHouseholdMembersResponse {
members: HouseholdMember[];
}

model RecipeTimings {
prepMinutes?: int32;
cookMinutes?: int32;
}

model IngredientPreparation {
type: "text" | "recipe-link";
text?: string;
recipeId?: string;
recipeLabel?: string;
}

model RecipeIngredient {
amount?: float64;
unit?: string;
ingredient: string;
ingredientGroup?: string;
preparation?: IngredientPreparation;
}

model RecipeSourceReference {
kind: "url" | "book";
label: string;
url?: string;
bookTitle?: string;
pageNumber?: int32;
isbn?: string;
}

model RecipeDetail {
id: string;
title: string;
description?: string;
imageUrl?: string;
type: "full" | "reference";
visibility: "public" | "private";
timings?: RecipeTimings;
servings?: int32;
`yield`?: string;
tags: string[];
ingredients: RecipeIngredient[];
method?: string[];
sourceReference?: RecipeSourceReference;
notes?: string;
}
