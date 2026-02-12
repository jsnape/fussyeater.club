# Scaffold New Project

You are a project scaffolding agent. Create a complete, buildable, testable, deployable project skeleton in the **current workspace root**. The project contains **no domain entities, no feature handlers, no API routes, and no web pages** — only the structural skeleton and a single `/api/health` endpoint to prove the pipeline works end-to-end.

---

## Step 1 — Gather Inputs

Before creating any files, ask the user for exactly two inputs:

1. **Project Name** (PascalCase, e.g. `RecipeBox`, `TeamTracker`): used for .NET namespaces, solution file names, and csproj names.
2. **Project Description** (one sentence, e.g. "A meal planning app for busy families"): used in README and TypeSpec service title.

Derive these naming variants automatically — do NOT ask the user for them:

| Variant | Example | Usage |
|---------|---------|-------|
| `{ProjectName}` | `RecipeBox` | .NET namespaces, csproj names |
| `{project-name}` | `recipe-box` | npm package names, Cosmos DB database name, Docker image tags |
| `{projectname}` | `recipebox` | Azure resource base name (no hyphens) |

---

## Step 2 — Architecture Overview

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend | .NET Minimal API (latest stable SDK) | Clean Architecture + CQRS (MediatR) |
| Frontend | Next.js App Router with TypeScript (React) | Azure Static Web Apps hosting |
| Database | Azure Cosmos DB | Direct SDK, serverless, partitioned by `householdId` |
| Auth | Microsoft Entra ID | JWT Bearer in API, AAD identity provider in SWA |
| API Hosting | Azure Container Apps | Consumption plan, scale-to-zero |
| Frontend Hosting | Azure Static Web Apps | Free tier |
| IaC | Bicep | Modular (cosmosdb, container-app, static-web-app) |
| API Spec | TypeSpec → OpenAPI 3.0 | Source of truth for API contract |
| CI/CD | GitHub Actions | Build, API conformance, deploy workflows |

**Dependency flow**: Api → Infrastructure → Application → Domain (never reverse).

---

## Step 3 — Create the Project

Create all files described below. Use the **latest stable versions** of all packages and SDKs. Substitute `{ProjectName}`, `{project-name}`, `{projectname}`, and `{ProjectDescription}` everywhere.

### 3.1 Root Configuration Files

Create these files at the repository root:

- **`global.json`** — Pin the .NET SDK version. Use `"rollForward": "latestMajor"` and `"allowPrerelease": true`.
- **`.editorconfig`** — Comprehensive C# code style rules:
  - File-scoped namespaces (`namespace Foo;` not `namespace Foo { }`)
  - `this.` qualifier enforced on all instance members (SA1101 as error)
  - No underscore prefixes on fields
  - Prefer explicit types over `var`
  - Primary constructors preferred where appropriate
  - Expression-bodied members for single-line properties/indexers/accessors/lambdas, but NOT for constructors/operators
  - PascalCase for all types/methods/properties, interfaces prefixed with `I`
  - Null handling: prefer `??`, `?.`, `is null`
  - Collection expressions preferred
  - StyleCop analyzer rules (SA1200 silent, SA1633 silent, SA1101 error, SA1010 none, SA1402 none, CS1591 none)
  - CA diagnostics (CA1848 none, CA1822 silent, CA2254 none, IDE0058 none)
  - File-specific overrides: relax `this.` for `*Validator.cs`, `*Dto.cs`, `*Command.cs`, `*Query.cs`; suppress nullability warnings and forbid expression-bodied methods in `*Tests.cs`; relax namespace style in `**/Persistence/Migrations/**`
- **`.gitignore`** — Combined Visual Studio + Node.js template. Must cover `bin/`, `obj/`, `TestResult*/`, `.vs/`, `*.user`, `*.env`, `node_modules/`, `.next/`, `out/`.
- **`.gitattributes`** — Auto text detection, `*.cs diff=csharp`, VS project merge union rules.
- **`.dockerignore`** — Exclude `bin/`, `obj/`, `.vs/`, `node_modules/`, `.git/`, `.next/`, `out/`.
- **`.npmrc`** — Empty file.
- **`.config/dotnet-tools.json`** — Empty tools manifest (`"tools": {}`).
- **`LICENSE`** — MIT license, current year, `{ProjectName} Contributors`.
- **`README.md`** — Project name, description, tech stack table (matching Section 2), Getting Started with prerequisites (.NET SDK, Node.js 22+, Azure CLI), build commands (`pwsh scripts/build.ps1`), local run commands (`dotnet run --project api/{ProjectName}.Api` and `cd web && npm run dev`), and a commands reference section.

