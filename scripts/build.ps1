<#
.SYNOPSIS
    Runs the build.yml CI workflow locally.

.DESCRIPTION
    Replicates the GitHub Actions build.yml pipeline on your local machine,
    covering both the .NET (restore, build, test, format-check) and SvelteKit
    (install, check, build) jobs.

    By default the script mirrors CI exactly. Use switches to customise
    behaviour for faster local iteration.

.PARAMETER Fix
    Run `dotnet format` to auto-fix style issues instead of the default
    verify-only check.

.PARAMETER SkipFrontend
    Skip the SvelteKit install / check / build steps.

.PARAMETER SkipTests
    Skip the `dotnet test` step.

.EXAMPLE
    # Full CI-equivalent build
    pwsh scripts/build.ps1

.EXAMPLE
    # Auto-fix formatting issues
    pwsh scripts/build.ps1 -Fix

.EXAMPLE
    # Quick .NET-only build without tests
    pwsh scripts/build.ps1 -SkipFrontend -SkipTests

.NOTES
    Prerequisites:
    - .NET SDK (version specified in global.json)
    - Node.js 22+ and npm (for frontend steps)
#>

param(
    [switch]$Fix,
    [switch]$SkipFrontend,
    [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path "$PSScriptRoot/.."
$solution = "$repoRoot/api/FussyEaterClub.slnx"

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$stepNumber = 0

function Write-Step {
    param([string]$Message)
    $script:stepNumber++
    Write-Host "`n[$script:stepNumber] $Message" -ForegroundColor Cyan
}

function Assert-ExitCode {
    param([string]$StepName)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ $StepName failed (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
}

# ---------------------------------------------------------------------------
# .NET steps
# ---------------------------------------------------------------------------

Write-Step "dotnet restore"
dotnet restore $solution
Assert-ExitCode "dotnet restore"

Write-Step "dotnet build"
dotnet build $solution --no-restore --configuration Release
Assert-ExitCode "dotnet build"

if (-not $SkipTests) {
    Write-Step "dotnet test"
    dotnet test $solution --no-build --configuration Release --verbosity normal --collect:"XPlat Code Coverage"
    Assert-ExitCode "dotnet test"
}

if ($Fix) {
    Write-Step "dotnet format (auto-fix)"
    dotnet format $solution
    Assert-ExitCode "dotnet format"
} else {
    Write-Step "dotnet format (verify-only)"
    dotnet format $solution --verify-no-changes --verbosity diagnostic
    Assert-ExitCode "dotnet format"
}

# ---------------------------------------------------------------------------
# Frontend steps
# ---------------------------------------------------------------------------

if (-not $SkipFrontend) {
    $webDir = "$repoRoot/web"

    Write-Step "npm install (web)"
    Push-Location $webDir
    try {
        npm install
        Assert-ExitCode "npm install"

        Write-Step "npm run check (svelte-check)"
        npm run check
        Assert-ExitCode "npm run check"

        Write-Step "npm run build (vite)"
        npm run build
        Assert-ExitCode "npm run build"
    } finally {
        Pop-Location
    }
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

$stopwatch.Stop()
$elapsed = $stopwatch.Elapsed.ToString("mm\:ss")

Write-Host "`n✓ Build completed successfully in $elapsed" -ForegroundColor Green
exit 0
