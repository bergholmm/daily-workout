# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all
operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a
  heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, including its labels.
- **List issues**: use `gh issue list` with the relevant state and label filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply or remove labels**: use `gh issue edit` with `--add-label` or
  `--remove-label`.
- **Close an issue**: `gh issue close <number> --comment "..."`.

Infer the repository from the current clone and its configured GitHub remote.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments` and include its labels.

## Wayfinding operations

Use a GitHub issue labelled `wayfinder:map` as the map and linked sub-issues as
decision tickets. Prefer native GitHub sub-issue and dependency relationships;
fall back to task lists and `Blocked by:` references only when native support is
unavailable.