### 3.2 API Layer (.NET Clean Architecture)

All .NET code goes under `api/`. Create a solution file and shared build infrastructure:

- **`api/{ProjectName}.slnx`** — XML solution file (`<Solution>`) referencing all 7 projects: `{ProjectName}.Domain`, `{ProjectName}.Application`, `{ProjectName}.Infrastructure`, `{ProjectName}.Api`, and their 3 corresponding `.Tests` projects.
- **`api/Directory.Build.props`** — Shared MSBuild properties: target the latest .NET TFM, enable nullable, implicit usings, TreatWarningsAsErrors, EnforceCodeStyleInBuild, latest-recommended AnalysisLevel, GenerateDocumentationFile. Add a `PackageReference` to `StyleCop.Analyzers` with `PrivateAssets="all"`.
- **`api/Directory.Packages.props`** — Central package management (`ManagePackageVersionsCentrally`). Pin latest stable versions for: StyleCop.Analyzers, MediatR, FluentValidation, FluentValidation.DependencyInjectionExtensions, Microsoft.Extensions.Logging.Abstractions, Microsoft.Azure.Cosmos, Microsoft.Identity.Web, Newtonsoft.Json, Microsoft.AspNetCore.OpenApi, Microsoft.Extensions.ApiDescription.Server, Scalar.AspNetCore, Microsoft.NET.Test.Sdk, xunit.v3, xunit.runner.visualstudio, FluentAssertions, NSubstitute, Microsoft.AspNetCore.Mvc.Testing, coverlet.collector.
- **`api/nuget.config`** — Clear sources, add `nuget.org` only.

#### Domain Project — `api/{ProjectName}.Domain/`

- **`.csproj`** — Class library, `RootNamespace` = `{ProjectName}.Domain`. No package references (pure domain, no dependencies).
- Create empty directories with `.gitkeep`: `Entities/`, `ValueObjects/`, `Enums/`, `Interfaces/`.
- **No entity, value object, enum, or interface files.** These are added when features are built.

#### Application Project — `api/{ProjectName}.Application/`

- **`.csproj`** — Class library. References: MediatR, FluentValidation, FluentValidation.DependencyInjectionExtensions, Microsoft.Extensions.Logging.Abstractions. Project reference to Domain.
- **`DependencyInjection.cs`** — Static extension method `AddApplication(this IServiceCollection)` that registers MediatR (scanning the executing assembly, adding `LoggingBehaviour` and `ValidationBehaviour` as pipeline behaviours) and FluentValidation validators from the assembly.
- **`Common/Behaviours/LoggingBehaviour.cs`** — Generic MediatR `IPipelineBehavior` using primary constructor with `ILogger`. Logs "Handling {RequestName}" before and "Handled {RequestName}" after calling `next`.
- **`Common/Behaviours/ValidationBehaviour.cs`** — Generic MediatR `IPipelineBehavior` using primary constructor with `IEnumerable<IValidator<TRequest>>`. Runs all validators, collects failures, throws `ValidationException` if any.
- **`Common/Interfaces/ICurrentUserService.cs`** — Interface with `string? UserId` and `string? HouseholdId` properties.
- Create empty directory with `.gitkeep`: `Features/`.

#### Infrastructure Project — `api/{ProjectName}.Infrastructure/`

