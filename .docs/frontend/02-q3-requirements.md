# Q3 Requirements: Robot Detail Page with Historical Charts

Source: `Technical Assignment - fullstack.pdf`, page 3, "Q3: Frontend Robot Detail Page with Historical Charts".

Scope statement from the assignment: the dashboard only shows live telemetry. A feature to show historical data is also needed.

Trigger stated by the assignment: the user clicks on a robot, a row or a card, on the dashboard page.

## Requirements

### Q3-R1: Navigate to the detail view

Navigate to the detailed view for that specific robot.

Acceptance: clicking a robot on the dashboard opens a view for that robot.

### Q3-R2: Status display

Display the robot's status, indicating whether it is online or offline.

Acceptance: the detail view shows online or offline for this robot.

Assumption required: the assignment gives no definition of offline. See `../assumption/03-decisions-and-open-questions.md`, question Q-A.

### Q3-R3: Six hours of historical charts

Display charts showing 6 hours of historical data for all metrics.

"All metrics" covers the five named in Q2:

| Metric | Field |
|--------|-------|
| Battery % | `batteryPercentage` |
| WiFi strength | `wifiSignalStrength` |
| Charging status | `isCharging` |
| Temperature | `temperature` |
| Memory usage | `memoryUsage` |

Acceptance: charts cover a 6-hour window and include all metrics.

Assumptions required:

- How `isCharging`, a boolean, is charted. See `../assumption/03-decisions-and-open-questions.md`, question Q-F.
- Chart count and layout are not specified.
- Behavior when less than 6 hours of data exists is not specified.

### Q3-R4: Charts update in real time

Charts should update in real time as new data arrives.

Acceptance: with the page open, charts advance as new telemetry arrives, without a reload.

## Dependency on Q1

This page cannot be satisfied without backend support for retrieving 6 hours of history. Tracked as `../backend/01-q1-requirements.md`, Q1-R8.

## Commit requirement

The assignment requires at least one commit per question. Q3 needs at least one commit.
