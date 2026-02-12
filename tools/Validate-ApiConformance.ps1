<#
.SYNOPSIS
    Validates that the .NET API's build-time OpenAPI spec conforms to the
    TypeSpec-generated canonical spec.

.DESCRIPTION
    This script compares the paths and HTTP methods between the TypeSpec
    spec (source of truth) and the .NET build-time spec to ensure the
    implementation covers all specified endpoints.

    For a full structural diff, consider adding oasdiff (https://github.com/Tufin/oasdiff)
    to the CI pipeline.

.NOTES
    Prerequisites:
    - Run `npx tsp compile .` in specs/api/ to generate the TypeSpec OpenAPI spec
    - Run `dotnet build api/FussyEaterClub.slnx` to generate the .NET OpenAPI spec
#>

param(
    [string]$TypeSpecPath = "$PSScriptRoot/../specs/api/tsp-output/@typespec/openapi3/openapi.yaml",
    [string]$DotNetPath = "$PSScriptRoot/../api/FussyEaterClub.Api/openapi-output/FussyEaterClub.Api.json"
)

$ErrorActionPreference = "Stop"

# Check files exist
if (-not (Test-Path $TypeSpecPath)) {
    Write-Error "TypeSpec OpenAPI spec not found at: $TypeSpecPath`nRun 'cd specs/api && npx tsp compile .' first."
    exit 1
}

if (-not (Test-Path $DotNetPath)) {
    Write-Error ".NET OpenAPI spec not found at: $DotNetPath`nRun 'dotnet build api/FussyEaterClub.slnx' first."
    exit 1
}

# Install powershell-yaml module if not present
if (-not (Get-Module -ListAvailable -Name powershell-yaml)) {
    Write-Host "Installing powershell-yaml module..."
    Install-Module -Name powershell-yaml -Force -Scope CurrentUser
}

Import-Module powershell-yaml

# Parse specs
Write-Host "Reading TypeSpec OpenAPI spec..." -ForegroundColor Cyan
$typeSpecContent = Get-Content $TypeSpecPath -Raw
$typeSpec = ConvertFrom-Yaml $typeSpecContent

Write-Host "Reading .NET OpenAPI spec..." -ForegroundColor Cyan
$dotNetContent = Get-Content $DotNetPath -Raw
$dotNet = $dotNetContent | ConvertFrom-Json -AsHashtable

$errors = @()
$warnings = @()

# Compare paths
Write-Host "`nComparing API paths..." -ForegroundColor Cyan

$typeSpecPaths = $typeSpec.paths.Keys | Sort-Object
$dotNetPaths = $dotNet.paths.Keys | Sort-Object

foreach ($path in $typeSpecPaths) {
    if ($path -notin $dotNetPaths) {
        $errors += "MISSING PATH: '$path' is defined in TypeSpec but not in the .NET API."
        continue
    }

    # Compare HTTP methods for this path
    $typeSpecMethods = $typeSpec.paths[$path].Keys | Where-Object { $_ -in @('get', 'post', 'put', 'patch', 'delete', 'head', 'options') } | Sort-Object
    $dotNetMethods = @()
    foreach ($key in $dotNet.paths[$path].Keys) {
        if ($key -in @('get', 'post', 'put', 'patch', 'delete', 'head', 'options')) {
            $dotNetMethods += $key
        }
    }
    $dotNetMethods = $dotNetMethods | Sort-Object

    foreach ($method in $typeSpecMethods) {
        if ($method -notin $dotNetMethods) {
            $errors += "MISSING METHOD: $($method.ToUpper()) '$path' is defined in TypeSpec but not in the .NET API."
        }
    }
}

# Check for extra paths in .NET that aren't in TypeSpec (warnings, not errors)
foreach ($path in $dotNetPaths) {
    if ($path -notin $typeSpecPaths) {
        $warnings += "EXTRA PATH: '$path' exists in .NET API but not in TypeSpec spec."
    }
}

# Compare response status codes
Write-Host "Comparing response status codes..." -ForegroundColor Cyan

foreach ($path in $typeSpecPaths) {
    if ($path -notin $dotNetPaths) { continue }

    $typeSpecMethods = $typeSpec.paths[$path].Keys | Where-Object { $_ -in @('get', 'post', 'put', 'patch', 'delete', 'head', 'options') }

    foreach ($method in $typeSpecMethods) {
        $dotNetOp = $dotNet.paths[$path][$method]
        if (-not $dotNetOp) { continue }

        $typeSpecStatuses = $typeSpec.paths[$path][$method].responses.Keys | Sort-Object
        $dotNetStatuses = $dotNetOp.responses.Keys | Sort-Object

        foreach ($status in $typeSpecStatuses) {
            if ($status -notin $dotNetStatuses) {
                $warnings += "MISSING STATUS: $($method.ToUpper()) '$path' - status $status defined in TypeSpec but not in .NET API."
            }
        }
    }
}

# Report results
Write-Host "`n--- Conformance Report ---" -ForegroundColor Yellow

if ($warnings.Count -gt 0) {
    Write-Host "`nWarnings ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($w in $warnings) {
        Write-Host "  ⚠ $w" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`nErrors ($($errors.Count)):" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  ✗ $e" -ForegroundColor Red
    }
    Write-Host "`nConformance check FAILED." -ForegroundColor Red
    exit 1
}
else {
    Write-Host "`n✓ All TypeSpec-defined paths and methods are present in the .NET API." -ForegroundColor Green
    Write-Host "Conformance check PASSED." -ForegroundColor Green
    exit 0
}