- **`.csproj`** — Class library. Add `<FrameworkReference Include="Microsoft.AspNetCore.App" />`. References: Microsoft.Azure.Cosmos, Microsoft.Identity.Web, Newtonsoft.Json. Project reference to Application.
- **`DependencyInjection.cs`** — Static extension method `AddInfrastructure(this IServiceCollection, IConfiguration)` that:
  - Reads `ConnectionStrings:CosmosDb` from config (throws if missing)
  - Reads `CosmosDb:DatabaseName` (defaults to `{project-name}`)
  - Registers singleton `CosmosClient` with camelCase serialization
  - Registers singleton `CosmosContainerFactory`
  - Registers `IHttpContextAccessor` and `ICurrentUserService` → `CurrentUserService`
  - Includes a `// TODO:` comment for registering repository implementations
- **`Persistence/CosmosContainerFactory.cs`** — Class with `CosmosClient` and `databaseName` fields (using `this.` qualifier). No container properties — only a `// TODO:` comment showing the pattern.
- **`Identity/CurrentUserService.cs`** — Implements `ICurrentUserService` using primary constructor with `IHttpContextAccessor`. Extracts `UserId` from `ClaimTypes.NameIdentifier` and `HouseholdId` from `"household_id"` claim.

#### API Project — `api/{ProjectName}.Api/`

- **`.csproj`** — Web SDK. Set `OpenApiDocumentsDirectory` and `OpenApiGenerateDocumentsOptions` for OpenAPI 3.0 build-time generation. References: Microsoft.AspNetCore.OpenApi, Microsoft.Extensions.ApiDescription.Server (private assets), Microsoft.Identity.Web, Scalar.AspNetCore. Project references to Application and Infrastructure.
- **`Program.cs`** — Minimal API setup:
  - `builder.Services.AddApplication()` and `builder.Services.AddInfrastructure(builder.Configuration)`
  - `builder.Services.AddOpenApi()`
  - Authentication (JWT Bearer) and Authorization
  - In Development: `app.MapOpenApi()` and `app.MapScalarApiReference()`
  - `app.UseHttpsRedirection()`, `app.UseAuthentication()`, `app.UseAuthorization()`
  - Map only `HealthEndpoints` — no other endpoint groups
- **`Endpoints/HealthEndpoints.cs`** — Static extension method `MapHealthEndpoints(this IEndpointRouteBuilder)` returning `RouteGroupBuilder`. Maps `GET /api/health` (anonymous, tagged "Health") returning `{ Status = "Healthy" }`.
- **`appsettings.json`** — Logging config, `AllowedHosts: "*"`, empty `ConnectionStrings:CosmosDb`, `CosmosDb:DatabaseName` set to `{project-name}`, empty `AzureAd` section (Instance, TenantId, ClientId, Audience).
- **`appsettings.Development.json`** — Just logging overrides.
- **`Properties/launchSettings.json`** — Two profiles: `http` (localhost:5056) and `https` (localhost:7298 + 5056), both with `ASPNETCORE_ENVIRONMENT=Development`.
- **`Dockerfile`** — Multi-stage build: `aspnet` base (expose 8080), `sdk` build stage (copy build infra + project files → restore → copy all → publish), final stage (copy publish output, `ENTRYPOINT ["dotnet", "{ProjectName}.Api.dll"]`). Use the latest .NET preview images matching `global.json`.

#### Test Projects

Create three test projects, each following this pattern:
- `.csproj` — `IsPackable=false`, `IsTestProject=true`. References: coverlet.collector, FluentAssertions, Microsoft.NET.Test.Sdk, NSubstitute, xunit.v3, xunit.runner.visualstudio. Global `<Using Include="Xunit" />`. Project reference to the corresponding source project.
- A single placeholder test file with one `[Fact]` that asserts `true` (to verify the test runner works).

| Test Project | Extra References | Placeholder File |
|---|---|---|
| `api/{ProjectName}.Domain.Tests/` | — | `PlaceholderTests.cs` |
| `api/{ProjectName}.Application.Tests/` | — | `PlaceholderTests.cs` |
| `api/{ProjectName}.Api.Tests/` | Microsoft.AspNetCore.Mvc.Testing | `HealthEndpointTests.cs` with TODO comment about WebApplicationFactory |

### 3.3 Frontend (Next.js App Router)

All frontend code goes under `web/`.

