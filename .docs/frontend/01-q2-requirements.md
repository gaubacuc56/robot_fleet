# Q2 Requirements: Dashboard Page with Live Updates and Alerts

Source: `Technical Assignment - fullstack.pdf`, pages 2 and 3, "Q2: Frontend Dashboard Page with Live Updates & Alerts".

Scope statement from the assignment: build a dashboard with the components below.

## Main dashboard view

### Q2-R1: Robot list display

Show all robots.

Acceptance: every robot in the fleet appears on the dashboard.

### Q2-R2: Online and offline indication

Show each robot's current status, indicating whether each robot is online or offline.

Acceptance: each robot displays a status of online or offline.

Assumption required: the assignment gives no definition of offline. See `../assumption/03-decisions-and-open-questions.md`, question Q-A.

### Q2-R3: Key metrics

Display key metrics. The assignment names five:

| Metric | Field |
|--------|-------|
| Battery % | `batteryPercentage` |
| WiFi strength | `wifiSignalStrength` |
| Charging status | `isCharging` |
| Temperature | `temperature` |
| Memory usage | `memoryUsage` |

Acceptance: all five are visible per robot.

### Q2-R4: Auto-refresh with live data

Auto-refresh with live data.

Acceptance: displayed values update without user action.

## Alert system

The assignment requires two types of alerts.

### Q2-R5: Low battery alert trigger

Trigger: battery < 20% AND not charging.

Acceptance: the alert raises when both conditions hold. Battery at exactly 20% does not trigger it.

### Q2-R6: Low battery alert message and severity

Message: `Robot {ID} is low battery!`

Severity: Warning.

Acceptance: the text matches exactly, with the robot ID substituted, and it is presented as a warning.

### Q2-R7: Low battery alert behavior

Notify once when the condition is met. Reset when the battery is >= 20% OR the robot starts charging.

Acceptance:

- One notification per occurrence, not one per telemetry message.
- After a reset, a new occurrence can notify again.

### Q2-R8: Critical battery alert trigger

Trigger: battery < 20% AND not charging for 5 or more consecutive minutes.

Acceptance: the alert raises only after the condition has held continuously for 5 minutes.

### Q2-R9: Critical battery alert message and severity

Message: `Robot {ID} will be shut down soon!`

Severity: Error.

Acceptance: the text matches exactly, with the robot ID substituted, and it is presented as an error.

### Q2-R10: Critical battery alert behavior

Notify once when the 5-minute threshold is reached. Reset when the battery is >= 20% OR the robot starts charging.

Acceptance:

- One notification when the threshold is crossed.
- After a reset, the 5-minute count starts over.

Assumption required: the assignment does not say whether the 5-minute count continues while a robot is offline. See `../assumption/03-decisions-and-open-questions.md`, question Q-B.

## Related requirement in another question

Q3 requires that clicking a robot on this page navigates to its detail view. The click target lives on this page. See `02-q3-requirements.md`, Q3-R1.

## Notes on where this is implemented

The assignment lists the alert system under a frontend question but does not state which side evaluates the rules. Our position is backend evaluation. That is an assumption, recorded in `../assumption/03-decisions-and-open-questions.md`, decision D2. The requirements above are unchanged either way.

## Commit requirement

The assignment requires at least one commit per question. Q2 needs at least one commit.
