# Shadowscapes AI Agent Instructions

## Project Overview

Shadowscapes is a Bun + React TypeScript card game project set in the Thief universe. It combines a game engine with React UI, using a reducer-based architecture for game state management.

## Architecture Patterns

### State Management: Reducer + Context Pattern

The codebase uses a **centralized reducer pattern** ([src/reducers/duelReducer.ts](src/reducers/duelReducer.ts)) with React Context ([src/contexts/GameContext.tsx](src/contexts/GameContext.tsx)). Never mutate state directly—all state changes flow through `DuelAction` types dispatched to `duelReducer`.

Key flow:

1. Components dispatch typed actions via `useGameDispatch()`
2. Actions are processed by `duelReducer` which returns immutable new state
3. Components read state via custom selectors in [src/selectors/playerSelectors.ts](src/selectors/playerSelectors.ts) (e.g., `useActivePlayerHand()`, `useInactivePlayerBoard()`)
4. Use selector hooks rather than accessing `useGameState()` directly—they provide memoization and cleaner component code

### Type System Organization

Types are centralized in [src/types/index.ts](src/types/index.ts). Important concepts:

- **CardBase vs CardInstance**: `CardBase` defines card templates in [src/constants/cardBases.ts](src/constants/cardBases.ts); `CardInstance` represents actual card objects in play with unique IDs
- **PlayerId typing**: Always use `'player1' | 'player2'` literal types, never strings
- **Phase progression**: Game phases are strictly typed: `'intro' → 'initial-draw' → 'redraw' → 'player-turn'`

### Game Engine Layer

Game logic lives in [src/game-engine/](src/game-engine/) as pure functions, separate from React:

- `initialization.ts`: Duel setup, card creation, stack overrides for testing
- `utils.ts`: Pure helpers like `shuffle()`, `createCardInstance()`, `coinFlipForPlayerStart()`
- Never call React hooks from game engine functions

## Development Workflows

### Running & Testing

- **Dev server**: `bun dev` (serves at http://localhost:3000 with HMR)
- **Storybook**: `bun storybook` (http://localhost:6006) - use for component development
- **Tests**: `bun test` or `bun test:coverage` (Vitest with jsdom)
- **Lint**: `bun lint` runs Prettier check, ESLint, and TypeScript typecheck sequentially via [scripts/lint.mjs](scripts/lint.mjs)
- **Typecheck**: `bun typecheck` (runs separately from tests)

### Testing Conventions

1. **Component tests** use `renderGameContext()` helper ([src/test/renderGameContext.ts](src/test/renderGameContext.ts)) which wraps components in `GameProvider` with optional `preloadedState`
2. **Storybook stories** (e.g., [src/components/Card.stories.tsx](src/components/Card.stories.tsx)) use `createCardInstance()` directly—don't wrap in GameContext for isolated component demos
3. **Test files** are co-located: `Component.tsx`, `Component.test.tsx`, `Component.stories.tsx`
4. Use [src/test/mocks/duelSetup.ts](src/test/mocks/duelSetup.ts) for consistent test data

### Import Patterns

- **Path alias**: `@/` maps to `src/` (configured in [tsconfig.json](tsconfig.json) and [vitest.config.ts](vitest.config.ts))
- **Import sorting**: Auto-sorted by `eslint-plugin-simple-import-sort` (external → internal → types)
- Always use `@/` prefix for internal imports, never relative paths like `../`

## Code Conventions

### React Patterns

- **Component typing**: Use `React.FC<PropsInterface>` with explicit props interface
- **Hooks**: Prefer custom selector hooks (`useActivePlayer()`) over raw context access
- **No prop spreading**: Define props explicitly in interfaces
- **Destructuring**: Prefer destructuring where applicable
- **Control flow**: Prefer single-line `if () return` for early returns/guards
- **Testing**: Use RTL destructured selectors like `const {getByText} = render(...)` instead of `container.querySelector()`

### Styling

- **Tailwind 4.x** with PostCSS ([postcss.config.mjs](postcss.config.mjs))
- Inline utility classes, no CSS modules
- Global styles in [src/globals.css](src/globals.css)

### TypeScript Strictness

Strict mode enabled with:

- `noUncheckedIndexedAccess: true` - always check array/object access with `!` or optional chaining
- `verbatimModuleSyntax: true` - use `type` keyword for type-only imports
- Example: `cards[id]!` when you know the card exists, `cards[id]?` when uncertain

## Common Patterns to Follow

**Creating new actions:**

1. Add to `DuelAction` union type in [src/types/index.ts](src/types/index.ts)
2. Add case to `duelReducer` in [src/reducers/duelReducer.ts](src/reducers/duelReducer.ts)
3. Write reducer unit tests in `duelReducer.test.ts`

**Adding new card types:**

1. Define `CardBaseId` literal in [src/types/index.ts](src/types/index.ts)
2. Add full card definition to `CARD_BASES` in [src/constants/cardBases.ts](src/constants/cardBases.ts)
3. Use `createCardInstance()` to instantiate cards

**Component development workflow:**

1. Create component in [src/components/](src/components/)
2. Write Storybook stories for visual testing (`.stories.tsx`)
3. Write unit tests with Testing Library (`.test.tsx`)
4. Update via GameContext only when the component needs game state

## Environment & Build

- **Runtime**: Bun (not Node.js)
- **Entry**: [src/index.ts](src/index.ts) serves the Bun HTTP server
- **Frontend entry**: [src/index.html](src/index.html) with [src/frontend.tsx](src/frontend.tsx)
- **Public env vars**: Prefix with `BUN_PUBLIC_*` for client exposure
- **Production build**: `bun build` outputs to `dist/`
