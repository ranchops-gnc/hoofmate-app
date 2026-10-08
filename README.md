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

The application stack is not yet scaffolded. Keep existing CI for the mock until implementation introduces actual build and test commands. See [deployment model](docs/COOLIFY_DEPLOYMENT.md).
