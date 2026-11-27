# HoofMate

**Know Their Hooves. Track Their Story.**

A hoof-care record and collaboration platform in development for horse owners, farriers, and barn managers.

Read the [v1 product brief](docs/HOOFMATE_V1.md) for the workflow, scope, data model proposal, and delivery milestones.

## Repository boundaries
- This repository: application prototype and future app at `app.hoofmate.site`.
- [hoofmate-landing](https://github.com/ranchops-gnc/hoofmate-landing): public website at `hoofmate.site`.

## Current prototype
The `mock/` directory is static sample data with canned AI replies. It has no real accounts, persistent horse records, sharing, or live AI.

```sh
cd mock
python3 -m http.server 4173
```

See the [deployment model](docs/COOLIFY_DEPLOYMENT.md) for the development and production boundaries.

## Run the shared animal registry

Use Node.js 24 or later. No dependency installation is needed.

```sh
npm test
npm run build
npm start
```

Open http://127.0.0.1:4173. Add a horse, goat, or sheep by name or tag ID and filter the list by species. The horse dashboard demo is available at `/mock/`.

The registry creates a development-only SQLite database at `.hoofmate-dev/registry.sqlite`. Set `HOOFMATE_DEV_DB` to use a different development file. The server listens on loopback by default and uses a single shared registry with no login. Use sample data.
