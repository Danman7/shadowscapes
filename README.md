# Shadowscapes

Shadowscapes is a Bun-powered React, TypeScript, Redux Toolkit, Storybook, Tailwind CSS, and ESLint project for a two-player card duel UI.

Storybook is the primary development surface. The Vite app shell is intentionally minimal until the duel UI is fully wired into the app.

## Tech Stack

- Runtime and package manager: Bun.
- App framework: React 19 with TypeScript and Vite.
- State management: Redux Toolkit and React Redux.
- Styling: Tailwind CSS, project theme tokens in `src/globals.css`, and `@fontsource/noto-serif`.
- Component workshop: Storybook 8.
- Testing: Vitest, React Testing Library, jsdom, and V8 coverage.
- Static checks: TypeScript `noEmit` and ESLint with zero warnings allowed.

## Getting Started

Install dependencies:

```sh
bun install
```

Run the main development surfaces:

```sh
bun run storybook
bun run dev
```

Storybook runs on port `6006`. The Vite app is currently a minimal shell.

Run checks:

```sh
bun run test
bun run test:coverage
bun run typecheck
bun run eslint
bun run lint
bun run build-storybook
```

## Project Map

- `src/App.tsx` contains the minimal app shell.
- `src/main.tsx` boots the React app.
- `src/globals.css` defines Tailwind imports, theme tokens, base styles, and project utilities.
- `src/cards` owns card base definitions, card types, card utilities, and card display components.
- `src/duel` owns duel state, phases, rules, hooks, card effects, and the table UI.
- `src/l10n` owns display copy and card text.
- `src/redux` owns store setup and typed Redux hooks.
- `src/shared` owns reusable UI and generic utilities.
- `src/user` owns user types and mock users/decks.
- `src/test` owns test setup.

Keep tests and Storybook stories adjacent to the code they cover with `.test.ts(x)` and `.stories.tsx` suffixes.

## Duel Gameplay Rules

This section describes the current implementation so it can be used as context for gameplay design feedback.

### Duel Setup

- A duel has two players.
- Player order is randomized when the duel is initiated.
- Each player starts with `20` coins.
- Each player starts with `0` income.
- Each user's `activeDeck` is converted into unique card instances, assigned to that player, placed in the deck stack, and shuffled.
- The duel starts at round `0` in the `setup` phase.
- During setup, each player draws until they have `3` cards in hand.
- After setup completes, the game enters the `draw` phase. Because draw happens before play, the first play phase currently begins after the initial `3` card draw plus the normal draw phase card, assuming the deck has enough cards.

### Card Instances And Stacks

The duel state is normalized:

- `cards` stores card instances by id.
- Each player stores stack arrays of card instance ids.
- Valid stacks are `deck`, `hand`, `board`, and `discard`.
- Moving cards should go through `moveCard` so the player stack arrays and each card instance's `stack` field stay synchronized.

A card base is the reusable card definition. A card instance is a concrete copy in a duel with its own id, owner, stack, cost, and mutable combat state.

### Card Types

Characters are persistent board cards:

- Character instances have `life`, `strength`, `turnsStunned`, and `didAct`.
- If a character base omits strength, the instance defaults to `1` strength.
- When a character enters the board, it gains `1` stun turn and cannot attack until its stun reaches `0`.
- When a character is moved to discard, its cost, life, strength, stun, and action state reset from its base definition.

Instances are non-character cards:

- Instance cards can be played from hand during the play phase.
- They enter the board as a pending played card, resolve an effect or target if required, and then move to discard.
- A targeted instance with `target: 'allied-character'` can only be played if the player has an allied character on board.

### Round Structure

The phase model is `setup`, `draw`, `play`, `act`, and `refresh`.

