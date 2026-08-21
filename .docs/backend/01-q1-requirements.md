# Q1 Requirements: Backend WebSocket Message Handler and Database Storage

Source: `Technical Assignment - fullstack.pdf`, page 2, "Q1: Backend WebSocket Message Handler & Database Storage".

Scope statement from the assignment: incoming robot data is validated and processed before being broadcast to clients.

## Requirements from Q1

### Q1-R1: Set up tools and dependencies

Set up and install the necessary tools and dependencies.

Acceptance: the backend starts from a clean checkout with documented steps.

### Q1-R2: Parse incoming robot data

Parse incoming robot data from the simulator.

Acceptance: telemetry sent by `robot-simulator.js` is read as structured data, not logged as text.

### Q1-R3: Validate the data structure

Validate that the data structure matches the expected format.

Expected telemetry format, per `INSTRUCTIONS.md`:

| Field | Type | Stated range |
|-------|------|--------------|
| `robotId` | string | identifier |
| `batteryPercentage` | number | 0 to 100 |
| `wifiSignalStrength` | number | -100 to 0 dBm |
| `isCharging` | boolean | — |
| `temperature` | number | CPU temp, Celsius |
| `memoryUsage` | number | 0 to 100 |
| `timestamp` | string | ISO 8601 |

Acceptance: messages matching the format are accepted; messages that do not match are rejected.

Assumption required: the simulator does not send `robotId` in the payload, and the assignment does not state what to do with invalid messages. See `../assumption/01-current-state-and-gaps.md` and `../assumption/03-decisions-and-open-questions.md`.

### Q1-R4: Store each message in MongoDB

Store each message in MongoDB.

Acceptance: every valid message received results in stored data.

Assumption required: the collection design is not specified. See `../assumption/02-data-model-and-api.md`.

### Q1-R5: Proper indexing

Storage must use proper indexing.

Acceptance: the queries the application actually runs are served by indexes.

Assumption required: which indexes, since the assignment does not name them. See `../assumption/02-data-model-and-api.md`.

### Q1-R6: Broadcast real-time updates

Broadcast real-time updates to connected dashboard clients.

Acceptance: every connected dashboard client receives updates as they arrive.

Assumption required: the message envelope. A partial contract exists in `frontend/src/types/robot.ts`. See `../assumption/02-data-model-and-api.md`.

## Requirements traced from Q2 and Q3

These are stated as frontend requirements in the assignment but need backend support to be satisfiable.

### Q1-R7: Online and offline status

Trace: Q2 "indicating whether each robot is online or offline", Q3 "Display the robot's status, indicating whether it is online or offline".

Acceptance: each robot's status is available to the frontend and changes when a robot stops or resumes reporting.

Assumption required: the assignment gives no definition of offline. See `../assumption/03-decisions-and-open-questions.md`, question Q-A.

### Q1-R8: Six hours of historical data per robot

Trace: Q3 "Display charts showing 6 hours of historical data for all metrics".

Acceptance: 6 hours of history for all metrics is retrievable for a single robot.

Assumption required: transport and payload shape are not specified. See `../assumption/02-data-model-and-api.md`.

### Q1-R9: Alert evaluation

Trace: Q2 alert system. Full trigger, message, and reset rules are specified in `../frontend/01-q2-requirements.md`, which is where the assignment places them.

The assignment does not state which side evaluates the rules. Our position is the backend, because the 5-minute rule requires continuous observation. This is an assumption, not a requirement. See `../assumption/03-decisions-and-open-questions.md`, decision D2.

Acceptance: the rules in `../frontend/01-q2-requirements.md` hold, including fire-once and reset behavior.

## Commit requirement

The assignment requires at least one commit per question. Q1 needs at least one commit.
