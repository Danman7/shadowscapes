# Shadowscapes AI Guide

## Purpose

Shadowscapes is a Bun-powered React, TypeScript, Redux Toolkit, Storybook, Tailwind CSS, and ESLint project for a two-player card game UI.

Storybook is the primary development surface. The Vite app shell is intentionally minimal until the game UI is wired into the app.

## Codex files

- Use this root `AGENTS.md` for durable project guidance, structure, commands, and style rules.
- Use nested `AGENTS.md` or `AGENTS.override.md` files only when a subtree needs different rules.
- Use `.agents/skills/<skill-name>/SKILL.md` only for reusable task workflows, not for general project documentation.

## Commands

- `bun run dev` starts the Vite app.
- `bun run storybook` starts Storybook on port 6006.
- `bun run build-storybook` builds Storybook.
- `bun run test` runs the Vitest suite.
- `bun run test:coverage` runs Vitest with coverage thresholds.
- `bun run typecheck` runs TypeScript with `noEmit`.
- `bun run eslint` runs ESLint with zero warnings allowed.
- `bun run lint` runs typecheck and ESLint.

Before finishing code changes, run the narrowest useful checks. For shared logic, reducers, hooks, or components, prefer `bun run test` plus `bun run lint`.

## Project structure

- `src/App.tsx` is the minimal app shell.
- `src/main.tsx` boots the React app.
- `src/globals.css` contains Tailwind imports, theme tokens, base styles, and project utilities such as `paper`, `card`, `card-compact`, `card-glow`, and `coin`.
- `src/cards` owns card base definitions, card domain types, card utilities, and card display components.
- `src/duel` owns duel state, phases, rules, hooks, card effects, and the table UI.
- `src/l10n` owns display copy. Prefer adding user-facing text there instead of hardcoding copy in components.
- `src/redux` owns store setup and typed Redux hooks.
- `src/shared` owns reusable UI and generic utilities.
- `src/user` owns user types and test/mock user data.
- `src/test` owns test setup.
- Keep tests and stories adjacent to the code they cover with `.test.ts(x)` and `.stories.tsx` suffixes.

## Code style

- Use TypeScript, ESM, and React function components.
- Keep `strict` TypeScript compatibility. Avoid `any`; model domain states with explicit unions and typed records.
- Use named exports for app modules and colocate exported props/types near the component or utility they describe.
- Prefer `import type` for type-only imports.
- Match the existing formatting: single quotes and no semicolons.
- Keep comments sparse and useful. Do not narrate obvious code.
- Keep barrel exports consistent with the surrounding folder when adding public modules.

## React and UI style

- Use Tailwind utility classes and the project tokens in `src/globals.css`.
- Prefer existing shared components before creating new one-off UI.
- Use semantic elements and accessible labels. Clickable non-button elements need keyboard handling, role, and focus behavior.
- Preserve the card-table visual language: serif typography, paper/card surfaces, faction colors, compact board cards, and clear active/selected states.
- Add or update Storybook stories for meaningful component states, especially visual states that are hard to inspect from tests alone.

## Duel and card rules

- `DuelState` is normalized: `cards` stores card instances by id, and each player stack stores card ids.
- Use `moveCard` when moving cards between stacks so the owning stack arrays and `card.stack` stay synchronized.
- Reducers use Redux Toolkit with Immer-style mutation. Guard invalid actions with early returns rather than throwing in normal gameplay paths.
- Preserve the phase model in `src/duel/types.ts`: `setup`, `draw`, `play`, `act`, and `refresh`.
- The active player is generally `playerOrder[0]`; rotate or update player order through existing duel-state utilities and reducers.
- Define reusable card bases in `src/cards/bases`, create instances with `createCardInstance`, and keep card display text in `src/l10n/en.ts`.
- When adding rule behavior, prefer small utility functions under `src/duel/utils` or focused card effect handlers under `src/duel/cardEffects`.

## Testing guidance

- Add or update reducer and utility tests for game-rule changes.
- Add React Testing Library tests for hooks and components with user-visible behavior.
- Mock randomness and UUIDs in tests when asserting order or exact ids. Existing tests use `vi.spyOn(Math, 'random')` and `vi.spyOn(crypto, 'randomUUID')`.
- Keep test expectations behavioral. Avoid snapshots unless they add clear value.
- For UI-only styling changes, at least run `bun run lint`; use Storybook when visual inspection matters.

## Working expectations

- Read the relevant source and tests before editing.
- Keep changes scoped to the requested behavior. Do not rewrite the architecture during feature or bug work.
- Respect existing generated/build output such as `dist`, `coverage`, and `storybook-static`; do not edit generated files by hand.
- Do not add production dependencies without a clear need and user confirmation.
