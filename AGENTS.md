# Shadowscapes Agent Instructions

These instructions apply to the whole repository.

## Project Overview

Shadowscapes is a Bun + React TypeScript project for a small dueling card-game UI and game engine set in the Thief universe. The project currently uses Storybook as the primary development and scenario-testing surface rather than a finished standalone app. It uses Redux Toolkit for duel state, React components for the board/hand/log UI, Tailwind 4 utilities for styling, Storybook for component work, and Vitest for tests.

## Project Structure

- `src/index.ts`: Bun HTTP server. It serves `src/index.html` and enables HMR in development.
- `src/frontend.tsx`: React frontend entry point.
- `src/App.tsx`: Placeholder/mock app wiring. Do not treat this as the current product surface unless the user explicitly asks to work on the standalone app.
- `src/store.ts`: Redux store setup, typed hooks, and duel middleware wiring.
- `src/components/`: React UI components, colocated tests, and Storybook stories.
- `src/contexts/`: `GameProvider`, test render helpers, and selector hooks for React state reads.
- `src/game-engine/`: Pure duel types, reducers, effects, card definitions, constants, mocks, and helper utilities.
- `src/game-engine/duel/`: Redux slice, middleware, and action reducers for phases, cards, instants, and character abilities.
- `src/game-engine/cards/`: Card instance creation and duel creation.
- `src/game-engine/constants/`: Card bases, balancing values, card text, test decks, and duel parameters.
- `src/game-engine/utils/`: Query and state helpers shared by reducers/effects.
- `src/i18n/`: UI and log text plus string formatting helpers.
- `scripts/`: Local project scripts such as lint and card export.
- `.github/copilot-instructions.md`: Existing Copilot guidance. Keep it in sync when changing durable agent conventions.

## Commands

- Install dependencies: `bun install`
- Run the project locally by default: `bun run storybook`
- Run the placeholder app/server only when explicitly needed: `bun dev`
- Build production output: `bun build`
- Run production server: `bun start`
- Run tests: `bun run test`
- Run coverage: `bun run test:coverage`
- Run lint, Prettier check, ESLint, and TypeScript check: `bun lint`
- Run Storybook: `bun run storybook`
- Export current card data: `bun export:cards`

There is no standalone `typecheck` script in `package.json`; use `bun lint` when a full static check is needed.

For current feature work, treat `bun run storybook` as the default "run the project" command and use the colocated `*.stories.tsx` files. Use `bun dev` only when specifically working on the standalone app/server path.

## Architecture

- Duel state lives in Redux Toolkit under the `duel` slice.
- Components dispatch actions through `useGameDispatch()`.
- Components should read duel state through selector hooks in `src/contexts/playerSelectors.ts` where possible.
- Reducers in `src/game-engine/duel/reducers/` perform core state updates using Immer through Redux Toolkit.
- `src/game-engine/duel/middleware.ts` coordinates chained effects, card effects, cleanup, and two-step character abilities.
- Card and duel types are centralized in `src/game-engine/types.ts`.
- `CardBase` values are static templates from `src/game-engine/constants/cardBases.ts`.
- `CardInstance` values are concrete cards in a duel, with unique ids and mutable per-duel attributes.
- Keep game-engine code independent from React. Do not call React hooks from `src/game-engine/`.

## Duel Flow And Rules

This section describes the currently implemented behavior, not aspirational design.

### Setup

- `createDuel()` creates card instances from each player setup, shuffles decks, chooses a random starting player, and stores the active player first in `playerOrder`.
- Both players start with `INITIAL_PLAYER_COINS`, currently `30`.
- `PLAYER_2_STARTING_COIN_BONUS` is currently `0`.
- Initial draw uses `PLAYER_1_INITIAL_HAND = 4` and `PLAYER_2_INITIAL_HAND = 5`.
- `PLAYER_2_SKIP_FIRST_DRAW` is currently `true`, so the second player skips their first normal turn draw.

### Phases

The phase type is:

1. `intro`
2. `initial-draw`
3. `redraw`
4. `player-turn`
5. `turn-end`

UI effects in `DuelView` automatically move `intro -> initial-draw -> redraw`, skip redraw for the inactive player in the current mock flow, and start the first turn once both players are ready. Most scenario work should be represented through Storybook stories and test setup rather than by relying on the placeholder app boot flow.

### Redraw

- During `redraw`, a player may select a hand card to put it on the bottom of their deck and draw one replacement.
- Redrawing or skipping marks that player ready.
- Once both players are ready, the first player turn starts and the active player draws one card.

### Player Turn

- During `player-turn`, the active player may play cards from hand if they can pay the coin cost.
- Playing any card subtracts its cost from that player's coins and moves the phase to `turn-end`.
- Character cards enter the active player's board.
- Characters without `hasHaste` enter with `isStunned = true`.
- Instant cards go to discard and may create a pending target selection.
- Pending character abilities are cleared when playing a card.

### Instants

- `Speed Potion` can target a character in the active player's hand and gives it `hasHaste`.
- `Flash Bomb` can target any character on either board, marks it stunned, sets at least one stunned turn remaining, and marks it as acted.
- `Book of Ash` targets a non-elite card in the active player's discard, creates a fresh copy on board, and stuns it unless it has haste. If it copies `Zombie`, zombies in that player's discard also return to board stunned.

