---
status: design-review
---

# Recipes Browse And Search

Allow users to discover recipes quickly through browsing, keyword search, and simple filters.

The listing includes two recipe types:

- `full`: recipe includes first-party method steps.
- `reference`: recipe links to an external source citation instead of publishing copied method steps.

Recipes also include visibility scope:

- `public`: visible to everyone.
- `private`: visible only to members of the owning household.

---

## Route

| Path       | Purpose                                      |
| ---------- | -------------------------------------------- |
| `/recipes` | Browse all recipes and search/filter results |

---

## Source Scope

This feature defines the recipes listing experience. It pairs with the recipe detail experience in [docs/features/recipe-detail.md](./recipe-detail.md).

This feature must also conform to shared baselines:

- [Security Baseline](../designs/security.md)
- [Scalability Baseline](../designs/scalability.md)
- [Reliability Baseline](../designs/reliability.md)
- [Observability Baseline](../designs/observability.md)
- [Maintainability Baseline](../designs/maintainability.md)

---

## User Flows

### Browse Recipes

```
/recipes
  -> load first page of recipes sorted by relevance/popularity
  -> include public recipes plus private recipes for current household members
  -> show recipe cards with title, description snippet, and quick metadata
  -> user scrolls/paginates to view more
```

### Search By Keyword

```
/recipes
  -> user enters query (for example: "pasta")
  -> submit or debounce-trigger search
  -> list updates to matching recipes
  -> empty state shown if none match
```

### Apply Filters

```
/recipes
  -> user chooses filters (for example: prep time, difficulty, dietary flags)
  -> query + filters are combined server-side
  -> list updates and total count reflects filtered results
```

### Open Recipe Detail

```
/recipes
  -> user selects a card
  -> navigate to /recipes/[id]
```

---

## Page Design (MVP)

Single-page browse layout with clear search controls above result cards.

### Section A: Search And Filters

- Search input with placeholder text and submit affordance.
- Optional chips/toggles for common filters.
- Reset filters action.

### Section B: Results

- Responsive card grid.
- Each card includes:
    - Recipe image
    - Title
    - Description snippet
    - Type label (`full` or `reference`)
    - Visibility label (`public` or `private`)
    - Duration metadata (when available)
    - Source citation hint for `reference` recipes (for example: book/page or external link)
    - Link to `/recipes/[id]`
- Empty state when no results match.

Example recipe card text:

```text
Title: Spaghetti Carbbonara
ID: spaghetti-carbbonara
Image: https://cdn.example.com/recipes/spaghetti-carbbonara.jpg
Type: full
Visibility: public
Description: Creamy weeknight pasta with **pancetta** and black pepper.
Timings: prep 10 min, cook 15 min
Servings: 4
Yield: 1 large bowl
Tags: italian, quick, family-favorite
Link: /recipe/spaghetti-carbbonara
```

### Section C: Pagination

- Previous/Next controls for page navigation.
- Preserve query/filter state across pages.

---

## API Dependencies

### GET `/api/recipes`

Purpose:

- Return paged recipe results for browse/search/filter.

Request query params:

- `q`: optional string keyword.
- `page`: optional integer, default `1`.
- `pageSize`: optional integer, default `24`, max `100`.
- `sort`: optional string (for example: `relevance`, `latest`, `quickest`).
- `visibility`: optional string (`public`, `private`, or `all` when authorized).
- Optional filter params (`difficulty`, `maxPrepMinutes`, dietary tags).

Response shape:

- `items[]`: `{ id, title, description, imageUrl?, type, visibility, timings?, servings?, yield?, tags[], sourceReference? }`
- `page`
- `pageSize`
- `total`

Notes:

- Browse payload is summary-only and does not include full `ingredients[]` arrays.
- Full ingredient structure is provided by the recipe detail API (`GET /api/recipes/{id}`).
- Nutrition data is not included in browse payloads and is fetched from a secondary API on the detail page only when requested.
- `description` is Markdown; cards should render a safe, plain-text snippet/preview.

Type-specific list behavior:

- `full` items may include normal metadata only.
- `reference` items should include minimal source hint in `sourceReference` for user clarity.

Visibility behavior:

- Anonymous users receive only `public` recipes.
- Authenticated users receive `public` recipes plus `private` recipes for their household.
- Private recipes from other households are never returned.

Image behavior:

- Both recipe types may include `imageUrl`.
- If `imageUrl` is missing, cards show a generic no-image fallback asset.

Error responses:

- `400` invalid query/filter values.
- `503` transient backend/database issue.

---

## Validation And Rules

- Trim keyword input before request.
- Search is case-insensitive.
- Ignore punctuation differences where practical.
- Enforce server-side page size limits.
- Filters are additive unless explicitly documented otherwise.
- Support filter by `type` (`full` or `reference`).
- Support filter by `visibility` (`public` or `private`) when user is authorized.
- Never expose copied method text in list payload for `reference` recipes.

---

## Observability

Emit structured JSON logs and metrics for:

- Search query submitted (length and normalized form, not PII payloads).
- Filter combinations used.
- Result count and response duration.
- Empty-result events.

Suggested dimensions:

- `requestId`
- `route` (`/recipes`)
- `queryPresent` (`true|false`)
- `resultCount`
- `durationMs`

---

## Future Direction

- A later phase will introduce an ingredient and nutrition ontology to enable more reliable nutrition calculations across recipes.

---

## Test Scenarios

1. Browse without query returns paged recipes.
2. Search returns case-insensitive matches.
3. Combined filters narrow results correctly.
4. Invalid `page` or `pageSize` returns `400`.
5. Empty results show empty state and no crash.
6. Card navigation opens matching `/recipes/[id]` detail route.
7. Type filter returns only matching recipe type.
8. `reference` result cards show citation hint without method-step content.
9. Anonymous user only receives `public` recipes.
10. Household member receives `public` plus own-household `private` recipes.
