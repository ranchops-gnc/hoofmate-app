# HoofMate deployment model

Production domain: https://hoofmate.site

## Responsibility split

- GitHub Actions validates changes and performs security checks.
- Coolify owns production builds, deployments, container lifecycle, health checks, logs, and rollback.
- Production should deploy from the repository's `main` branch.
- Do not store VPS SSH keys in GitHub Actions for normal Coolify deployments.

## Current repository state

The repository is currently a static prototype under `mock/`. There is no root `package.json` yet, so CI intentionally validates the static prototype instead of pretending an Astro/Expo application already exists.

When the real application scaffold is committed, extend `.github/workflows/ci.yml` with the repository's actual install, lint, test, typecheck, and build commands.

## Coolify

Configure the Coolify application to use:

- Repository: `ranchops-gnc/hoofmate-app`
- Branch: `main`
- Production domain: `https://hoofmate.site`
- Automatic deployment: enabled after successful changes are merged to `main`
- Health checks: enabled once the application exposes a stable health endpoint

Prefer Coolify's native GitHub integration/webhook over a GitHub Actions SSH deployment.
