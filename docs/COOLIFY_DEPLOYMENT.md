# HoofMate deployment model

## Separate production surfaces
- `hoofmate-landing` owns the marketing website at `https://hoofmate.site`.
- `hoofmate-app` owns the future application at `https://app.hoofmate.site`.

Use separate Coolify applications, health checks, and release lifecycles. This document records the intended domain split; it does not modify running services or DNS.

## Current application state
This repo contains a static prototype under `mock/` and no root package.json. Existing CI validates the prototype; production accounts, storage, and live AI are not implemented.

When the actual app is scaffolded, extend CI with its real install, test, typecheck, and build commands. Coolify should deploy the application from main after validation, using its native integration or an authenticated deployment webhook. Configure app.hoofmate.site when ready; do not deploy this mock over the marketing website.

Coolify owns container lifecycle, health checks, logs, and rollback. Keep tokens and credentials in secrets. The landing repository contains its own Dockerfile and gated Actions deployment instructions.
