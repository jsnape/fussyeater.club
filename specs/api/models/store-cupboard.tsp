namespace FussyEaterClub.Api;

/** Item in the household store cupboard. */
model StoreCupboardItem {
  /** Item name. */
  @minLength(1)
  name: string;

  /** Category label for grouping. */
  category: string;

  /** Whether the item is always stocked. */
  alwaysStocked: boolean;
}

/** Current store cupboard for a household. */
model StoreCupboard {
  /** Store cupboard identifier. */
  id: string;

  /** Owning household identifier. */
  householdId: string;

  /** Stored cupboard items. */
  items: StoreCupboardItem[];

  /** ISO timestamp when this cupboard was last updated. */
  updatedAt: utcDateTime;
}

/** Request body for creating or updating the store cupboard. */
model UpsertStoreCupboardRequest {
  /** Stored cupboard items. */
  items: StoreCupboardItem[];
}