- **`web/package.json`** — Name: `{project-name}-web`, private. Scripts: `dev` (next dev), `build` (next build), `start` (next start), `lint` (next lint), `check` (tsc --noEmit), `test` (vitest run), `test:watch` (vitest), `generate:types` (openapi-typescript from `../specs/api/tsp-output/@typespec/openapi3/openapi.yaml` to `./src/lib/api-types.d.ts`). Dependencies: next, react, react-dom (latest stable). DevDependencies: typescript, @types/react, @types/react-dom, @types/node, vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/jest-dom, jsdom, openapi-typescript, eslint, eslint-config-next, prettier.
- **`web/next.config.ts`** — Set `output: "standalone"`. Add a rewrite rule proxying `/api/:path*` to `https://localhost:7298/api/:path*` for local dev.
- **`web/tsconfig.json`** — Strict mode, Next.js paths (`@/*` → `./src/*`), bundler module resolution, JSX preserve, incremental, skipLibCheck.
- **`web/vitest.config.ts`** — jsdom environment, React plugin, include `src/**/*.test.{ts,tsx}`, setup file `./src/test-setup.ts`, path alias `@` → `./src`.
- **`web/src/test-setup.ts`** — Import `@testing-library/jest-dom/vitest`.
- **`web/src/app/layout.tsx`** — Root layout with `<html lang="en"><body>{children}</body></html>`. Metadata: title = `{ProjectName}`, description = `{ProjectDescription}`.
- **`web/src/app/page.tsx`** — Minimal home page: `<main><h1>{ProjectName}</h1><p>{ProjectDescription}</p></main>`.
- **`web/src/lib/api.ts`** — Typed `apiFetch<T>(path, options?)` wrapper that fetches with `Content-Type: application/json`, throws on non-OK responses, returns typed JSON.
- **`web/src/lib/api-types.d.ts`** — Empty placeholder with comment: "This file is auto-generated by openapi-typescript. Do not edit manually."
- **`web/staticwebapp.config.json`** — Entra ID auth config (AAD identity provider with placeholder tenant/client settings), route rules for `/api/*` (authenticated), `/login` → `/.auth/login/aad`, `/logout` → `/.auth/logout`, navigation fallback to `/index.html` excluding `/api/*`, `/_next/*`.
- Create `web/public/` with `.gitkeep`.

### 3.4 TypeSpec API Spec

All API specs go under `specs/api/`.

- **`specs/api/main.tsp`** — Import TypeSpec HTTP, REST, OpenAPI, and OpenAPI3 packages. Import `./routes/health.tsp` only. Define `@service` with title `{ProjectName} API` and a local dev `@server`. Namespace: `{ProjectName}.Api`.
- **`specs/api/package.json`** — Name: `{project-name}-api-spec`, private, type: module. Scripts: build (tsp compile), watch, format. Dependencies: @typespec/compiler, @typespec/http, @typespec/rest, @typespec/openapi, @typespec/openapi3 (latest stable versions).
- **`specs/api/tspconfig.yaml`** — Emit `@typespec/openapi3`, output as `openapi.yaml` (YAML format), seal object schemas, warn-as-error.
- **`specs/api/routes/health.tsp`** — Define `HealthCheckResponse` model (status: string) and `Health` interface with `@tag("Health")`, `@route("/api/health")`, single `@get check()` operation.
- Create `specs/api/models/` with `.gitkeep`.

### 3.5 Infrastructure (Bicep)

All IaC goes under `infra/`.

- **`infra/main.bicep`** — `targetScope = 'resourceGroup'`. Parameters: `baseName` (default `{projectname}`), `location` (default `resourceGroup().location`), `cosmosDbDatabaseName` (default `{project-name}`), `apiImageName` (default empty). Three modules: cosmosdb, container-app, static-web-app. Outputs: apiUrl, staticWebAppUrl, cosmosDbAccountName.
- **`infra/main.bicepparam`** — Uses `main.bicep`, sets baseName to `{projectname}`, cosmosDbDatabaseName to `{project-name}`, apiImageName to empty.
- **`infra/modules/cosmosdb.bicep`** — Cosmos DB account (serverless, Session consistency), SQL database. **No containers** — include a commented-out example showing the pattern for adding containers with partition keys. Outputs: connectionString, accountName.
- **`infra/modules/container-app.bicep`** — Log Analytics workspace, Container Apps managed environment, container app with: external ingress on port 8080, CORS allow all, Cosmos DB connection string as secret, scale 0-5 with HTTP concurrency rule. Output: apiUrl.
- **`infra/modules/static-web-app.bicep`** — Static Web App (Free tier), `appLocation: 'web'`, `outputLocation: '.next'`, linked backend placeholder. Output: url.

