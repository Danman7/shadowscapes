---
name: shadowscapes-balance-audit
description: Analyze Shadowscapes balance simulation artifacts and produce a repeatable balance review. Use when Codex is given or asked to review Shadowscapes README rules, cards.csv card definitions, raw simulation JSON logs, and Markdown aggregate simulation reports to separate real gameplay imbalance from missing implementation, AI/simulation artifacts, and misleading proxy metrics.
---

# Shadowscapes Balance Audit

## Overview

Produce the same balance review whenever the user provides Shadowscapes rules, card data, raw simulation logs, and an aggregate report. Treat current implementation limits as first-class evidence, and avoid over-trusting proxy winners when the real win condition is missing or incomplete.

## Inputs

Expect some or all of these artifacts:

- `README.md`: rules, current implementation status, and known limits.
- `cards.csv`: card stats, text, faction/deck, targeting, and effect data.
- `*.json`: raw simulation logs or per-game state dumps.
- `*.md`: aggregate simulation summary or report.

If several matching files exist, identify the likely current set by filename, timestamp, user mention, or nearby paths. State any assumptions briefly.

## Workflow

### 1. Read Rules First

Read `README.md` before interpreting outcomes. Extract:

- win condition status
- economy rules
- combat rules
- deck-out behavior
- missing card/effect implementation
- current known design gaps

Use these facts to classify each signal as a real balance signal, implementation artifact, AI/simulation artifact, or misleading proxy metric.

### 2. Build The Card Model

Read `cards.csv` with a CSV-aware parser when possible. For each card, collect:

- faction or deck
- type
- cost
- life
- strength
- target rules
- effect text
- implementation risk

Flag implementation risk when card text appears to depend on unimplemented, partially implemented, ambiguous, or AI-hard effects. Examples include conditional triggers, optional targeting, card draw/search, discard manipulation, replacement effects, noncombat win/loss text, or effects called out as missing in `README.md`.

### 3. Parse The Aggregate Report

Read the Markdown summary and capture:

- number of runs
- outcome reasons
- proxy winner count
- average coins by player
- average rounds or steps
- cards played by player
- obvious stuck, never-played, or repeatedly unplayable cards

Preserve the report's language for metrics, but label each metric's trustworthiness based on the rules sanity pass.

### 4. Analyze Raw Logs

Read the JSON logs directly. Use `jq`, TypeScript, JavaScript, or Python only as needed for reliable counting; keep throwaway analysis scripts outside the repo unless the user asks to keep them.

Calculate when the log schema permits:

- final board count by player
- final board strength, life, and cost by player
- final hand count by player
- final discard count by player
- card copies played vs unplayed
- first-player advantage, if player order is detectable
- whether the winner metric agrees with final board state

If the schema does not expose a field cleanly, say it is unavailable instead of guessing. When approximating from events, label it as inferred.

### 5. Interpret Balance

Separate findings into these categories:

- `Gameplay imbalance`: Supported by trustworthy outcome, board, tempo, or usage metrics under implemented rules.
- `Missing implementation`: Caused or amplified by absent rules, absent effects, placeholder scoring, deck-empty endings, or unimplemented win/loss conditions.
- `AI/simulation artifact`: Caused by simplistic play order, bad target selection, stuck action choices, or deterministic/random policy weaknesses.
- `Misleading proxy metric`: Coin totals, proxy winners, deck-empty outcomes, or other substitutes that do not reliably map to winning.

Report:

- who appears to dominate
- which metric says so
- whether that metric is trustworthy
- strongest cards
- weakest or stuck cards
- faction imbalance
- implementation artifacts

### 6. Recommend In Priority Order

Prioritize recommendations in this order:

1. scoring and real win-condition fixes
2. missing implementation fixes
3. AI policy or simulation harness fixes
4. card tuning
5. larger or better-controlled test sizes

Do not recommend card nerfs or buffs from a proxy metric alone. Prefer "retest after X" when the evidence depends on incomplete rules or an unreliable AI.

## Output Template

Use this exact shape unless the user asks for a different format:

```markdown
## Verdict
[One-paragraph summary.]

## Dominance
- Coin/proxy winner:
- Board winner:
- Tempo winner:
- Card usage winner:

## Likely imbalances
1. ...
2. ...
3. ...

## Misleading artifacts
1. ...
2. ...
3. ...

## Card notes
| Card | Signal | Concern | Suggested change |
|---|---|---|---|

## Priority fixes
1. ...
2. ...
3. ...

## Next simulation request
Run:
- 100+ games
- real win condition
- same decks
- then mirrored player order
```

Add short caveats only when an expected input is missing or a metric cannot be computed from the available schema.
