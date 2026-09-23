# HoofMate

AI-powered horse management platform built for ranchers, horse owners, trainers, and rodeo competitors.

## Mock-only mode (current)

The DeepSeek share linked from the ChatGPT thread is blocked from this environment (CloudFront 403), so this pass implements the **mock-only AI dashboard** requested there.

Open the static prototype:

```bash
cd mock
python3 -m http.server 4173
# then visit http://localhost:4173
```

What is mocked today:

- Horse profile for **Leoti** at Pine Creek Ranch
- Upcoming care (farrier, dewormer, vaccines, dental)
- Safety monitor and emergency contacts
- Ask HoofMate with local canned replies (no live model)
- Log-a-ride writes a mock note into the chat only

## Planned product features

- Horse profiles
- Health records
- Vaccination tracking
- Ride logging
- Care scheduling
- Emergency contacts
- AI ranch assistant (live model later)
- Pasture management
- Weight tracking

## Stack (target)

- Astro
- Node.js
- PostgreSQL
- Docker
- Cloudflare
- Nginx Proxy Manager
