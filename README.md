# fussyeater.club

Recipe web app for families with fussy eaters. Built with SvelteKit 5 and Cloudflare Workers.

## Run locally

Run all app commands from the repository root, not from specs/api.

```powershell
# from repo root
npm install
npm run dev
```

If you want to run the Worker preview locally:

```powershell
# from repo root
npm run build
npm run preview
```

If your terminal is currently in specs/api, move back to repo root first:

```powershell
Set-Location ..\..
```

## TypeSpec API contract

TypeSpec commands must be run from specs/api:

```powershell
Set-Location specs/api
npx tsp compile .
```
