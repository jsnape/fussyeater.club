# fussyeater.club Copilot Instructions

## Project Overview

A recipe website for families with fussy eaters. Users create/browse recipes, build meal plans, and generate shopping lists filtered by family members' food preferences and allergies. Hosted on Azure (Container Apps + Static Web Apps).

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 10 Minimal API, Clean Architecture + CQRS (MediatR) |
| Frontend | SvelteKit 5 with TypeScript |
| Database | Azure Cosmos DB (direct SDK, partitioned by `householdId`) |
| Auth | Microsoft Entra ID |
| API Hosting | Azure Container Apps (consumption, scale-to-zero) |
| Frontend Hosting | Azure Static Web Apps (with `adapter-azure-swa`) |
| IaC | Bicep |
| CI/CD | GitHub Actions |

### Directory Structure

```
src/
  FussyEaterClub.Domain/       # Entities, value objects, enums, repository interfaces
  FussyEaterClub.Application/  # CQRS commands/queries, handlers, validators, DTOs
  FussyEaterClub.Infrastructure/ # Cosmos DB repos, Entra ID identity services
  FussyEaterClub.Api/          # Minimal API endpoints, DI composition root, Dockerfile
  web/                         # SvelteKit frontend
tests/
  FussyEaterClub.Domain.Tests/
  FussyEaterClub.Application.Tests/
  FussyEaterClub.Api.Tests/
infra/                         # Bicep modules (cosmosdb, container-app, static-web-app)
```

### Architecture Rules

- **Dependency flow**: Api → Infrastructure → Application → Domain (never reverse)
- **Feature folders**: `Application/Features/{Aggregate}/{Operation}/` (e.g., `Features/Recipes/CreateRecipe/`)
- **Each feature has**: Command/Query record, Validator, Handler — co-located in one folder
- **Endpoints**: Static extension methods in `Api/Endpoints/` (e.g., `RecipeEndpoints.MapRecipeEndpoints()`)
- **Repositories**: Interfaces in `Domain/Interfaces/`, implementations in `Infrastructure/Persistence/`

### Domain Model

Core entities: `Household`, `Member`, `Recipe`, `MealPlan`, `ShoppingList`, `StoreCupboard`. All household-scoped data is partitioned by `householdId` in Cosmos DB. Value objects are immutable records: `Ingredient`, `FoodPreference`, `MealSlot`, `ShoppingItem`, `StoreCupboardItem`.

## Azure Integration

@azure Rule - When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `get_azure_best_practices` tool if available.

## C# Code Style (Enforced via .editorconfig)

### Naming & Structure

- **File-scoped namespaces**: Always use `namespace Foo;` not `namespace Foo { }`
- **No underscore prefixes**: Field names should NOT start with `_` (e.g., use `this.field` not `_field`)
- **Use `this.` qualifier**: Always qualify instance members with `this.` (SA1101 enforced as error)
- **PascalCase**: All types, methods, properties, and events
- **Interface prefix**: Always prefix interfaces with `I` (e.g., `IUserService`)
- **Prefer explicit types over `var`**: Use `string name = "..."` not `var name = "..."`

### Type Usage

- **Primary constructors preferred**: Use C# 12+ primary constructors where appropriate
- **Expression-bodied members**: Use for single-line properties, indexers, accessors, and lambdas
- **Expression-bodied constructors/operators**: NOT allowed (use block bodies)

### Patterns

- **Null handling**: Use null-coalescing (`??`), null propagation (`?.`), and `is null` checks
- **Pattern matching**: Prefer switch expressions and pattern matching over traditional switch/if-else
- **Collection expressions**: Use `[1, 2, 3]` syntax when types match
- **Central package management**: NuGet versions are pinned in `Directory.Packages.props` — never add `Version` attributes in `.csproj` files

### File-Specific Rules

- **Validators, DTOs, Commands, Queries** (`*Validator.cs`, `*Dto.cs`, `*Command.cs`, `*Query.cs`): `this.` qualifier relaxed
- **Test files** (`*Tests.cs`): Nullability warnings suppressed, expression-bodied methods forbidden
- **EF/Cosmos migrations** (`**/Persistence/Migrations/**`): Namespace style not enforced

## Testing Conventions

- **Framework**: xUnit + FluentAssertions + NSubstitute
- Test classes follow `{ClassName}Tests` naming pattern
- Test methods can use underscores in names (CA1707 disabled for test files)
- Use block-bodied methods (not expression-bodied) for test methods
- Validator tests use `FluentValidation.TestHelper` (`TestValidate()` / `ShouldHaveValidationErrorFor()`)

## Frontend Conventions (SvelteKit)

- TypeScript strict mode enabled
- API client in `src/web/src/lib/api.ts` — all backend calls go through typed `apiFetch<T>()` wrapper
- Routes mirror domain: `/recipes`, `/meal-plan`, `/shopping-list`, `/household`
- Dev proxy in `vite.config.ts` forwards `/api` to the .NET backend

## Commands

```powershell
# Build .NET solution
dotnet build

# Run tests
dotnet test

# Format C# code
dotnet format

# Run API locally
dotnet run --project src/FussyEaterClub.Api

# Run frontend dev server (from src/web/)
npm run dev

# Install frontend dependencies (from src/web/)
npm install
```
