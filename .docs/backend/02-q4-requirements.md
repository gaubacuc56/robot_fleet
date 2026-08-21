# Q4 Requirements: Scaling the Node.js Backend

Source: `Technical Assignment - fullstack.pdf`, page 3, "Q4: Scaling the Node.js Backend (Clustering & Horizontal Scaling)".

## Clustering requirements

### Q4-R1: Create backend/cluster.js

Create `backend/cluster.js`.

Acceptance: the file exists at that exact path.

### Q4-R2: Worker count rule

The cluster forks `WORKERS` workers, taken from the environment, or the CPU count, capped at a maximum of 4.

| Input | Worker count |
|-------|--------------|
| `WORKERS` set | the `WORKERS` value, capped at 4 |
| `WORKERS` unset | CPU count, capped at 4 |

Acceptance: worker count follows the rule for both cases, and never exceeds 4.

### Q4-R3: Multiple workers on the same port

Running `npm run cluster` starts multiple workers on the same port.

Acceptance: `npm run cluster` runs, more than one worker process exists, and they serve one port.

Note: the `cluster` script already exists in `backend/package.json`.

### Q4-R4: Additional scalability layer

Optional. The assignment states: "You are free to add another layer (optional) for scalability."

Acceptance: none required. If added, it is documented.

## Containerization requirements

### Q4-R5: Containerize with Docker Compose

Containerize the project with Docker Compose.

Acceptance: the project runs in containers.

### Q4-R6: Compose file with the named services

Provide a Compose file that defines:

- Backend
- Frontend
- MongoDB
- Additional services

The assignment calls it `compose.yml`; it is delivered as `docker-compose.yml`,
which `docker compose` discovers just the same.

Acceptance: `docker-compose.yml` exists and defines all four items above.

### Q4-R7: Single-command start

The full stack starts with `docker compose up -d`.

Acceptance: that exact command brings up a working stack.

## Requirements this question must not break

Clustering and containerization must leave the earlier requirements satisfied. These are the same requirements, re-checked under the new run mode, not new ones.

| Must still hold | From |
|-----------------|------|
| All dashboard clients receive all robot updates | Q1-R6 |
| Alerts fire once per occurrence | Q1-R9, Q2-R9, Q2-R10 |
| Online and offline status is correct | Q1-R7 |
| Dashboard and detail pages work | Q2, Q3 |

Assumption required: clustering breaks broadcast, alert state, and status tracking by default, and the fix is not specified by the assignment. See `../assumption/04-backend-implementation-notes.md` and `../assumption/03-decisions-and-open-questions.md`, question Q-H.

## Commit requirement

The assignment requires at least one commit per question. Q4 needs at least one commit.
