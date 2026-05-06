# Shadowscapes

A Bun + React (TypeScript) project for building and testing a small dueling card-game UI + game engine. The game is set in the world of Thief.

This repo includes:

- A Bun HTTP server that serves the frontend (see `src/index.ts`)
- A React UI with Tailwind styling and Storybook component development
- A small “game engine” + reducer/selectors layer with Vitest unit tests

## Prerequisites

- [Bun](https://bun.com) installed

## Quick start

```bash
bun install
bun dev
```

The dev server prints the URL on startup (usually `http://localhost:3000`).

## Duel rules

This section documents the currently implemented rules in the engine.

### Goal

- Reduce the opponent's coins to 0 by attacking with your characters.
- Each direct character attack on the opponent removes 1 coin.
- The engine currently clamps coins at 0 (no negative values).

### Setup and phases

1. **Intro**: duel is initialized.
2. **Initial draw**: both players draw 4 cards.
3. **Redraw**: each player may redraw cards from hand into deck; both must be ready.
4. **Player turn**: active player can play cards and use character abilities.
5. **Turn end**: active player resolves attacks, then turn switches.

At turn switch:

- Active/inactive player order swaps.
- All cards reset `didAct` to `false`.
- All stun flags are cleared.
- New active player draws 1 card.

### Playing cards

- Playing a card costs coins equal to the card cost.
- Character cards enter the board.
- Characters that do not have haste enter stunned.
- Instant cards go to discard after play and may create a pending target selection:
  - `Speed Potion`: can target a character in your hand.
  - `Flash Bomb`: can target a character on either board.

### Combat

- A character that is stunned cannot attack.
- A character that attacks is marked as having acted (`didAct = true`).
- If the opponent has no board cards, your attacker can attack the opponent directly (1 coin damage).
- If the opponent has board cards, attacks target enemy characters.
- Character-vs-character damage reduces defender life by attacker strength.
- Defeated characters are removed from board, reset to base attributes, and moved to discard.

### Character abilities and reactive effects

- Character abilities are action-driven and resolved through middleware/effects.
- Burrick's activated ability is two-step:
  1.  Click Burrick to arm ability (if legal).
  2.  Click enemy target to perform the ability attack.
- Burrick ability attacks still consume action and can trigger splash behavior.
- Temple Guard retaliation is skipped specifically for Burrick ability attacks.

### Important implementation note

- This project currently models duel flow through phases and coin reduction.
- There is no separate explicit "match over" phase/state yet; practical victory is opponent coins reaching 0.

## Scripts

- `bun dev` — run the dev server with HMR
- `bun build` — build a production bundle into `dist/`
- `bun start` — run the server in production mode (`NODE_ENV=production`)
- `bun test` — run the test suite (Vitest)
- `bun test:coverage` — run tests with coverage output (see `coverage/`)
- `bun lint` — lint (and formatting rules via config)
- `bun typecheck` — TypeScript typecheck
- `bun storybook` — run Storybook locally (default: `http://localhost:6006`)

## Notes

- Import alias: `@/` maps to `src/` (configured in `tsconfig.json` and Vitest config).
- Client-exposed env vars should be prefixed with `BUN_PUBLIC_` (used by the build script).
