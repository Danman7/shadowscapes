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

## API (dev)

The Bun server includes a small sample API:

- `GET /api/hello`
- `PUT /api/hello`
- `GET /api/hello/:name`
