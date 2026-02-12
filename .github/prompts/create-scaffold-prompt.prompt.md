# Create Scaffold Prompt

You are a prompt-engineering agent. Your job is to **analyse the current workspace** and generate a `scaffold-project.prompt.md` file that other developers can use to scaffold new projects based on this project's architecture, conventions, and tooling.

The output prompt should describe *what* to create and *how it should behave* — not embed literal file contents. This keeps the scaffold evergreen, allowing the executing agent to use its current knowledge of latest package versions and best practices.

---

## Step 1 — Analyse the Current Project

Thoroughly examine the workspace to understand every layer of the project. Gather information on all of the following:

### 1.1 Tech Stack Discovery

- **Backend framework & language** — Check for solution files (`.sln`, `.slnx`), project files (`.csproj`, `.fsproj`, `pom.xml`, `go.mod`, `cargo.toml`, etc.), and entry points (`Program.cs`, `main.go`, `app.py`, etc.)
- **Frontend framework** — Check `package.json` for framework dependencies (Next.js, SvelteKit, Nuxt, Angular, etc.), config files (`next.config.*`, `svelte.config.*`, `nuxt.config.*`, `angular.json`), and routing patterns
- **Database** — Check for ORM configs, connection strings, database client packages, migration files
- **Authentication** — Check for auth middleware, identity packages, auth config sections
- **API specification** — Check for OpenAPI/Swagger, TypeSpec, GraphQL schemas, or other API definition files
- **Infrastructure as Code** — Check for Bicep, Terraform, Pulumi, CloudFormation, or other IaC files
- **CI/CD** — Check `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml`, `Jenkinsfile`, etc.
- **Containerisation** — Check for `Dockerfile`, `docker-compose.yml`, container registry configs
- **Hosting targets** — Infer from IaC, CI/CD deploy steps, and config files (e.g., Azure Container Apps, AWS ECS, Vercel, etc.)

### 1.2 Architecture & Conventions

- **Project structure** — Map the top-level directory layout and the purpose of each folder
- **Architecture pattern** — Identify patterns like Clean Architecture, CQRS, MVC, hexagonal, modular monolith, microservices, etc. by examining project references, dependency flow, and folder organisation
- **Dependency flow** — Trace project/package references to determine which layers depend on which (and which direction is forbidden)
- **Naming conventions** — Check `.editorconfig`, linter configs, and existing code for naming rules (PascalCase, camelCase, prefixes, etc.)
- **Code style** — Read `.editorconfig`, `.eslintrc`, `.prettierrc`, `stylecop.json`, or similar config files for enforced style rules
- **Testing approach** — Identify test frameworks, test file location patterns, naming conventions, and any TDD/BDD practices documented in instructions

### 1.3 Configuration Files

Catalogue every configuration file that should be reproduced in a new project:

- Root configs (`.editorconfig`, `.gitignore`, `.gitattributes`, `.dockerignore`, `global.json`, etc.)
- Build infrastructure (shared props, package management, tool manifests)
- IDE/editor settings (`.vscode/`, `.idea/`, etc.)
- CI/CD workflow files
- IaC files and modules
- Scripts and tools

### 1.4 Existing Documentation

- Read `.github/copilot-instructions.md` or similar instruction files for documented conventions
- Read `README.md` for project description patterns
- Check for `CONTRIBUTING.md`, `docs/`, or architecture decision records

---

## Step 2 — Ask for Customisations

Before generating the prompt, ask the user:

1. **Frontend swap** — "The current frontend uses {detected framework}. Should the scaffold use the same framework, or would you prefer a different one? (e.g., Next.js, SvelteKit, Nuxt, Angular, plain React)"
2. **Scope** — "Should I include all infrastructure (IaC, CI/CD, Docker) in the scaffold, or just the application code?"
3. **Output location** — "Where should I save the generated prompt? Default: `.github/prompts/scaffold-project.prompt.md`"

If the user has no preferences, use sensible defaults (same framework, full infrastructure, default location).

---

## Step 3 — Generate the Scaffold Prompt

Create a `scaffold-project.prompt.md` file following this structure. Write **descriptive instructions**, not literal file contents. The generated prompt should tell the executing agent *what* to create, *why*, and *what rules to follow* — but let it generate the actual code using current best practices and latest versions.

### Required Sections in the Generated Prompt

#### A. Header & Purpose
- State that this is a scaffolding agent
- Describe the architecture being scaffolded (based on your analysis)
- State that it creates a skeleton with no domain-specific functionality — only a health/status endpoint to prove the pipeline works

#### B. Gather Inputs
- Instruct the agent to ask for **Project Name** (PascalCase) and **Project Description**
- Define derived naming variants (kebab-case, lowercase-no-separator, etc.) based on what the project actually uses in package names, resource names, database names, etc.

#### C. Architecture Overview
- Create a tech stack table from your analysis
- State the dependency flow rules
- Note the hosting targets

#### D. File Creation Instructions
Organise by layer/concern. For each file or group of files, describe:
- **What** to create (file path with name placeholders)
- **Purpose** of the file
- **Key configuration** it must contain (frameworks, packages, settings)
- **Conventions** it must follow (from `.editorconfig`, linter configs, etc.)
- **Relationships** to other files (project references, imports, etc.)

Do NOT embed file contents. Instead, describe the file's purpose and requirements clearly enough that an agent with current knowledge can generate it correctly. For example:

> **`api/{ProjectName}.Application/DependencyInjection.cs`** — Static extension method `AddApplication(this IServiceCollection)` that registers MediatR (scanning the executing assembly, adding `LoggingBehaviour` and `ValidationBehaviour` as pipeline behaviours) and FluentValidation validators from the assembly.

For configuration files with many specific rules (like `.editorconfig`), list the rules as bullet points rather than embedding the raw file.

#### E. Verification Checklist
- List commands the user can run to verify the scaffold works (build, test, run, etc.)
- These should match the project's actual build/test/run commands

#### F. Important Rules
- Explicitly state what NOT to include (no domain entities, no feature code, no real pages)
- State that all placeholders must be substituted
- State that latest stable versions should be used (no hardcoded version numbers)
- Include any project-specific style rules that must be followed

---

## Step 4 — Generate Copilot Instructions

If the project has a `.github/copilot-instructions.md`, also generate a section in the scaffold prompt that instructs the agent to create a templated version of it — with project-specific names replaced by placeholders and domain-specific content removed, but all architecture rules, code style, testing conventions, and workflow instructions preserved.

---

## Step 5 — Review & Save

1. Present a summary of what the generated scaffold prompt will create (file count, layers covered, frameworks used)
2. Save the prompt to the agreed location
3. Confirm completion

---

## Quality Criteria

The generated scaffold prompt must:

- Be **self-contained** — an agent can execute it without access to the original project
- Be **evergreen** — no hardcoded versions; the executing agent uses its current knowledge
- Be **concise** — describe intent and requirements, not raw file contents
- Be **precise** — include enough detail about conventions and architecture rules that the output will be consistent with the source project
- **Preserve all conventions** from the original project (code style, naming, architecture patterns, testing approach)
- **Strip all domain logic** — the scaffold is a blank canvas with only infrastructure and a health endpoint
