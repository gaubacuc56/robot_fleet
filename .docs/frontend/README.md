# Frontend Docs

The requirement split, plus the architecture write-up for what was built.

Requirement files are the assignment only — no source analysis, no component layout, no library choices. Those proposals are in `../assumption/05-frontend-implementation-notes.md`.

| File | Question | Requirements |
|------|----------|--------------|
| [01-q2-requirements.md](01-q2-requirements.md) | Q2: Dashboard page with live updates and alerts | Q2-R1 to Q2-R10 |
| [02-q3-requirements.md](02-q3-requirements.md) | Q3: Robot detail page with historical charts | Q3-R1 to Q3-R4 |

| File | Content |
|------|---------|
| [03-architecture.md](03-architecture.md) | Data flow, layout, chart decisions, configuration, technical considerations. Describes the delivered UI, not the requirements. Moved out of the root `README.md`, which covers how to run only. |

## ID scheme

`Q<question>-R<number>`. Q2-R1 to Q2-R4 are the dashboard view. Q2-R5 to Q2-R10 are the alert system, three requirements per alert type: trigger, message and severity, behavior.

## Where the assumptions live

Requirements here mark the points where the assignment leaves something unspecified. Those go to:

- [../assumption/01-current-state-and-gaps.md](../assumption/01-current-state-and-gaps.md) — what the boilerplate has, what is missing, contradictions in the given material
- [../assumption/02-data-model-and-api.md](../assumption/02-data-model-and-api.md) — message shapes and REST responses this UI consumes
- [../assumption/03-decisions-and-open-questions.md](../assumption/03-decisions-and-open-questions.md) — decisions and unresolved questions
- [../assumption/05-frontend-implementation-notes.md](../assumption/05-frontend-implementation-notes.md) — proposed approach per requirement
