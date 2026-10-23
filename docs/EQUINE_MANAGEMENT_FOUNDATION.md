# Equine Management — shared foundation

Status: initial implementation, not production ready.

## Compatibility
The existing static `mock/` prototype and its CI remain unchanged. This module adds framework-neutral TypeScript domain contracts for eventual Expo mobile and React Native Web clients. No app scaffold or backend has been deployed.

## Domain boundaries
- Ranches and memberships isolate organizations.
- Horses belong to a ranch and have an owning user.
- Four-hoof records retain original observations and private photo object keys.
- Facilities and dated assignments track stalls, paddocks, and pastures.
- Care records capture farrier, veterinary, medication, and preventive visits.
- Feed plans and daily care tasks support barn operations.
- Appointments and boarding agreements provide scheduling and boarding foundations.
- Care-team grants are revocable and horse-scoped.

## API plan
Authenticated routes: `/v1/ranches`, `/v1/horses`, `/v1/horses/:id/hooves`, `/v1/horses/:id/care`, `/v1/spaces`, `/v1/assignments`, `/v1/feed-plans`, `/v1/tasks`, `/v1/appointments`, `/v1/boarding`, `/v1/grants`. Every route must check ranch membership and horse-level grants server-side; a client-side role check is not authorization.

## Next implementation gates
1. Scaffold Expo Router for iOS, Android and web, with shared core package.
2. Select backend, create versioned SQL migrations and authenticated API.
3. Add tenant-isolation and permission tests, including cross-owner denials.
4. Implement CRUD screens and offline-safe loading, empty, error and retry states.
5. Add signed private image uploads, audit logs, backups and restore tests.
6. Implement notifications, billing, and AI only after records and permissions work.

Do not put database credentials or service keys in Expo bundles. Keep the existing marketing site separate from `app.hoofmate.site`.
