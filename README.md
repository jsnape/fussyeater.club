# fussyeater.club

A recipe website for families with fussy eaters. Users create and browse recipes, build meal plans, and generate shopping lists — all filtered by family members' food preferences and allergies.

## Tech Stack

| Layer            | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| Backend          | .NET 10 Minimal API, Clean Architecture + CQRS (MediatR)   |
| Frontend         | SvelteKit 5 with TypeScript                                |
| Database         | Azure Cosmos DB (direct SDK, partitioned by `householdId`) |
| Auth             | Microsoft Entra ID                                         |
| API Hosting      | Azure Container Apps (consumption, scale-to-zero)          |
| Frontend Hosting | Azure Static Web Apps                                      |
| IaC              | Bicep                                                      |
| API Spec         | TypeSpec → OpenAPI 3.0                                     |
| CI/CD            | GitHub Actions                                             |

## Repository Structure

```
fussyeater.club/
├── api/                          # .NET backend
│   ├── FussyEaterClub.slnx      # Solution file
│   ├── Directory.Build.props     # Shared MSBuild properties
│   ├── Directory.Packages.props  # Central NuGet package management
│   ├── nuget.config              # NuGet source configuration
│   ├── FussyEaterClub.Domain/    # Entities, value objects, enums, interfaces
│   ├── FussyEaterClub.Application/  # CQRS commands/queries, handlers, validators
│   ├── FussyEaterClub.Infrastructure/  # Cosmos DB repos, identity services
│   ├── FussyEaterClub.Api/       # Minimal API endpoints, Dockerfile
│   ├── FussyEaterClub.Domain.Tests/
│   ├── FussyEaterClub.Application.Tests/
│   └── FussyEaterClub.Api.Tests/
├── web/                          # SvelteKit frontend
├── specs/
│   └── api/                      # TypeSpec API definitions (source of truth)
│       ├── main.tsp              # Entry point
│       ├── models/               # Enums, value objects, DTOs
│       ├── routes/               # API endpoint definitions
│       └── tspconfig.yaml        # TypeSpec compiler config
├── infra/                        # Bicep IaC modules
├── tests/                        # Integration and end-to-end tests
├── docs/                         # Documentation
└── tools/                        # Developer tooling and scripts
```

The root is kept intentionally clean — only repo-wide configuration files (`global.json`, `.editorconfig`, `.gitignore`, etc.) live here. All .NET code and build infrastructure is inside `api/`, and the frontend is in `web/`.

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (for deployment)

### Build & Run

```powershell
# Build the .NET solution
dotnet build api/FussyEaterClub.slnx

# Run tests
dotnet test api/FussyEaterClub.slnx

# Run API locally
dotnet run --project api/FussyEaterClub.Api

# Install frontend dependencies and run dev server
cd web
npm install
npm run dev
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
cd ../../web
npm run generate:types

# Validate .NET API conforms to the TypeSpec spec
pwsh tools/Validate-ApiConformance.ps1
```

**Workflow**: define/update `.tsp` files → compile → implement in .NET → generate frontend types → validate conformance.

## Deployment

Infrastructure is defined in Bicep (`infra/`) and deployed via GitHub Actions. See `.github/workflows/deploy.yml` for the full pipeline.

## License

See [LICENSE](LICENSE) for details.