1. `setup`: Initial-only phase. Both players draw up to `3` cards, then the duel moves to `draw`.
2. `draw`: Both players draw `1` card from deck to hand. The current active player's character stun counters are reduced, then the duel moves to `play`.
3. `play`: Players alternate one play turn each. The active player may play one affordable card from hand or pass. Playing a card spends coins equal to its current cost and marks that player as having acted for the phase. After the active player's play turn completes, player order rotates. When both players have acted, the duel moves to `act`.
4. `act`: Players take act turns using `actPlayerId`. A ready character can attack an opposing board character. Attacking marks the attacker as having acted and deals damage equal to its strength. Defenders with `0` or less life move to discard. A player may pass if they still have ready characters, and the turn also completes automatically when they have no ready characters. When both players have acted, the duel moves to `refresh`.
5. `refresh`: The round increments by `1`. Both players reset `hasActedThisPhase`. Characters reset `didAct` to `false`. Each player gains coins equal to their income, capped at `3` coins per refresh. The duel then returns to `draw`.

### Economy

- Starting coins: `20`.
- Starting income: `0`.
- Card costs are paid when cards are played from hand.
- Refresh grants coins equal to the player's income, with a minimum gain of `0` and a maximum gain of `3` coins.

### Victory

- A player loses immediately when they spend their last coin and reach `0` coins. The opponent becomes the winner and the duel becomes terminal.
- The duel table shows the winner in a non-dismissible modal. Starting a new duel through the existing initiation actions resets the winner.
- Simulations treat coin depletion as the primary win condition. If a simulation instead stops because both decks are empty or it reaches its step limit, remaining coins decide the winner first, followed by the total current life of character cards on board. Equal coins and board life produce a tie.

### Current Card Bases

Order cards:

- `novice`: Character, cost `1`, life `1`, default strength `1`, Hammerite, common. On play, summons all Novices from hand if this Novice has an ally with more life.
- `acolyte`: Character, cost `2`, life `2`, default strength `1`, Hammerite, common. On play, draws a card if alone on your board; otherwise gains `1` income.
- `templeGuard`: Character, cost `3`, life `3`, strength `2`, Hammerite, common. On play, gains `1` life if the opponent has more cards on board.
- `yoraSkull`: Instance, cost `3`, Hammerite artifact, elite, targets an allied character. The target gains `2` life. If the opponent has more cards on board, adjacent allied characters gain `1` life.
- `markander`: Character, cost `4`, life `4`, strength `1`, Hammerite Priest, elite. While in hand, loses a charge whenever its owner plays a Hammerite and is summoned for free when its charges reach `0`.

Chaos cards:

- `zombie`: Character, cost `1`, life `1`, default strength `1`, Undead, common. On play, summons the last Zombie in its owner's discard pile.
- `burrick`: Character, cost `2`, life `2`, default strength `1`, Beast, common. Gains a charge when passing. When attacking with a charge, spends it to also damage characters adjacent to the target.
- `haunt`: Character, cost `3`, life `3`, strength `2`, Undead and Hammerite, common. When attacked by a damaged character, deals its damage first and cancels the incoming attack if that attacker is defeated.
- `bookOfAsh`: Instance, cost `3`, Necromancer artifact, elite. Targets a discarded character and summons a stunned, `1`-life copy of it.
- `viktoriaQueen`: Character, cost `5`, life `2`, default strength `1`, Pagan, elite. Gains `1` life whenever its owner plays a Beast, regardless of Viktoria's current stack.

The current Order and Chaos card mechanics are implemented. Both factions' effect registrations are included in the card effects middleware.

### Current Deck Mocks

- Order mock user `Bafford`: `novice`, `novice`, `templeGuard`, `templeGuard`, `acolyte`, `acolyte`, `yoraSkull`.
- Chaos mock user `Constantine`: `zombie`, `zombie`, `haunt`, `haunt`, `bookOfAsh`.

### Current Design Gaps For Gameplay Advice

- There is no player health total yet.
- Deck-out behavior is only whatever `moveCard` can naturally do when a deck is empty.
- Only board character combat is implemented; direct player attacks are not.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
