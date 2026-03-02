# 072. Backlog Lifecycle via Composable Skill

Date: 2026-03-01

## Status

Accepted

## Context

The `/pro:pr.merged` command cleaned up branches and created tags but never updated backlog item status. Items created by `/pro:feature` (with `status: "in-progress"`) stayed that way forever, causing the backlog to drift out of sync with GitHub reality.

Two implementation approaches were considered:
1. Embed the backlog update logic directly in `pr.merged.md`
2. Create a reusable skill that `pr.merged` invokes

## Decision

Create a `backlog-resolve` skill that:
1. Finds backlog item by `sourceBranch` match
2. Updates `status` to `"resolved"` with `resolvedAt` timestamp
3. Commits the change

The skill is invoked by `/pro:pr.merged` as step 5 but can also be used by other workflows or standalone.

## Consequences

### Positive

- **Composability** - Same resolution logic reusable across workflows
- **Single responsibility** - `pr.merged` doesn't need to know backlog internals
- **Consistency with ADR-061** - Prefers composition (skills) over inheritance (embedding)
- **Testability** - Skill can be validated independently

### Negative

- **Indirection** - One more file to understand the workflow
- **Discovery** - Developers must know the skill exists

## Alternatives Considered

### 1. Inline logic in pr.merged.md

Embed the backlog update steps directly in the command.

Rejected: Creates coupling and prevents reuse. Other commands that complete work (e.g., future `/pro:branch.complete`) would duplicate the logic.

### 2. Post-merge hook

Use Claude Code hooks to automatically update backlog on git events.

Rejected: Hooks fire on all git operations, not just ccplugins workflows. Would need complex filtering to avoid false positives.

## Related

- ADR-061: Composition over Inheritance for Behavioral Constraints
- ADR-065: Branch Lifecycle Park and rmrf Commands
- ADR-016: ADR Check and Backlog Integration for Work Commands
- Planning: `.plan/.done/fix-backlog-status-not-updated-on-pr-merged/`
