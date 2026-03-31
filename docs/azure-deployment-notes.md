# Azure Deployment Notes

**Date**: 31 March 2026  
**Status**: Deployment incomplete - paused for future work

## Summary

Attempted to deploy FussyEaterClub to Azure using `azd up`. Infrastructure provisioning succeeded, but API container deployment failed repeatedly due to Docker build context issues with Azure Container Registry remote builds.

## What Works

- ✅ .NET 10 build succeeds (`dotnet build api/FussyEaterClub.slnx`)
- ✅ All unit tests pass (6/6)
- ✅ Infrastructure provisioning via Bicep
- ✅ Azure resources created successfully:
  - Azure Container Registry (Basic tier)
  - Azure Cosmos DB (Free tier)
  - Azure Container Apps Environment
  - Azure Container App (placeholder)
  - Azure Static Web App (Free tier, westeurope)
  - Log Analytics Workspace

## Issues Encountered

### 1. Static Web Apps Region Limitation
**Problem**: SWA not available in `uksouth`  
**Solution**: Hardcoded `westeurope` in `infra/modules/static-web-app.bicep`

### 2. LinkedBackend Not Supported on Free Tier
**Problem**: Linking SWA to Container App fails on Free tier  
**Solution**: Removed `linkedBackend` resource from `static-web-app.bicep`

### 3. Docker Build Context Mismatch (UNRESOLVED)
**Problem**: AZD remote build to ACR fails because Dockerfile paths don't match the build context sent by AZD.

**Attempted solutions**:
1. Dockerfile at `api/FussyEaterClub.Api/Dockerfile` with various path configurations
2. Moved Dockerfile to `api/Dockerfile` 
3. Modified `azure.yaml` with explicit docker path/context settings
4. Removed docker settings from `azure.yaml` to let AZD auto-discover

**Root cause**: AZD sends a specific build context to ACR, but the Dockerfile COPY commands expect a different directory structure. Without Docker installed locally, we cannot easily debug the exact context being sent.

## Configuration State

### azure.yaml
```yaml
name: fussyeater-club
metadata:
  template: fussyeater-club
services:
  api:
    project: ./api/FussyEaterClub.Api
    host: containerapp
    language: dotnet
  web:
    project: ./web
    host: staticwebapp
    language: ts
infra:
  provider: bicep
  path: ./infra
```

### Dockerfile (api/Dockerfile)
Uses .NET 10 stable images:
- `mcr.microsoft.com/dotnet/aspnet:10.0`
- `mcr.microsoft.com/dotnet/sdk:10.0`

Multi-stage build that copies from `api/` subdirectories.

## Recommendations for Next Session

### Option A: Install Docker Desktop
Install Docker locally to enable local builds and proper debugging of the Dockerfile context.

### Option B: Use Pre-published Approach
1. Build and publish the .NET app locally: `dotnet publish api/FussyEaterClub.Api -c Release -o ./publish`
2. Use a simpler Dockerfile that just copies the published output
3. This avoids the multi-stage build complexity with dotnet restore/build

### Option C: Use GitHub Actions
Set up CI/CD with GitHub Actions where Docker is available in the runner environment:
1. Build container image in GitHub Actions
2. Push to ACR
3. Use `azd deploy` or direct ARM/Bicep deployment

## Azure Environment

- **Subscription**: fussy-eater-subscription
- **Environment**: fussy-eater-dev
- **Region**: uksouth (SWA in westeurope)
- **Resource Group**: rg-fussy-eater-dev

## Files Modified During This Session

| File | Change |
|------|--------|
| `infra/modules/static-web-app.bicep` | Hardcoded westeurope location, removed linkedBackend |
| `infra/modules/acr.bicep` | New file for Azure Container Registry |
| `infra/modules/container-app.bicep` | Rewrote to use ACR credentials |
| `infra/main.bicep` | Added ACR module and outputs |
| `api/Dockerfile` | Moved from Api subfolder, updated paths, changed to .NET 10 stable |
| `azure.yaml` | Various docker configuration attempts |
| `.azure/plan.md` | Created deployment plan |

## Commands to Resume

```powershell
# Verify Azure login
az account show

# Set environment (if needed)
azd env select fussy-eater-dev

# Provision infrastructure
azd provision

# Deploy services
azd deploy api
azd deploy web

# Or all at once
azd up
```
