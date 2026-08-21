# Docs Index

Working documents for the Robot Fleet Management Dashboard technical assignment.

Source of truth: `Technical Assignment - fullstack.pdf` (3 pages) and `INSTRUCTIONS.md`.

## Layout

```
docs/
  01-assignment-restated.md      the assignment in our words
  02-submission-checklist.md     what must be delivered
  backend/                       requirement split (Q1, Q4) + architecture write-up
  frontend/                      requirement split (Q2, Q3) + architecture write-up
  assumption/                    analysis, proposals, open questions
```

The split rule:

| Folder | Holds | Does not hold |
|--------|-------|---------------|
| `backend/`, `frontend/` | Requirements from the assignment, broken into numbered pieces with acceptance criteria, plus `03-architecture.md` describing what was delivered | Pre-build analysis and proposals |
| `assumption/` | Everything else: code analysis, proposed schema and API, design decisions, open questions | Anything the assignment actually requires |

If the two disagree, the requirement wins.

## Requirement docs

| File | Question | IDs |
|------|----------|-----|
| [backend/01-q1-requirements.md](backend/01-q1-requirements.md) | Q1: WebSocket handler and database storage | Q1-R1 to Q1-R9 |
| [backend/02-q4-requirements.md](backend/02-q4-requirements.md) | Q4: Clustering and Docker Compose | Q4-R1 to Q4-R7 |
| [frontend/01-q2-requirements.md](frontend/01-q2-requirements.md) | Q2: Dashboard with live updates and alerts | Q2-R1 to Q2-R10 |
| [frontend/02-q3-requirements.md](frontend/02-q3-requirements.md) | Q3: Detail page with historical charts | Q3-R1 to Q3-R4 |

30 requirements total.

## Architecture docs

What was actually built, moved out of the root `README.md` so that file covers only how to run and verify.

| File | Content |
|------|---------|
| [backend/03-architecture.md](backend/03-architecture.md) | Backend architecture, database schema, API documentation, alert rules, scaling, configuration, technical considerations |
| [frontend/03-architecture.md](frontend/03-architecture.md) | Frontend data flow, layout, chart decisions, configuration, technical considerations |

## Shared docs

| File | Content |
|------|---------|
| [01-assignment-restated.md](01-assignment-restated.md) | The assignment rewritten in our own words. Scope, submission rules, evaluation criteria. |
| [02-submission-checklist.md](02-submission-checklist.md) | Everything required at submission time, as a checklist. |

## Assumptions and analysis

| File | Content |
|------|---------|
| [assumption/01-current-state-and-gaps.md](assumption/01-current-state-and-gaps.md) | What the boilerplate has, what is missing, contradictions in the given material. |
| [assumption/02-data-model-and-api.md](assumption/02-data-model-and-api.md) | Proposed collections, indexes, endpoints, message contract. |
| [assumption/03-decisions-and-open-questions.md](assumption/03-decisions-and-open-questions.md) | Decisions with reasons, open questions with proposed answers. |
| [assumption/04-backend-implementation-notes.md](assumption/04-backend-implementation-notes.md) | Proposed backend approach, keyed to requirement IDs. |
| [assumption/05-frontend-implementation-notes.md](assumption/05-frontend-implementation-notes.md) | Proposed frontend approach, keyed to requirement IDs. |

## ID scheme

`Q<question>-R<number>`, for example `Q1-R3`. Use these IDs in commit messages so each commit maps to a requirement. The assignment requires at least one commit per question.

## Reading order

1. `01-assignment-restated.md` for the goal.
2. `backend/` and `frontend/` for what must be built.
3. `assumption/` for how we propose to build it and what still needs a decision.

Build order is Q1, Q2, Q3, Q4. Q1 must exist before Q2 has data to show, and Q4 is last because clustering breaks requirements Q1 and Q2 depend on.
