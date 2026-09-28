# HoofMate

Care Ops Assistant prototype for horse operations teams.

## Current implementation (data-backed mock)

This repository now includes a single-ranch, single-horse operator workflow with a grounded assistant.

Implemented scope:
- One ranch and one horse (`Leoti` at Pine Creek Ranch)
- Data model entities: horses, care events, ride logs, contacts, alerts, tasks, users, audit log
- Today-focused dashboard: overdue care, next 7-day care schedule, open safety alerts, reminders
- Quick actions with role-based permissions: mark complete, snooze, assign, log ride
- Ask HoofMate grounded intents:
  - show overdue care
  - show next care window
  - create reminder (confirmation required)
  - log ride (confirmation required)
  - call contact
- Write operations tracked in audit log

## Run the mock dashboard

```bash
cd /home/runner/work/hoofmate-app/hoofmate-app
npm install
npm run start:mock
# visit http://localhost:4173
```

## Quality gates

```bash
npm run lint
npm test
npm run build
```

- `lint`: lightweight static checks for JavaScript files
- `test`: Node test suite for scheduling rules, role permissions, and assistant intents
- `build`: copies static mock app into `/dist`

## Release staging

1. **Release 1:** Data-backed dashboard + care/task CRUD
2. **Release 2:** Actionable grounded assistant with safe write confirmations
3. **Release 3:** Smart recommendations (risk flags and optimization suggestions)

## Success criteria

- Manual scheduling effort decreases over time
- No missed critical care events during pilot
- Assistant action acceptance and correction rates are measurable
