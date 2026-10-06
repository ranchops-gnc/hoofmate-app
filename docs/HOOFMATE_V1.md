# HoofMate v1 product brief

**Know Their Hooves. Track Their Story.**

## Purpose and audience
A focused hoof-care record and collaboration platform. Primary: horse owners managing their own horses (ranchers, recreational riders, rodeo competitors, trail riders). Secondary: farriers and barn managers. Veterinarians and trainers are authorized collaborators.

## Repository ownership
- `hoofmate-landing`: public marketing and care-record library at `hoofmate.site`.
- `hoofmate-app`: application development, eventually `app.hoofmate.site`.
Keep landing deployments and application releases independent.

## First-release workflow
Create horse → document LF / RF / LH / RH → attach dated photos → record farrier visit → review history → schedule next care → share selected history.

## Scope
1. Dashboard: upcoming appointments, recent records, horses.
2. Horse profile: identity, owner, care-team contacts.
3. Four hoof records: observations, measurements with units, dated photo timeline and view labels.
4. Farrier visits: provider, trim or shoeing, notes, recommendations, completed date, next appointment.
5. Reminders: owner-configured scheduling; do not infer medical urgency.
6. Sharing: owner-granted, revocable access with explicit roles and horse scope.
7. AI assistance: summarize supplied records and draft questions. Reference underlying records, preserve originals, require user review before saving.
8. Photo comparison: later validated capability; do not claim automated diagnosis.

## Data model proposal
Horse (owner); Hoof (horse, position); Photo (hoof, captured date, view, private object key); Observation (hoof, author, recorded date, notes, optional measurements); Visit (horse, provider, date, work, recommendations); Reminder (horse, due date, channel); CareTeamGrant (horse, principal, role, revocation); AiDraft (source record IDs, model/version, generated date, draft status).

## Engineering boundaries
Use authenticated server APIs, relational records, private object storage, authorization at every record and upload endpoint, and migrations. Keep observations distinguishable from professional assessments. Do not store API keys in Expo/web bundles. Use upload type/size checks and signed access, permission tests, backups with restore checks, and audit events for access grants and record changes. Confirm the application stack before adding dependencies; the repository currently contains a static mock, not a production app.

## Delivery sequence
- Milestone 1: authenticated horse / four-hoof records and private uploads.
- Milestone 2: visit history, appointments, reminders.
- Milestone 3: scoped care-team sharing and export.
- Milestone 4: reviewed AI summaries; evaluate photo comparison separately.

## Acceptance criteria
An owner can create a horse, document each hoof, retrieve original dated photos, log a visit, find the next appointment, and revoke shared access. Other owners cannot read these records or photos. AI failure never blocks reading or writing records. Export remains usable without AI.

## Current status
This document defines the agreed direction. Existing `mock/` remains a prototype with canned responses. The landing concept uses sample records. Accounts, persistent care data, sharing, reminders, and live AI have not been implemented by this brief.
