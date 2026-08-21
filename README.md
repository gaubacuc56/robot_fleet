# Robot Fleet Management Dashboard

Real-time fleet monitoring: robot simulators stream telemetry over WebSocket, a
uWebSockets.js backend stores it in MongoDB and fans it out to browser clients,
and a Next.js dashboard shows live status, alerts, and 6 hours of history per
robot.

This file covers **how to run and verify the project**. Design notes live in
[`docs/`](#documentation).

- [Prerequisites](#prerequisites)
- [Run with Docker Compose](#run-with-docker-compose)
- [Run without Docker](#run-without-docker)
- [Verify](#verify)
- [Configuration](#configuration)
- [Documentation](#documentation)

---

## Prerequisites

Either

- **Docker** with Compose v2, or
- **Node.js 18–20** and a local MongoDB on `mongodb://localhost:27017`

> **Node version matters.** uWebSockets.js v20.33.0 ships prebuilt binaries for
> Node 16, 18 and 20 only. On Node 21+ the require fails with *"supports only
> Node.js LTS versions 16, 18 and 20"*. The Docker images use
> `node:20-bookworm-slim` for this reason.

---

## Run with Docker Compose

```bash
docker compose up -d
```

Then open **http://localhost:3000**. The fleet appears within a few seconds.

`docker-compose.yml` starts MongoDB, Redis, the backend, the frontend and the
robot simulator.

```bash
docker compose ps            # service health
docker compose logs -f backend
docker compose down          # stop
docker compose down -v       # stop and delete the database volume
```

---

## Run without Docker

Three terminals. MongoDB must already be running on `mongodb://localhost:27017`.

```bash
# 1. backend
cd backend
cp env.example .env          # optional; every value has a default
npm install
npm start                    # single process on :8080
# or: npm run cluster        # multiple workers on the same port

# 2. robot simulator
cd backend
npm run simulator            # 5 robots, 1 message/second each

# 3. frontend
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

---

## Verify

### Frontend static checks

```bash
cd frontend
npm run typecheck            # tsc --noEmit, strict mode
npm run lint
npm run build                # production build
```

### Checking the running stack

```bash
curl -s localhost:8080/health                    # status, mongo, pid
curl -s localhost:8080/api/robots                # all robots, current state
curl -s localhost:8080/api/robots/00001          # one robot (404 if unknown)
curl -s 'localhost:8080/api/robots/00001/history?hours=6&bucketSeconds=30'
```

In the dashboard at http://localhost:3000:

| Check | How |
|-------|-----|
| Live updates | Values change every second with no page reload. |
| Online → offline | `docker compose stop simulator`; robots flip to offline within `OFFLINE_TIMEOUT_MS`. Start it again and they return. |
| Low battery alert | Robot `00001` never charges (`DRAIN_ROBOT_ID`), so it crosses 20% about 20 seconds in. One warning, fired once. |
| Critical battery alert | Set `CRITICAL_BATTERY_MINUTES=1` in `.env` and restart, or wait 5 minutes. One error notification, fired once. |
| Detail page | Click any row; the 6-hour charts load and keep extending while the page stays open. |

---

## Backend structure

Feature-sliced, following the same conventions as `safari-ai-assignment`:
kebab-case folders, and a filename whose dot-suffix states the role —
`*.controller.js`, `*.service.js`, `*.gateway.js`, `*.repository.js`,
`*.entity.js`, `*.enum.js`, `*.rules.js`, `*.config.js`, `*.util.js`. You can
tell what a file does before opening it.

One rule: dependencies point inwards, never back out. Gateways and controllers
may call services, services may call rules, repositories and the broadcaster,
and nothing calls a gateway. `app.js` is the only module that knows how the
pieces fit together, so no other module carries wiring concerns.

```
backend/
├── src/
│   ├── main.js                   npm start        — bootstrap + signal handlers
│   ├── cluster.js                npm run cluster  — forks workers on one port
│   ├── app.js                    composition root: builds and injects everything
│   ├── config/
│   │   └── env.config.js             every process.env read, resolved once
│   ├── domain/                   shared vocabulary — no I/O, no framework
│   │   ├── common/
│   │   │   ├── dtos/fleetEvent.dto.js    the dashboard event envelope
│   │   │   └── enum/                     robotStatus, alertType, alertSeverity,
│   │   │                                 fleetEventType
│   │   └── entities/schema/
│   │       ├── robot.entity.js           current state per robot
│   │       └── telemetry.entity.js       append-only history
│   ├── features/
│   │   ├── alert/                    battery rules — pure state machine
│   │   │   ├── alert.rules.js
│   │   │   └── dtos/response.js
│   │   ├── dashboard/
│   │   │   └── dashboard.gateway.js      WS /dashboard, fan-out to browsers
│   │   ├── health/
│   │   │   └── health.controller.js      GET /health, for the container probe
│   │   ├── presence/
│   │   │   └── presence.service.js       offline sweep for silent robots
│   │   ├── robot/
│   │   │   ├── robot.controller.js       GET /api/robots, /api/robots/:robotId
│   │   │   ├── robot.repository.js       every Robot query, named by intent
│   │   │   └── dtos/response.js          the shape sent to clients
│   │   └── telemetry/
│   │       ├── telemetry.gateway.js      WS /robots, ingest from simulators
│   │       ├── telemetry.service.js      the ingest pipeline
│   │       ├── telemetry.controller.js   GET /api/robots/:robotId/history
│   │       ├── telemetry.repository.js   inserts + the bucketing aggregation
│   │       ├── telemetry.validation.js   inbound frame validation
│   │       └── dtos/                     request.js (window), response.js
│   └── libs/                     cross-cutting infrastructure
│       ├── broadcaster/              local vs redis fan-out, one interface
│       ├── constant/messages.js      error codes and alert copy
│       ├── database/                 connect, disconnect, index sync
│       ├── http/                     uWS response and async-handler safety
│       └── logger/
└── tools/
    └── simulator/                robot simulator; a dev tool, not part of the app
```

Internal imports use Node's built-in subpath imports — `#features/...`,
`#libs/...`, `#domain/...`, `#config/...`, declared in `package.json` — so no
module walks back up a `../../..` chain. Being plain Node rather than a
TypeScript path alias, they need the `.js` extension and a `#` rather than
safari's `@`.

---

## Frontend structure

Feature-sliced, following the same conventions as `oem/oem-community`: a domain
owns its own `api/`, `hooks/`, `components/`, `types` and `utils`, and route
files hold no logic at all.

One rule, the mirror of the backend's: **generic layers never import features.**
`components/fragments`, `hooks`, `utils`, `constants` and `config` know nothing
about a robot's domain. Features may import them; pages may import features.

```
frontend/
├── src/
│   ├── app/                      App Router — routing only, 6-line shells
│   │   ├── layout.tsx                document shell, metadata, fonts
│   │   ├── page.tsx                  → components/pages/dashboard
│   │   └── robots/[robotId]/         → components/pages/robot-detail
│   ├── components/
│   │   ├── layouts/                  AppShell: header and content well, no state
│   │   ├── providers/                AntdRegistry (SSR styles), AppProviders (the stack)
│   │   ├── fragments/                shared primitives, domain-agnostic
│   │   │   ├── charts/                   MetricChart: one metric over time
│   │   │   └── metrics/                  Battery, Charging, Wifi, Temperature, Memory, Status
│   │   └── pages/                    one folder per route, internal/ for its private parts
│   │       ├── dashboard/                + FleetSummary, RobotTable
│   │       └── robot-detail/             + RobotTelemetry, RobotHistoryCharts, RobotNotFound
│   ├── features/                 the domains
│   │   ├── fleet/                    api, hooks, providers/FleetProvider, state/fleet-reducer
│   │   ├── alert/                    AlertPanel, useAlertNotifications, merge rules
│   │   └── robot-history/            FetchRobotHistory, useRobotHistory
│   ├── config/env.ts             every process.env read, in one place
│   ├── constants/                api paths, routes, metric thresholds, palette
│   ├── hooks/                    useWebSocket — generic, message-shape agnostic
│   ├── model/                    robot.ts, the shared entity
│   ├── styles/                   document-level CSS only; antd styles components
│   └── utils/                    api-client (the single fetch entry point), format
└── public/                       static assets served at the site root
```

Adding a file: **only components get an `index.ts`**, and it re-exports just
that component (`Foo/Foo.tsx` + `Foo/index.ts`) — everything else is imported
from the file that declares it, so an import path names its source. `internal/`
marks components private to their parent; `api/` is one exported function per
file; and no `process.env` outside `config/`, no hardcoded URL, colour or
threshold outside `constants/`. Details in
[docs/frontend/03-architecture.md](docs/frontend/03-architecture.md#layout).

---

## Configuration

Every value has a default, so nothing needs to be set to run either way.

**Running directly:** `cp backend/env.example backend/.env` and edit. That file
lists every variable the backend and simulator read; the two that matter most
often are `PORT` (`8080`) and `MONGODB_URI`
(`mongodb://localhost:27017/robot-fleet`).

**Under Compose:** the values are set in `docker-compose.yml`, each with an
inline default, so `backend/.env` is not used. To override one without editing
the file, put it in a `.env` next to `docker-compose.yml` — Compose reads that
automatically:

| Variable | Default | Purpose |
|----------|---------|---------|
| `WORKERS` | `2` | cluster workers per backend container |
| `ROBOT_COUNT` | `5` | simulator fleet size |
| `DRAIN_ROBOT_ID` | `00001` | robot that never charges, so the critical alert is reachable |
| `LOW_BATTERY_THRESHOLD` | `20` | alert threshold, % |
| `CRITICAL_BATTERY_MINUTES` | `5` | critical alert threshold; lower it to demo the alert |
| `OFFLINE_TIMEOUT_MS` | `10000` | silence before a robot is offline |
| `HISTORY_BUCKET_SECONDS` | `30` | chart downsampling interval |
| `PUBLIC_WEBSOCKET_URL` | `ws://localhost:8080` | dialled by the browser; baked in at build time, so changing it needs `docker compose build frontend` |
| `LOG_LEVEL` | `info` | `error` \| `warn` \| `info` \| `debug` |

> `backend/env.example` is named without a leading dot so it is not caught by
> the `.env*` ignore rules.

---

## Documentation

| Document | Content |
|----------|---------|
| [docs/backend/03-architecture.md](docs/backend/03-architecture.md) | Backend architecture, database schema, API documentation, alert rules, scaling, technical considerations |
| [docs/frontend/03-architecture.md](docs/frontend/03-architecture.md) | Frontend data flow, chart decisions, technical considerations |
| [docs/](docs/README.md) | Requirement breakdown per assignment question, and the assumptions behind each decision |
