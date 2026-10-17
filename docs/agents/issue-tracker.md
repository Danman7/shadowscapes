# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `Danman7/shadowscapes`.
Use the `gh` CLI from this repo.

## Conventions

- Create: `gh issue create --title "..." --body-file <path>`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels`
- Comment: `gh issue comment <number> --body-file <path>`
- Apply labels: `gh issue edit <number> --add-label "..."`
- Remove labels: `gh issue edit <number> --remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Write multiline bodies to a temporary file and pass `--body-file`.
Use `--repo Danman7/shadowscapes` when running outside this clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill operations

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the issue and its comments.

## Wayfinding operations

- Map: one issue labelled `wayfinder:map`, containing Notes,
  Decisions-so-far, and Fog.
- Child tickets: link issues as GitHub sub-issues. If unavailable, use
  a task list in the map and `Part of #<map>` in each child.
- Types: use `wayfinder:research`, `wayfinder:prototype`,
  `wayfinder:grilling`, or `wayfinder:task`.
- Blocking: use native GitHub issue dependencies where available;
  otherwise record `Blocked by: #<number>` in the child.
- Frontier: choose the first open, unassigned child in map order
  whose blockers are all closed.
- Claim: assign the child to the driving developer before work.
- Resolve: comment with the answer, close the child, then append
  a brief result and link to the map's Decisions-so-far.