### 3.6 Scripts and Tools

- **`scripts/build.ps1`** — PowerShell script with `-Fix`, `-SkipFrontend`, `-SkipTests` switches. .NET steps: restore, build (Release), test (with code coverage), format (verify-only or auto-fix). Frontend steps: npm install, `npm run check` (tsc), `npm run build` (next). Prints summary with elapsed time. References `api/{ProjectName}.slnx`.
- **`tools/Validate-ApiConformance.ps1`** — Compares TypeSpec OpenAPI spec (`specs/api/tsp-output/@typespec/openapi3/openapi.yaml`) against .NET build-time spec (`api/{ProjectName}.Api/openapi-output/{ProjectName}.Api.json`). Checks paths, HTTP methods, and response status codes. Reports errors (missing paths/methods) and warnings (extra paths, missing statuses). Uses `powershell-yaml` module. Non-zero exit on failures.

### 3.7 GitHub Actions Workflows

- **`.github/workflows/build.yml`** — Name: "Build & Test". Trigger: `workflow_dispatch` (with commented-out PR/push triggers). Two jobs:
  - `dotnet`: Setup .NET (from global.json), restore, build (Release), test (with coverage), format check.
  - `frontend`: Setup Node.js 22, `npm ci`, `npm run check`, `npm run build`. Working directory: `web`.
- **`.github/workflows/api-conformance.yml`** — Name: "API Spec Conformance". Trigger: workflow_dispatch and PR on main (paths: `specs/api/**`, `api/**`, `web/src/lib/api-types.d.ts`, `tools/Validate-ApiConformance.ps1`). Two jobs:
  - `conformance`: Setup .NET + Node.js, install TypeSpec deps, compile TypeSpec, build .NET, run `Validate-ApiConformance.ps1`.
  - `types`: Setup Node.js, compile TypeSpec, install frontend deps, generate types, check for uncommitted changes to `api-types.d.ts`.
- **`.github/workflows/deploy.yml`** — Name: "Deploy". Trigger: `workflow_dispatch`. Permissions: `id-token: write`, `contents: read`. Env vars for resource group (`{projectname}-rg`), location (`uksouth`), ACR name (`{projectname}acr`). Three jobs:
  - `deploy-infra`: Azure login (federated identity), deploy Bicep.
  - `deploy-api`: Build + push Docker image to ACR, update Container App.
  - `deploy-frontend`: npm ci, npm run build, deploy to SWA.

### 3.8 VS Code Configuration

- **`.vscode/settings.json`** — Format on save. Default formatters: C# (ms-dotnettools.csharp), TypeScript/TSX (prettier), JSON (prettier), Bicep (ms-azuretools.vscode-bicep). Exclude bin, obj, node_modules, .vs, .next from file explorer. Set `dotnet.defaultSolution` to `api/{ProjectName}.slnx`. Auto-approve terminal commands for dotnet/npm operations.
- **`.vscode/tasks.json`** — Three tasks: `build` (dotnet build, default build group), `test` (dotnet test), `web: dev` (npm run dev in web/, background).
- **`.vscode/launch.json`** — Single configuration: "API: Launch" targeting `api/{ProjectName}.Api/{ProjectName}.Api.csproj`.
- **`.vscode/extensions.json`** — Recommendations: ms-dotnettools.csdevkit, ms-azuretools.vscode-bicep, ms-azuretools.vscode-azurestaticwebapps, ms-azuretools.vscode-azurecontainerapps, ms-azuretools.vscode-cosmosdb, esbenp.prettier-vscode, dbaeumer.vscode-eslint, editorconfig.editorconfig, github.copilot, typespec.typespec-vscode.

### 3.9 Copilot Instructions

Create **`.github/copilot-instructions.md`** with comprehensive development guidelines covering:

