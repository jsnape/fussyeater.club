# fussyeater.club

A recipe website for families with fussy eaters. Users create and browse recipes, build meal plans, and generate shopping lists — all filtered by family members' food preferences and allergies.

## Tech Stack

| Layer            | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| Runtime          | SvelteKit 5 on Cloudflare Workers                          |
| Frontend/API     | SvelteKit 5 with TypeScript                                |
| Database         | Cloudflare D1                                              |
| Auth             | Cloudflare Access (header-based identity)                  |
| API Spec         | TypeSpec → OpenAPI 3.0                                     |
| CI/CD            | GitHub Actions                                             |

## Repository Structure

```
fussyeater.club/
├── migrations/                   # D1 migrations
├── src/routes/api/               # Edge API endpoints
├── wrangler.toml                 # Worker and D1 bindings
├── specs/
│   └── api/                      # TypeSpec API definitions (source of truth)
│       ├── main.tsp              # Entry point
│       ├── models/               # Enums, value objects, DTOs
│       ├── routes/               # API endpoint definitions
│       └── tspconfig.yaml        # TypeSpec compiler config
├── tests/                        # Integration and end-to-end tests
├── docs/                         # Documentation
└── .github/workflows/            # CI/CD workflows
```

The SvelteKit app now lives at repository root.

## Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (optional for local deployment commands)

### Build & Run

```powershell
# Install dependencies and run dev server
npm install
npm run dev

# Run frontend tests
npm test

# Build for production
npm run build
```

### API-First Workflow (TypeSpec)

The API contract is defined in [TypeSpec](https://typespec.io/) under `specs/api/` and is the canonical source of truth.

```powershell
# Install TypeSpec dependencies (first time only)
cd specs/api
npm install

# Compile TypeSpec → OpenAPI 3.0 spec
npx tsp compile .

# Generate frontend TypeScript types from the spec
cd ../..
npm run generate:types

# Validate generated TypeScript types are current
npm run generate:types
```

**Workflow**: define/update `.tsp` files → compile → implement Worker routes → generate frontend types.

## Deployment

Frontend and edge API routes are deployed to Cloudflare Workers with D1 migrations via GitHub Actions.

The deploy workflow in `.github/workflows/deploy.yml` runs:

1. `npm ci`, `npm test`, and `npm run build` at repo root
2. D1 migrations with `wrangler d1 migrations apply ... --remote`
3. Worker deploy with `wrangler deploy`

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`

## License

See [LICENSE](LICENSE) for details.