### Turn End And Combat

- During `turn-end`, eligible active board characters can attack.
- Stunned characters, characters with `cannotAttack`, and cards that already acted cannot attack.
- If the inactive player has no board cards, an attacker can attack the player directly for 1 coin damage.
- Direct player damage clamps coins at 0.
- If the inactive player has board cards, the player selects an attacker and then an enemy defender.
- Card attacks mark the attacker as acted.
- Damage equals strength plus any `nextAttackStrengthBonus`; Haunt may add bonus damage from charges.
- Defeated defenders are removed from board, reset to base attributes, and moved to discard.
- When all active board cards have acted or are stunned, the turn switches automatically where applicable.

### Turn Switch

- All cards have `didAct` reset to `false`.
- `playerOrder` swaps active and inactive players.
- Player ready flags are reset.
- Pending character abilities are cleared.
- Stun durations are processed for the new active player's board only. Cards with remaining stunned turns decrement; otherwise `isStunned` is cleared.
- The new active player draws one card unless it is the second player's first turn and `PLAYER_2_SKIP_FIRST_DRAW` applies.

### Character And Reactive Effects

- On-play effects are applied by middleware after `playCard`.
- `Cook` draws a card.
- `Zombie` returns zombies from that player's discard to board stunned.
- `Novice` summons other Novices from hand/deck when a stronger allied Hammerite is on board.
- `Elevated Acolyte` gains haste, clears stun, and may gain strength when it is the only allied living character and the opponent has board cards.
- `Sachelman` buffs weaker allied Hammerites.
- `Mystic's Soul` adds charges to allied cards with charges.
- `Temple Guard` gains life when played while the opponent has more board cards.
- `Yora Skull` buffs allied Hammerites.
- `Markander` reacts when allied Hammerites are played by reducing charges while in hand/deck, and summons itself when charges reach 0.
- `Burrick` has a two-step player-turn ability: click Burrick to arm it, then click an enemy board card. The ability dispatches an attack with source `burrick-ability`, consumes action, can splash adjacent enemies, and skips Mines Guardian's final attack behavior.
- Retaliation and final-attack effects run after normal card attacks where applicable.

### Current Game-End Behavior

- The practical goal is to reduce the opponent's coins to 0.
- There is no explicit match-over phase or winner state yet.

## Card And Deck Rules

- Factions are `chaos`, `order`, `shadow`, and `neutral`.
- Card types are `Character` and `Instant`.
- Deck-building rules documented in the README: do not mix non-neutral factions, neutral cards may go in any faction deck, elite cards are one copy max, non-elite cards are two copies max.
- When adding a new card:
  1. Add its `CardBaseId` and related types in `src/game-engine/types.ts`.
  2. Add balancing attributes in `src/game-engine/constants/balancing.ts`.
  3. Add card text in `src/game-engine/constants/cardText.ts` and names/messages in `src/i18n/en.ts`.
  4. Add the card base in `src/game-engine/constants/cardBases.ts`.
  5. Add reducer/effect logic only when the card needs behavior beyond existing attributes.
  6. Add tests for game behavior and stories/tests for UI changes when relevant.

## Code Style

- Use TypeScript strictness and prefer explicit domain types from `src/game-engine/types.ts`.
- Use `type` imports for type-only imports because `verbatimModuleSyntax` is enabled.
- Internal imports inside `src/` should use the `src/` absolute alias, not relative parent paths.
- Import order is enforced by `eslint-plugin-simple-import-sort`.
- Prefer selector hooks from `src/contexts/playerSelectors.ts` over raw state reads in components.
- Use `React.FC<Props>` with explicit prop shapes, matching the existing component style.
- Keep props explicit; avoid prop spreading unless there is a strong local precedent.
- Prefer clear early returns for guards.
- Keep comments sparse and useful. Favor clear names and small helpers.
- Do not mutate duel state outside reducers. Reducers may use direct assignment because Redux Toolkit wraps them with Immer.
- Use shared helpers from `src/game-engine/utils/` for common state queries and stack/card operations.

## Testing And Stories

- Tests are colocated with the implementation as `*.test.ts` or `*.test.tsx`.
- Component tests use Testing Library and `renderGameContext()` from `src/contexts/renderGameContext.ts` when game state is needed.
- Storybook stories are colocated as `*.stories.tsx`.
- Use `src/game-engine/mocks/` and `src/game-engine/constants/testDecks.ts` for repeatable duel setup data.
- Add or update reducer/effect tests for behavior changes in the game engine.
- Add or update component tests/stories for meaningful UI behavior or rendering changes.

## Styling Guide

- Styling uses Tailwind 4 through inline utility classes and `src/globals.css`.
- Global theme tokens and custom utilities live in `src/globals.css`.
- Reuse existing utilities such as `box`, `card`, `badge`, `coin`, `flavor`, `border-line`, `divide-line`, and `flex-list`.
- The visual direction is compact, readable, and board-game-like, using Noto Serif, faction border colors, coin badges, and restrained animation.
- Keep board/hand/card dimensions stable so game state changes do not cause distracting layout shifts.
- Prefer existing components such as `Button`, `Card`, `Board`, `Hand`, `FaceDownPile`, `PlayerBadge`, and `Logs` before introducing new primitives.