- **Project Overview** — `{ProjectName}`: `{ProjectDescription}`. Tech stack table matching Section 2.
- **Directory Structure** — Same layout as this scaffold (`api/`, `web/`, `specs/api/`, `scripts/`, `tests/`, `infra/`, `docs/`, `tools/`).
- **Root Folder Policy** — Keep root clean; .NET code in `api/`, frontend in `web/`.
- **Architecture Rules** — Dependency flow (Api → Infrastructure → Application → Domain), feature folders (`Application/Features/{Aggregate}/{Operation}/`), each feature has Command/Query, Validator, Handler co-located, endpoints as static extension methods in `Api/Endpoints/`, repository interfaces in `Domain/Interfaces/` and implementations in `Infrastructure/Persistence/`.
- **API-First Development (TypeSpec)** — Workflow: define in TypeSpec → compile → implement endpoint → generate frontend types → validate conformance. Rules: always update TypeSpec before implementing, never edit `api-types.d.ts` manually, use `components['schemas']['ModelName']` in frontend code.
- **C# Code Style** — All rules from `.editorconfig`: file-scoped namespaces, `this.` qualifier, no underscore prefixes, PascalCase, interface `I` prefix, prefer explicit types, primary constructors, expression-bodied members (not constructors/operators), null handling patterns, collection expressions, central package management (no `Version` in csproj).
- **Testing Conventions** — TDD: write failing test first, implement minimum code, refactor. Backend: xUnit + FluentAssertions + NSubstitute, `{ClassName}Tests` naming, block-bodied test methods, validator tests use `FluentValidation.TestHelper`. Frontend: Vitest with jsdom and React Testing Library, `*.test.ts` co-located, `vi.fn()` for mocking, Arrange-Act-Assert.
- **Frontend Conventions (Next.js)** — TypeScript strict mode, API client in `web/src/lib/api.ts` (typed `apiFetch<T>()`), auto-generated types in `web/src/lib/api-types.d.ts`, App Router routes in `web/src/app/`, dev proxy in `next.config.ts`, tests use Vitest + React Testing Library.
- **Commands** — All build, test, format, run, TypeSpec, frontend commands.

### 3.10 Placeholder Directories

Create a `.gitkeep` file in each empty directory:

- `docs/`
- `tests/`
- `.github/skills/`

---

## Step 4 — Verification Checklist

After creating all files, verify these will work (do NOT execute them — just confirm all referenced files exist and are consistent):

1. `dotnet build api/{ProjectName}.slnx` — all 7 projects referenced and have valid .csproj files
2. `dotnet test api/{ProjectName}.slnx` — all 3 test projects exist with at least one test
3. `cd web && npm install && npm run build` — `package.json` has Next.js deps and `next.config.ts` exists
4. `cd specs/api && npm install && npx tsp compile .` — `main.tsp` imports only `routes/health.tsp`
5. `dotnet run --project api/{ProjectName}.Api` — `Program.cs` maps only `HealthEndpoints`
6. `pwsh scripts/build.ps1` — references correct solution path, runs both .NET and frontend steps

Report completion with a summary of all files created.

---

## Important Rules

- **Do NOT add any domain entities**, value objects, enums, repository interfaces, CQRS commands/queries, handlers, validators, or feature-specific code. The only endpoint is `/api/health`.
- **Do NOT create any web pages** beyond the minimal `layout.tsx` and `page.tsx` — no routes, no components, no styles.
- **Do NOT add any Cosmos DB containers** in the Bicep modules — only a commented-out example.
- **Do NOT register any repositories** in `Infrastructure/DependencyInjection.cs` — only `CosmosClient`, `CosmosContainerFactory`, and `CurrentUserService`.
- Every `{ProjectName}`, `{project-name}`, `{projectname}`, and `{ProjectDescription}` placeholder MUST be replaced with the values gathered in Step 1.
- All C# files must follow the `.editorconfig` rules: file-scoped namespaces, `this.` qualifier, no underscore prefixes, XML doc comments on public members.
- Use the **latest stable versions** of all packages, SDKs, and Docker base images. Do not hardcode specific version numbers — use your current knowledge of the latest releases.
