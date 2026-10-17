# Domain docs

This repo uses a single-context layout:

- `CONTEXT.md` at the repo root: domain vocabulary and relationships.
- `docs/adr/`: architectural decision records.

## Before exploring

Read `CONTEXT.md` and ADRs relevant to the area being explored.

If these files are absent, proceed silently. The domain-modeling skill
creates them when terms or decisions are resolved.

Continue following `README.md` for implementation status and `rules.md`
for agreed game rules and open decisions.

## Vocabulary

Use terms defined in `CONTEXT.md` in issues, proposals, and tests.
If a needed concept is missing, reconsider the wording or flag the gap
for domain modeling.

## Decision conflicts

Explicitly identify any proposal that contradicts an existing ADR,
including the ADR reference and the reason to reconsider it.
