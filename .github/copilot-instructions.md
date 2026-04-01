# fussyeater.club Copilot Instructions

## Project Overview

A recipe website for families with fussy eaters. Users create/browse recipes, build meal plans, and generate shopping lists filtered by family members' food preferences and allergies. Hosted on Cloudflare Workers.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | SvelteKit 5 on Cloudflare Workers |
| Frontend/API | SvelteKit 5 with TypeScript |
| Database | Cloudflare D1 |
| Auth | Cloudflare Access |
| API Spec | TypeSpec → OpenAPI 3.0 |
| CI/CD | GitHub Actions |

### Directory Structure

```
migrations/                       # D1 migrations
src/routes/api/                   # Edge API endpoint handlers
wrangler.toml                     # Worker runtime/bindings config
specs/
  api/                            # TypeSpec API definitions (source of truth)
    main.tsp                      # Entry point
    models/                       # Enums, value objects, DTOs
    routes/                       # API endpoint definitions
    tspconfig.yaml                # TypeSpec compiler config
tests/                            # Integration and end-to-end tests
docs/                             # Documentation
```

### Root Folder Policy

The SvelteKit app is rooted at repository root. Keep project structure tidy and place runtime code in `src/`, migrations in `migrations/`, and worker config in `wrangler.toml`.

### Runtime Rules

- **API handlers**: Implement under `src/routes/api/**/+server.ts`
- **Server utilities**: Place shared server logic in `src/lib/server/**`
- **Household scoping**: Resolve household context through `hooks.server.ts` + server helpers
- **Persistence**: Schema changes must be done via D1 migration files in `migrations/`

## API-First Development (TypeSpec)

The API contract is defined in TypeSpec (`specs/api/`) and is the **canonical source of truth** for spec-governed endpoints.

### Workflow

1. **Define or modify the API** in `.tsp` files under `specs/api/`
2. **Compile** with `cd specs/api && npx tsp compile .` to generate `tsp-output/@typespec/openapi3/openapi.yaml`
3. **Implement** the endpoint in SvelteKit Worker routes (`src/routes/api/`)
4. **Generate frontend types** with `npm run generate:types` to update `src/lib/api-types.d.ts`

### Rules

- Always update the TypeSpec spec **before** implementing a new endpoint
- Frontend TypeScript types in `src/lib/api-types.d.ts` are auto-generated — never edit manually
- Use types from `api-types.d.ts` via `components['schemas']['ModelName']` in frontend code
- TypeSpec validation decorators (`@minLength`, `@maxLength`, `@minValue`, `@minItems`) should mirror FluentValidation rules
- `decimal` fields use `float64` in TypeSpec (no native decimal support)

## Testing Conventions

This project follows **TDD**. When modifying or adding code:

1. **Write a failing test first** that describes the expected behaviour
2. **Implement the minimum code** to make the test pass
3. **Refactor** while keeping all tests green
4. **All relevant frontend and route tests must pass** before work is complete

### Frontend (SvelteKit)

- **Framework**: Vitest with jsdom environment
- Test files co-located with source: `*.test.ts` next to the module under test
- Use `vi.fn()` and `vi.stubGlobal()` for mocking (Vitest built-ins)
- Test names use descriptive strings: `it('should return data on success', ...)`
- Arrange-Act-Assert pattern for test structure

## Frontend Conventions (SvelteKit)

- TypeScript strict mode enabled
- API client in `src/lib/api.ts` — all backend calls go through typed `apiFetch<T>()` wrapper
- API types in `src/lib/api-types.d.ts` — auto-generated from TypeSpec OpenAPI spec (do not edit)
- Routes mirror domain: `/recipes`, `/meal-plan`, `/shopping-list`, `/household`, `/store-cupboard`
- Deploy target uses `@sveltejs/adapter-cloudflare`

## Commands

```powershell
# Compile TypeSpec API spec (from specs/api/)
npx tsp compile .

# Watch TypeSpec for changes (from specs/api/)
npx tsp compile . --watch

# Format TypeSpec files (from specs/api/)
npx tsp format **/*.tsp

# Generate frontend types from OpenAPI spec (from repo root)
npm run generate:types

# Run frontend dev server (from repo root)
npm run dev

# Run frontend tests (from repo root)
npm test

# Run frontend tests in watch mode (from repo root)
npm run test:watch

# Install frontend dependencies (from repo root)
npm install
```
