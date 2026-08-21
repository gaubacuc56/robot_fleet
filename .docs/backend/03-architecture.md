# Backend Architecture, Schema and API

Design notes for the backend. Moved here out of `README.md`, which covers only
how to run the project.

- [Architecture](#architecture)
- [Database schema](#database-schema)
- [API documentation](#api-documentation)
- [Alert rules](#alert-rules)
- [Scaling](#scaling)
- [Configuration](#configuration)
- [Technical considerations](#technical-considerations)

---

## Architecture

```
   5 simulators                         browsers
        │                                   │
        │ ws://…/robots?robotId=X           │ ws://…/dashboard    http://…/api/*
        ▼                                   ▼                            ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │  backend  (:8080)                                                    │
   │  src/cluster.js → N workers, sharing the port via SO_REUSEPORT       │
   │                                                                      │
   │   telemetry.gateway ── validate ──▶ telemetry.service ───────┐       │
   │   dashboard.gateway ◀── publish ─────────────────────────────┤       │
   │   robot/telemetry.controller (REST)         presence.service         │
   └───────────────┬──────────────────────────────────┬───────────────────┘
                   │                                  │
                   ▼                                  ▼
              Redis (fan-out                      MongoDB
              between workers)              telemetry + robots
```

### Ingest path

```
frame → parse → validate → store reading → evaluate alerts
      → upsert robot state → publish update → publish alerts
```

Each step is its own module, and each layer only knows the one below it:

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Gateway | `features/*/\*.gateway.js` | uWS WebSocket handlers. No business logic, no database calls. |
| Controller | `features/*/\*.controller.js` | uWS HTTP routes. Parse, delegate, serialise. |
| Service | `features/*/\*.service.js` | Orchestrates the pipeline above. |
| Rules | `features/alert/alert.rules.js` | Pure functions. No I/O, no clock — the timestamp is a parameter. |
| Repository | `features/*/\*.repository.js` | The only place Mongoose is called. |
| DTO | `features/*/dtos/`, `domain/common/dtos/` | The shapes crossing the wire. |
| Infrastructure | `libs/` | Broadcaster, database, logger, uWS response safety. |

That boundary is what keeps the alert rules self-contained: the five-minute
rule is a function of `(previous state, reading, now)` with no clock and no I/O,
so it resolves against whatever instant the caller supplies.

### Layout

Feature-sliced, following the same conventions as `safari-ai-assignment`:
kebab-case folders, and a filename whose dot-suffix states the role. The
dependency direction stays visible from the tree alone — nothing in `libs/` or
`domain/` reaches into `features/`, and only `app.js` knows how the pieces
connect.

```
backend/
  src/
    main.js                        entry point: npm start, single process
    cluster.js                     entry point: npm run cluster, worker rule (Q4)
    app.js                         composition root: builds and injects everything
    config/env.config.js           environment parsing, worker-count resolution
    domain/
      common/dtos/                 fleetEvent.dto.js — the dashboard envelope
      common/enum/                 robotStatus, alertType, alertSeverity,
                                   fleetEventType
      entities/schema/             robot.entity.js, telemetry.entity.js
    features/
      alert/                       alert.rules.js — pure alert state machine
      telemetry/                   gateway, service, controller, repository,
                                   validation, dtos/
      robot/                       controller, repository, dtos/
      presence/                    presence.service.js — offline sweep
      dashboard/                   dashboard.gateway.js — browser fan-out
      health/                      health.controller.js
    libs/
      broadcaster/                 local vs redis, one interface
      database/                    connect, disconnect, index sync
      http/                        uWS response + async-handler safety
      logger/                      level-filtered console logger
      constant/messages.js         error codes and alert copy
  tools/simulator/                 provided fleet simulator, plus never-charge mode
```

Internal imports use Node's subpath imports
(`#features/...`, `#libs/...`, `#domain/...`, `#config/...`, declared in
`package.json`), so no module walks back up a `../../..` chain. Being plain Node
rather than a TypeScript path alias, they need the `.js` extension and a `#`
rather than safari's `@`.

---

## Database schema

Two collections. The split is deliberate: `telemetry` is an append-only history
that grows by roughly **432,000 documents per day** at 5 robots × 1 Hz, while
`robots` holds one document per robot. The dashboard's initial load and
`GET /api/robots` read a handful of documents by unique index instead of
aggregating the whole history.

### `telemetry` — append-only readings

| Field | Type | Notes |
|-------|------|-------|
| `robotId` | String | From the socket, never from the payload |
| `batteryPercentage` | Number | 0–100 |
| `wifiSignalStrength` | Number | −100–0 dBm |
| `isCharging` | Boolean | |
| `temperature` | Number | °C |
| `memoryUsage` | Number | 0–100 |
| `timestamp` | Date | The robot's clock. Charts use this. |

Indexes:

| Index | Serves |
|-------|--------|
| `{ robotId: 1, timestamp: -1 }` | the history query — one robot, newest-first, in a range |

### `robots` — current state and alert state

| Field | Type | Notes |
|-------|------|-------|
| `robotId` | String | **unique** |
| `batteryPercentage`, `wifiSignalStrength`, `isCharging`, `temperature`, `memoryUsage`, `timestamp` | | latest reading |
| `firstSeen`, `lastSeen` | Date | presence tracking |
| `status` | String | `online` \| `offline` |
| `lowBatterySince` | Date \| null | start of the current uninterrupted low-battery period |
| `lowBatteryNotified` | Boolean | fire-once flag, warning |
| `criticalBatteryNotified` | Boolean | fire-once flag, error |

Indexes: `{ robotId: 1 }` unique, and `{ status: 1, lastSeen: 1 }` for the
presence sweep.

The alert fields live here rather than in memory so that alert state survives a
restart, is shared by every dashboard client, and — critically — is shared
across cluster workers. In memory, the same alert would fire once per worker.

---

## API documentation

Base URL `http://localhost:8080`. The frontend reaches these through a Next
rewrite, so the browser calls its own origin at `/api/*`.

### WebSocket

#### `ws://localhost:8080/robots?robotId=<id>` — telemetry ingest

`robotId` is **required**; the upgrade is refused with `400` without it.

The payload the simulator sends — note that it does **not** contain `robotId`,
contrary to the example in `INSTRUCTIONS.md`. The id arrives once in the query
string and the server attaches it to every frame:

```json
{
  "batteryPercentage": 85.5,
  "wifiSignalStrength": -45,
  "isCharging": false,
  "temperature": 42.3,
  "memoryUsage": 67,
  "timestamp": "2026-08-20T10:30:00.000Z"
}
```

Invalid frames are logged and dropped. The connection stays open: one bad
message must not disconnect an otherwise healthy robot.

#### `ws://localhost:8080/dashboard` — fan-out to browsers

Server-to-client messages:

```json
{ "type": "initial_robots", "robots": [ /* Robot */ ], "alerts": [ /* Alert */ ] }
{ "type": "robot_update", "robotId": "00001", "data": { /* Robot */ } }
{ "type": "robot_connected", "robotId": "00001", "data": { /* Robot */ } }
{ "type": "robot_disconnected", "robotId": "00001", "data": { /* Robot */ } }
{ "type": "alert", "robotId": "00001", "alert": { /* Alert */ } }
```

`initial_robots` is sent on connect and carries the whole fleet plus any alerts
that are still active, so a page loaded mid-stream is populated immediately and
a reconnect does not lose alert state.

The contract is typed in `frontend/src/features/fleet/types.ts` and built in
`backend/src/domain/common/dtos/fleetEvent.dto.js`.
Change them together.

### REST

#### `GET /health`

```json
{ "status": "ok", "mongo": "connected", "uptime": 132.4, "pid": 41 }
```

`pid` is included so it is visible which cluster worker answered.

#### `GET /api/robots`

```json
{ "robots": [ { "robotId": "00001", "batteryPercentage": 85.5, "wifiSignalStrength": -45,
                "isCharging": false, "temperature": 42.3, "memoryUsage": 67,
                "timestamp": "…", "lastSeen": "…", "status": "online" } ] }
```

#### `GET /api/robots/:robotId`

`{ "robot": { … } }`, or `404` for an unknown id.

#### `GET /api/robots/:robotId/history`

| Query | Default | Notes |
|-------|---------|-------|

| `hours` | 6 | clamped to `HISTORY_MAX_HOURS` (24) |
| `bucketSeconds` | 30 | downsample interval, max 3600 |

```json
{
  "robotId": "00001",
  "from": "2026-08-20T04:30:00.000Z",
  "to": "2026-08-20T10:30:00.000Z",
  "hours": 6,
  "bucketSeconds": 30,
  "points": [
    { "timestamp": "…", "batteryPercentage": 85.5, "wifiSignalStrength": -45,
      "temperature": 42.3, "memoryUsage": 67, "isCharging": false, "samples": 30 }
  ]
}
```

Points are ordered oldest-first so charts render without sorting. Values are
bucket averages; `isCharging` cannot be averaged, so a bucket counts as charging
if the robot was charging for any part of it. An empty `points` array is a valid
response, not an error — a freshly started system has no six hours of history.

**Why downsample:** 6 hours at 1 Hz is 21,600 documents per robot. Returning
that raw would produce a slow, illegible chart. 30-second buckets give 720
points. `hours` is clamped so a client cannot request the entire collection.

Status codes: `200`, `400` (bad parameter), `404` (unknown robot), `500`.

---

## Alert rules

Both alerts are evaluated on the **backend** (`features/alert/alert.rules.js`).

| | Low battery | Critical battery |
|---|---|---|
| Trigger | battery < 20% **and** not charging | the same condition held **5+ consecutive minutes** |
| Message | `Robot {ID} is low battery!` | `Robot {ID} will be shut down soon!` |
| Severity | Warning | Error |
| Fires | once, on entering the condition | once, when the threshold is crossed |
| Resets | battery ≥ 20% **or** charging starts | battery ≥ 20% **or** charging starts |

Details that the wording leaves open, and the decisions taken:

- **Exactly 20% is not low.** The trigger is strictly less than 20; the reset is
  greater than or equal to 20.
- **"Consecutive" is strict.** Any charging event or any reading at or above 20%
  clears `lowBatterySince`, so the five minutes start over rather than resuming.
- **Offline freezes the countdown.** A robot that is not reporting cannot have
  the condition confirmed, so no alert fires while it is offline. Going offline
  is not one of the two stated reset conditions, so the state is preserved
  rather than cleared.
- **Why the backend evaluates them.** The five-minute rule needs continuous
  observation. A browser tab opened two minutes into a low-battery period cannot
  know how long the condition has held; the server can, because the countdown
  start is stored. This also keeps alerts consistent across multiple clients and
  across page reloads.

**Demonstrating the critical alert.** The stock simulator makes it practically
unreachable: it forces charging at ≤15% battery and drains at 0.1%/second, so
the sub-20%-not-charging window lasts about 50 seconds, never 5 minutes. Two
things address this — `DRAIN_ROBOT_ID` names a robot that never charges, and
`CRITICAL_BATTERY_MINUTES` lowers the threshold for a demo. Leave the latter at
5 for the real behaviour.

---

## Scaling

Two independent layers, both active under Compose.

### Within a host: `src/cluster.js`

```bash
cd backend
WORKERS=4 npm run cluster
```

Worker count is `WORKERS`, else the CPU count, capped at **4**, floor 1. Invalid
values fall back rather than crashing.

**How several workers share one port.** uWebSockets.js does not use Node's `net`
server, so Node's `cluster` module cannot round-robin connections the way it
does for an `http.Server`. Instead every worker calls `listen()` on the same
port and uSockets sets `SO_REUSEPORT`, letting the kernel distribute incoming
connections across the listening sockets. This is Linux-specific.

Verify it: `curl -s localhost:8080/health` repeatedly and watch `pid` change.

### Across workers: Redis

**Clustering alone breaks the broadcast**, and this is the part worth
understanding. uWS pub/sub topics are per-process, so a robot connected to
worker 2 publishes only to dashboard clients on worker 2 — every other client
silently sees nothing. Set `REDIS_URL` and each worker subscribes to one Redis
channel, so a publish from any worker reaches all of them, across containers as
well as processes. Without it, `src/cluster.js` logs a warning at startup.

The same shared state fixes two more clustering defects:

| Defect | Fix |
|--------|-----|
| Alert fires once per worker | Alert state lives in the `robots` document, not in memory |
| Every worker publishes the same offline transition | The presence sweep uses a conditional update, so only the winner gets a document back and publishes |

Because Redis carries the fan-out, no sticky sessions are needed: any worker can
serve any dashboard client. Scaling further — several backend containers behind
a load balancer — needs no code change for the same reason. `nginx/nginx.conf`
is that optional extra layer, `least_conn` across backend replicas.

If Redis is configured but unreachable, the backend logs the failure and falls
back to in-process fan-out rather than refusing to boot.

---

## Configuration

`backend/env.example` documents every variable; copy it to `backend/.env` when
running directly. Under Compose the values come from `docker-compose.yml`, where
each one carries an inline default; a `.env` beside it overrides them.

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `8080` | HTTP + WebSocket port |
| `MONGODB_URI` | `mongodb://localhost:27017/robot-fleet` | database |
| `REDIS_URL` | unset | cross-worker fan-out; required for cluster mode |
| `WORKERS` | CPU count | cluster workers, capped at 4 |
| `OFFLINE_TIMEOUT_MS` | `10000` | silence before a robot is offline |
| `PRESENCE_SWEEP_INTERVAL_MS` | `5000` | how often silence is checked |
| `HISTORY_WINDOW_HOURS` | `6` | default chart window |
| `HISTORY_MAX_HOURS` | `24` | cap on a requested window |
| `HISTORY_BUCKET_SECONDS` | `30` | downsample interval |
| `LOW_BATTERY_THRESHOLD` | `20` | alert threshold, % |
| `CRITICAL_BATTERY_MINUTES` | `5` | critical alert threshold |
| `LOG_LEVEL` | `info` | `error` \| `warn` \| `info` \| `debug` |
| `ROBOT_COUNT` | `5` | simulator fleet size |
| `DRAIN_ROBOT_ID` | unset | robot that never charges, for the critical alert |

---

## Technical considerations

**Robot identity.** The simulator's payload carries no `robotId`, so the server
takes it from the upgrade query string and attaches it to every frame. An
upgrade without one is refused — otherwise that robot's telemetry would be
stored under `undefined`. A payload claiming a different id cannot override the
socket's.

**Robot ids are opaque.** The simulator generates `00001`–`00005`, while
`INSTRUCTIONS.md` shows `ROBOT_001`. Nothing parses the id or assumes a prefix.

**Backpressure and validation are per-message.** A malformed or out-of-range
frame is dropped with a logged reason and the socket stays open.

**uWS async safety.** A uWS response object becomes invalid as soon as the
client disconnects, and writing to an invalid response crashes the process. All
async routes register `res.onAborted()` before their first `await` and write
inside `res.cork()`, centralised in `libs/http/response.util.js`.

**No Express.** `express` and `cors` were installed but unused, and were
removed. uWS serves the REST routes itself, which keeps one server, one port and
one listen socket to share across cluster workers.

**Graceful shutdown.** `SIGINT` and `SIGTERM` both close the listen socket, the
Redis clients and the Mongo connection before exiting. Docker sends `SIGTERM`,
which the original code did not handle at all. Writes are skipped once the
database is closed, so a robot disconnecting during shutdown does not log errors.

**Node version.** uWebSockets.js v20.33.0 ships prebuilt binaries for Node 16,
18 and 20 only, linked against glibc. On Node 21+ the require fails. Hence
`node:20-bookworm-slim` in the Dockerfile, not Alpine, and `>=18 <21` in
`package.json`.

### Fixes to the provided boilerplate

| Issue | Resolution |
|-------|-----------|
| `SIGINT` handler called `process.exit(0)` immediately | Full graceful shutdown, plus `SIGTERM`. |
| `connectDB` called `process.exit(1)` internally | Throws instead, so the caller decides. |
| Unexplained 300 ms `setTimeout` around `res.upgrade` | Removed; the abort guard it needed is gone with it. |
| Unused `express`, `cors`, `mongodb`, `ws`, `@types/ws` | Removed. |
| Boilerplate `TODO` comments | All resolved or removed. |

A bug worth calling out, because it is easy to reintroduce: spreading a Mongoose
document (`{ ...robot }`) does **not** copy schema fields — they sit behind
getters on `_doc`. Alert state read that way came back `undefined`, so the low
battery alert re-fired on every single frame. `Robot.toAlertState()` now returns
a plain object.

### Known limitations

- **Redis fan-out was not exercised end-to-end.** No Redis was reachable in the
  development environment. Cluster mode itself is verified (multiple workers,
  one port, connections landing on different PIDs), and the fallback to local
  fan-out works, but the multi-worker broadcast should be confirmed under
  Compose: open the dashboard and check that all 5 robots appear.
- **`SO_REUSEPORT` is Linux-specific.** Cluster mode on macOS or Windows will
  not distribute connections the same way.
- No authentication or authorisation on either the WebSocket or REST endpoints.
- No alert history collection; only currently active alert state is kept.
