---
description: "Maintenance work needed? → Infrastructure, docs, tests, deps, or CI/config → Creates a chore branch for non-feature work"
allowed-tools: ["Bash", "Read", "Write", "Edit"]
---

## Context

Let's handle: $ARGUMENTS

## What is a Chore?

A chore is necessary non-feature work that supports the system. It intentionally absorbs:

- **Infrastructure changes** - Server config, deployment, monitoring
- **Documentation** - README updates, API docs, inline comments
- **Tests** - Adding missing tests, test infrastructure improvements
- **Dependency updates** - Package upgrades, security patches
- **CI/CD configuration** - Pipeline changes, build optimization
- **General maintenance** - Cleanup, reorganization, configuration

**Chore characteristics:**
- Maintenance and support work
- Non user-facing change
- Mixed or supporting concerns
- Necessary but not a "feature"

## Your Task

**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `chore/` branch name from the initial description
   (`$ARGUMENTS`) and create it. Do NOT proceed to any other step until this is complete.
   Example: "update dependencies" → `chore/update-dependencies`
1. Enter **plan mode** (announce this to the user).
2. **Check ADRs for related decisions** - Search `doc/decisions/` for prior decisions related to this work. Summarize any relevant decisions before proposing changes. Do not suggest changes that contradict existing ADRs without explicitly acknowledging them.
3. Confirm and document the chore scope.
4. Ask clarifying questions until mutual clarity is reached on what needs to be done.
5. **Add to backlog as in-progress** - This enables `/pro:backlog.resume` to pick up where you left off:
   - Ensure `.plan/backlog.json` exists (create with `{"lastSequence": 0, "items": []}` if not)
   - Increment `lastSequence` and add item:
     ```json
     {
       "id": <next sequence>,
       "title": "<brief title from chore scope>",
       "description": "<full description of chore>",
       "category": "chore",
       "severity": "medium",
       "fingerprint": "chore|<id>|<slugified-title>",
       "source": "/pro:chore",
       "sourceBranch": "<branch name>",
       "createdAt": "<ISO 8601 timestamp>",
       "status": "in-progress"
     }
     ```
6. Store all planning notes, todos, and related documentation here: `${ProjectRoot}/.plan/${BranchName}` with the following branch naming strategy: `chore/update-deps` >> `chore-update-deps`.
7. Outline detailed implementation steps.
8. Implement the chore and document changes.
9. `> coderabbit --prompt-only`
10. Document any related issues discovered that won't be addressed here:
    - Use `/pro:backlog.add <description>` to add items to the backlog
    - Set `source` to `/pro:chore` and `sourceBranch` to current branch

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Definition of Done
> SEE: @claude.md

- All chore tasks meet the agreed scope.
- Changes verified by both user and assistant.
- No errors, bugs, or warnings introduced.
- Related systems still function correctly.
