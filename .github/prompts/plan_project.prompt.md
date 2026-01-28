---
agent: Plan
---

I want to create a new project using Bun.js, but I don't know where to start. Can you help me write a copilot file, or a plan file or whatever steps we need to do before executing?

I will create a web game for collectable cards. I have a good idea of the rules and how the game will work. There will be two players and the main module will be the duel. We can get into gameplay rules as we go.

For the stack I want to create a web app using latest React and Bun. I have experience with Next.js, Node.js, React, React testing library and Jest. But I have no experience with Bun or how to run tests with it. I will not need a DB initially (eventually I will need persistence). I will need storybook to develope UI components in isolation, only with controls in it. I will need to use React context to manage state, not Redux. I will need a middleware to detect context actions and trigger side effects to handle card effect. I want every component and context reducer to be tested.

This is an empty folder. Nothing is installed yet. Nothing is setup yet. Can you help me set this up? Can you help me plan this? What further questions I can answer to help?

Steps
Initialize Bun project: Run bun init --react in shadowscapes folder; configure TypeScript and JSX as first-class.

Establish project structure: Create flat folders for game-engine/ (card rules, validation, phase logic, shuffle, coin flip), contexts/, components/, hooks/, reducers/, selectors/, types/, and constants/ (card bases, test decks).

Define TypeScript types and card constants: Create types/index.ts with CardBase, CardInstance (id via incrementing counter, baseId, type: 'character' | 'instant', strength for characters), Player (id, name, coins, deckIds, handIds, boardIds, discardIds), Duel, Phase enum ('intro' | 'initial-draw' | 'redraw' | 'player-turn'); create constants/cardBases.ts and constants/testDecks.ts with two different player deck definitions.

Build game-engine module: Implement deck shuffle, coin flip for starting player, incrementing instance ID generator, instance creation from base IDs, card rules (play validation, cost checking), phase management, instant discard logic as pure functions.

Create selector hooks: Build useActivePlayerHand(), useInactivePlayerHandCount(), useActivePlayerBoard(), usePlayerCards(playerId, stack), useDuelPhase() to access normalized card data and game state.

Set up game state management: Create StateContext + DispatchContext with useReducer; initialize duel on mount (shuffle decks, coin flip, set intro phase), manage activePlayerId/inactivePlayerId switching, phase transitions.

Build core components with co-located flat tests and stories: Create IntroScreen (player names, starting player display), Card (character strength/instant), CardBack (stripe pattern with snapshot test), Hand, Board, FaceDownPile (CardBack + count), DiscardPile (CardBack + count), DuelView (orchestrates all components).

Configure Bun testing + React Testing Library: Set up .test.ts(x) pattern, coverage reporting, snapshot testing; test reducers, selectors, component rendering (opponent hand count, card visibility, intro screen display).

Install Storybook with Vite builder: Create co-located .stories.tsx showing IntroScreen states, Card variants (factions, character/instant types), CardBack, Hand states (active with cards, inactive with backs), different stack counts, phase-based views.

Create middleware hooks: Build custom hooks for card effect triggers using useEffect and useCallback responding to context dispatch actions (phase transitions, card plays).
