namespace FussyEaterClub.Api;

/** Household profile in API responses. */
model Household {
  /** Household identifier. */
  id: string;

  /** Household display name. */
  @minLength(1)
  @maxLength(200)
  name: string;

  /** Household invite code. */
  inviteCode: string;

  /** ISO timestamp for household creation. */
  createdAt: utcDateTime;
}

/** Request body for creating or updating household details. */
model UpsertHouseholdRequest {
  /** Household display name. */
  @minLength(1)
  @maxLength(200)
  name: string;

  /** Optional invite code to assign to this household. */
  inviteCode?: string;
}
