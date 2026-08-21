# Backend Docs

The requirement split, plus the architecture write-up for what was built.

Requirement files are the assignment only — no source analysis, no proposed file layout, no library choices. Those proposals are in `../assumption/04-backend-implementation-notes.md`.

| File | Question | Requirements |
|------|----------|--------------|
| [01-q1-requirements.md](01-q1-requirements.md) | Q1: WebSocket message handler and database storage | Q1-R1 to Q1-R9 |
| [02-q4-requirements.md](02-q4-requirements.md) | Q4: Clustering, horizontal scaling, Docker Compose | Q4-R1 to Q4-R7 |

| File | Content |
|------|---------|
| [03-architecture.md](03-architecture.md) | Architecture, database schema, API documentation, alert rules, scaling, configuration, technical considerations. Describes the delivered backend, not the requirements. Moved out of the root `README.md`, which covers how to run only. |

## ID scheme

`Q<question>-R<number>`. Q1-R1 to Q1-R6 come from Q1 directly. Q1-R7 to Q1-R9 are backend requirements traced from the Q2 and Q3 questions, which state them as frontend features but cannot be satisfied without backend support.

## Where the assumptions live

Requirements here mark the points where the assignment leaves something unspecified. Those go to:

- [../assumption/01-current-state-and-gaps.md](../assumption/01-current-state-and-gaps.md) — what the boilerplate has, what is missing, contradictions in the given material
- [../assumption/02-data-model-and-api.md](../assumption/02-data-model-and-api.md) — proposed collections, indexes, endpoints, message shapes
- [../assumption/03-decisions-and-open-questions.md](../assumption/03-decisions-and-open-questions.md) — decisions and unresolved questions
- [../assumption/04-backend-implementation-notes.md](../assumption/04-backend-implementation-notes.md) — proposed approach per requirement
