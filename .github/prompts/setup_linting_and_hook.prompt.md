---
agent: Plan
---

I need to setup linting and automatic formatting for this repository.

I would like to have prettier format this on every save. I need prettier to enforce single quiotes, semi to be false at the end of lines, a print width of 80 characters, trailing commas for all, arrow parens to be always and a tab width of 2 spaces.

I need eslint to enforce recommended settings like no unused vars for this repository: react with typescript. I also want to check for proper react hooks usage. Finally I would like to have imports sorted automatically on save. I only need 3rd party node modules first, then empty line, then internal afterwards. No additional fancy groupings. I like flat configs where applicable, but honestly I don't understand them. When I try merging ...flatconfig1, ...flatconfig2, I get confused on what is being overridden.

I like a lint command in package.json to run both prettier and eslint show all linting errors. I like another lint:fix command to try fix the errors.

Finally, I want a pre-commit git hook to check linting and run tests on all staged files before committing. If either fails, the commit should be aborted with an error message indicating the issues.

Steps
Add configs: .prettierrc.json, .prettierignore, and eslint.config.js (flat, explicit; no confusing spreads).
Add toolchain alias support so @/… resolves in tests and Storybook: update vitest.config.ts and .storybook/_ configs.
Install dev deps (Bun): prettier, eslint, @eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-simple-import-sort, eslint-config-prettier (plus eslint-plugin-import only if needed).
Bulk-migrate imports: rewrite all src/\*\*/_.{ts,tsx} relative imports (./, ../) to @/…, including tests/stories/mocks; keep index.ts’s ./index.html as an allowed exception.
Wire auto-fix on save: update settings.json to use Prettier as formatter and run source.fixAll.eslint to sort/fix imports on save.
Add scripts + enforcement:
Update package.json with lint (prettier check + eslint) and lint:fix (prettier write + eslint fix).
Add Husky + lint-staged pre-commit hook to run staged lint/format and then full bun run test.
Add CI workflow in .github/workflows/ci.yml to run bun run lint and bun run test on PRs.
