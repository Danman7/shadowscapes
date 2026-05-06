<!-- markdownlint-disable -->

# Shadowscapes AI Agent Instructions

## Project Overview

Shadowscapes is a Bun + React TypeScript card game project set in the Thief universe. It combines a game engine with React UI, using a reducer-based architecture for game state management.

## Architecture Patterns

### State Management: Redux Toolkit + Context Selectors

The game state is managed with a Redux Toolkit slice in [src/game-engine/duel/slice.ts], exposed to React through [src/contexts/GameContext.tsx] and selector hooks in [src/contexts/playerSelectors.ts]. Never mutate state outside reducers and never bypass dispatched actions for duel state changes.

Key flow:

1. Components dispatch typed actions via `useGameDispatch()`
2. Slice reducers in [src/game-engine/duel/reducers/] update state immutably (Immer)
3. Middleware in [src/game-engine/duel/middleware.ts] handles cross-action behavior and card effects
4. Components read state via selector hooks from [src/contexts/playerSelectors.ts] instead of pulling raw state where possible

### Type System Organization

Types are centralized in [src/game-engine/types.ts]. Important concepts:

- **CardBase vs CardInstance**: `CardBase` defines templates in [src/game-engine/constants/cardBases.ts]; `CardInstance` is a concrete card in a duel with a unique id
- **Player identity**: Use `PlayerId` from [src/game-engine/types.ts] instead of ad hoc string literals
- **Phase progression**: Game phases are typed in [src/game-engine/types.ts] as `'intro' → 'initial-draw' → 'redraw' → 'player-turn' → 'turn-end'`

### Game Engine Layer

Game logic lives in [src/game-engine/] and is isolated from React components:

- `duel/reducers/`: Core turn, card, and instant reducers
- `duel/middleware.ts`: Effect orchestration and action chaining
- `duel/effects.ts`: On-play and reactive card effects
- `cards/`: Duel creation and card instantiation
- `utils/`: Query and state helper utilities
- Never call React hooks from game engine functions

## Development Workflows

### Agent Commands

- When the user types **"update all packages"**, run the following commands in order:
  1.  `ncu`
  2.  `ncu -u`
  3.  `bun install --save`

### Running & Testing

- **Dev server**: `bun dev` (serves at http://localhost:3000 with HMR)
- **Storybook**: `bun storybook` (http://localhost:6006) - use for component development
- **Tests**: `bun test` or `bun test:coverage` (Vitest with jsdom)
- **Lint**: `bun lint` runs Prettier check, ESLint, and TypeScript typecheck sequentially via [scripts/lint.mjs]
- **Typecheck**: `bun typecheck` (runs separately from tests)

### Testing Conventions

1. **Component tests** use `renderGameContext()` helper ([src/contexts/renderGameContext.ts]) with optional `preloadedState`
2. **Storybook stories** (e.g., [src/components/Card.stories.tsx]) use `createCardInstance()` directly—don't wrap in GameContext for isolated component demos
3. **Test files** are co-located: `Component.tsx`, `Component.test.tsx`, `Component.stories.tsx`
4. Use helpers from [src/game-engine/mocks/] when shared duel setup data is needed

### Import Patterns

- **Path alias**: use `src/` absolute imports for internal modules
- **Import sorting**: Auto-sorted by `eslint-plugin-simple-import-sort` (external → internal → types)
- Avoid deep relative imports when a `src/` absolute import is available

## Code Conventions

### React Patterns

- **Component typing**: Use `React.FC<PropsInterface>` with explicit props interface
- **Hooks**: Prefer custom selector hooks (`useActivePlayer()`) over raw context access
- **No prop spreading**: Define props explicitly in interfaces
- **Destructuring**: Prefer destructuring where applicable
- **Control flow**: Prefer single-line `if () return` for early returns/guards
- **Testing**: Use RTL destructured selectors like `const {getByText} = render(...)` instead of `container.querySelector()`
- **Comments**: Avoid code comments—write self-documenting code with clear naming and structure instead

### Styling

- **Tailwind 4.x** with PostCSS ([postcss.config.mjs])
- Inline utility classes, no CSS modules
- Global styles in [src/globals.css]

### TypeScript Strictness

Strict mode enabled with:

- `noUncheckedIndexedAccess: true` - always check array/object access with `!` or optional chaining
- `verbatimModuleSyntax: true` - use `type` keyword for type-only imports
- Example: `cards[id]!` when you know the card exists, `cards[id]?` when uncertain

## Common Patterns to Follow

**Creating new actions:**

1. Add reducer handlers in the appropriate file under [src/game-engine/duel/reducers/]
2. Wire the action in [src/game-engine/duel/slice.ts]
3. If side effects or chained behavior are needed, update [src/game-engine/duel/middleware.ts]
4. Add or update tests in [src/game-engine/cardEffects.test.ts] and/or [src/game-engine/duelReducer.test.tsx]

**Adding new card types:**

1. Add `CardBaseId` in [src/game-engine/types.ts]
2. Add card data in [src/game-engine/constants/cardBases.ts]
3. Add text in [src/i18n/en.ts] if needed
4. Use `createCardInstance()` from [src/game-engine/cards/] to instantiate

**Component development workflow:**

1. Create component in [src/components/]
2. Write Storybook stories for visual testing (`.stories.tsx`)
3. Write unit tests with Testing Library (`.test.tsx`)
4. Update via GameContext only when the component needs game state

## Environment & Build

- **Runtime**: Bun (not Node.js)
- **Entry**: [src/index.ts] serves the Bun HTTP server
- **Frontend entry**: [src/index.html] with [src/frontend.tsx]
- **Public env vars**: Prefix with `BUN_PUBLIC_*` for client exposure
- **Production build**: `bun build` outputs to `dist/`
