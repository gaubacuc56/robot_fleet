# Frontend Architecture and Decisions

Design notes for the dashboard. Moved here out of `README.md`, which covers only
how to run the project.

- [Data flow](#data-flow)
- [Layout](#layout)
- [Chart decisions](#chart-decisions)
- [Configuration](#configuration)
- [Technical considerations](#technical-considerations)

---

## Data flow

```
FleetProvider ── one WebSocket ──▶ reducer ──▶ robots map + alert list
     │                                              │
     ├── dashboard page (table, metrics, alerts)     │
     └── detail page ── REST history + live tail ──▶ charts
```

State lives in `FleetProvider`, above both pages, for two reasons: the detail
page needs the same live stream and the same online/offline value as the
dashboard, and one socket for the whole app means navigating between pages does
not drop and re-open the connection.

The message contract is typed in `src/features/fleet/types.ts` (the event
envelope), `src/model/robot.ts` (the entity) and `src/features/alert/types.ts`,
and built in `backend/src/domain/common/dtos/fleetEvent.dto.js`. Change them
together. Event
types the client handles: `initial_robots`, `robot_update`, `robot_connected`,
`robot_disconnected`, `alert`.

---

## Layout

Feature-sliced, following the same conventions as `oem/oem-community`: a domain
owns its own `api/`, `hooks/`, `components/`, `types` and `utils`, and route
files hold no logic at all.

One rule, the mirror of the backend's: **generic layers never import features.**
`components/fragments`, `hooks`, `utils`, `constants` and `config` know nothing
about a robot's domain, so they stay reusable across features.
Features may import them, and pages may import features.

```
frontend/src/
├── app/                          App Router — routing only
│   ├── layout.tsx                    document shell, metadata, fonts
│   ├── page.tsx                      6-line shell → components/pages/dashboard
│   └── robots/[robotId]/page.tsx     6-line shell → components/pages/robot-detail
├── components/
│   ├── layouts/AppShell/         header and content well, no state
│   ├── providers/                AntdRegistry (SSR styles), AppProviders (the stack)
│   ├── fragments/                shared presentational primitives, domain-agnostic
│   │   ├── charts/MetricChart/       one metric over time + charging bands
│   │   └── metrics/                  Battery, Charging, Wifi, Temperature, Memory, Status
│   └── pages/                    one folder per route, `internal/` for its private parts
│       ├── dashboard/                Dashboard.tsx + FleetSummary, RobotTable
│       └── robot-detail/             RobotDetail.tsx + Telemetry, HistoryCharts, NotFound
├── features/                     the domains
│   ├── fleet/                    the live stream
│   │   ├── api/                      FetchRobots, FetchRobot (REST fallback)
│   │   ├── hooks/                    useFleet, useRobot
│   │   ├── providers/                FleetProvider — owns the one WebSocket
│   │   ├── state/                    fleet-reducer (pure), fleet-context
│   │   └── types.ts                  the event envelope
│   ├── alert/                    components/AlertPanel, hooks/useAlertNotifications
│   └── robot-history/            api/FetchRobotHistory, hooks/useRobotHistory
├── config/env.ts                 every process.env read, in one place
├── constants/                    api paths, routes, metric thresholds, palette
├── hooks/useWebSocket.ts         generic, message-shape agnostic
├── model/robot.ts                the shared entity
├── styles/globals.css            document-level only; antd does component styling
└── utils/                        api-client (the single fetch entry point), format
```

Conventions worth knowing before adding a file:

- **Only components get an `index.ts`**, and it re-exports just that component:
  `Foo/Foo.tsx` + `Foo/index.ts`. There are no barrels anywhere else — hooks,
  api functions, types, reducers and constants are imported from the file that
  declares them, so every import path names its source. Anything only one
  component needs — `types.ts`, `utils.ts`, `columns.tsx` — sits beside it and
  is imported directly.
- **`internal/`** marks components private to their parent. If something under
  `internal/` gets a second consumer, it moves to `components/fragments`.
- **`api/` is one exported function per file**, named after the call
  (`FetchRobotHistory.ts`), re-exported from `api/index.ts`.
- **No `process.env` outside `config/`**, and no hardcoded URL, colour or
  threshold outside `constants/`.

---

## Chart decisions

**Live charts mix two resolutions.** The chart body is server-bucketed at 30
seconds; live points are appended raw at 1 Hz, so the right edge is denser than
the rest. That is a deliberate trade for immediacy over uniformity, and the
window is rolling — points older than the window are dropped so an open tab
does not grow forever.

**`isCharging` is not charted as a line.** A boolean line chart says nothing
useful, so charging periods are drawn as shaded bands over the battery chart,
which also explains why the battery curve rises.

**Fixed chart axes.** Battery, memory and WiFi use fixed domains. An auto-scaled
battery axis makes a 2% dip look like a cliff.

**Empty history is not an error.** A freshly started system has no six hours of
data; `points: []` renders as an empty chart, not a failure state.

---

## Configuration

Build-time variables, inlined into the browser bundle:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_WEBSOCKET_URL` | `ws://localhost:8080` | dialled by the **browser**, so it must resolve on the host |
| `BACKEND_URL` | `http://localhost:8080` | used by the **frontend server** for the `/api` proxy rewrite |

These two are different values and mixing them up is the most common Compose
failure: the browser cannot resolve `backend`, and the frontend container cannot
reach `localhost:8080`. `NEXT_PUBLIC_WEBSOCKET_URL` is baked in at build time,
so changing it requires `docker compose build frontend`.

---

## Technical considerations

**Frontend strictness.** `tsconfig.json` had `"strict": false`; it is now on and
the codebase typechecks clean.

**Alerts are backend-evaluated.** The UI only renders what arrives on the
socket; it does not re-derive the low or critical battery condition. See
[../backend/03-architecture.md#alert-rules](../backend/03-architecture.md#alert-rules).

### Fixes to the provided boilerplate

| Issue | Resolution |
|-------|-----------|
| Root layout imported antd's `ConfigProvider` in a **server** component | Split into `components/providers/AppProviders` with `'use client'`. The app could not be built before this. |
| `AntdRegistry` was a no-op `<div>` — no SSR style extraction | Implemented with `@ant-design/cssinjs`, so styles are inlined during SSR instead of flashing after hydration. |
| `useWebSocket` cleanup closed over a stale socket ref | `connect` is a `useCallback` and the effect depends on it. |
| `useRef<NodeJS.Timeout>()` fails under strict mode | Typed `\| null` with an initial value. |
| `next.config.js` hardcoded `localhost:8080` | Driven by `BACKEND_URL`. |
| `eslint-config-next@14` with `next@15` | Aligned; an ESLint config was added, since none existed. |

### Known limitations

- **Not verified in a browser.** Docker was unavailable in the development
  environment, so the UI was verified through server-rendered HTML, the
  production build, typecheck and lint, plus WebSocket and REST behaviour driven
  from Node clients. Live DOM updates were not clicked through by hand.
- `npm run typecheck`, `npm run lint` and `npm run build` are the checks.
