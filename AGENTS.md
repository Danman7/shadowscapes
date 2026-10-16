# Working on Goldkeeper

## Starting or resuming work

Read `README.md` for the implementation status, design rationale, and suggested next steps. Inspect the relevant code and tests before planning changes; suggested next steps are not additional user authorization.

## Rules and scope

Read `rules.md` before changing game behavior. Update it when the user settles a rule. Treat its open decisions as unresolved; ask before implementing behavior that depends on one.

Build the local duel first. Add dependencies only for a current requirement. Database persistence, authentication, deck building, and multiplayer are later work.

## Architecture

Keep the game engine in `src/game/` as plain TypeScript, independent of React, browser APIs, animation, and network transport.

Test and call the engine through its public exports in `src/game/index.ts`. Return state and ordered events from commands; keep input state unchanged. Make turn ownership explicit when issuing commands.

Keep presentation in React. Animations present resolved outcomes; they never decide game rules or trigger rule resolution. Separate card movement and face rotation onto different elements.

## TDD

The agreed initial test seam is the game engine's public interface: duel setup and state plus command to next state plus events. Agree additional test seams with the user before expanding test scope.

For each behavior change, write one failing test, run it to confirm the intended failure, then add only the implementation needed to pass. Repeat one behavior at a time. Test observable behavior with concrete examples from `rules.md`, using real engine code rather than mocking internals.

Run the relevant tests during each cycle. Before handing off, run `npm run check`, which verifies tests, TypeScript, and the production build. Report any checks that could not run.

## Documentation

Keep `README.md` accurate about what is implemented and how to run the project. Keep game rules in `rules.md` rather than duplicating them here. Issue tracking has not been selected yet.
