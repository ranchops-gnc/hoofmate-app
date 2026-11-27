# HoofMate deployment model

## Separate production surfaces
- `hoofmate-landing` owns the marketing website at `https://hoofmate.site`.
- `hoofmate-app` owns the future application at `https://app.hoofmate.site`.

Use separate Coolify applications, health checks, and release lifecycles. This document records the intended domain split; it does not modify running services or DNS.

## Development registry

The registry uses Node.js 24 and a versioned SQLite database. The existing horse dashboard runs at `/mock/`. Registry records and the mock sample data are independent.

After verifying StarSpur capacity, create a dedicated development application with the Dockerfile build pack and `Dockerfile.dev`. Select a development branch explicitly and leave automatic deploys disabled for the initial verification. The container listens on port 4173 and checks `/healthz`. Attach a dedicated development volume at `/data` with write access for UID 1000. The database path inside the container is `/data/registry.sqlite`.

Use a private network or authenticated gateway and sample records. The development registry has no login. Keep the database volume and any gateway credentials scoped to development. Verify all three species can be created and listed and that records survive a restart. Check CPU, memory, free disk, and the school and production workload baseline before and during the initial build.

Staging needs its own database and credentials. Production release requires authentication, tenant authorization, migration and backup verification, and approval.
