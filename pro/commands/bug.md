---
description: "Found a bug? → Capture repro steps and investigate root cause → Creates a fix branch with structured bug documentation"
allowed-tools: ["Bash", "Read", "Write", "Edit"]
---

## Context

Let's investigate and fix: $ARGUMENTS

## Bug Details Capture

Before planning the fix, gather the following information through guided prompts:

1. **Steps to Reproduce** - Ordered, copy-pastable steps that reliably trigger the bug
2. **Expected Behavior** - What should happen when following those steps
3. **Actual Behavior** - What actually happens (error messages, incorrect output, etc.)
4. **Environment** - Relevant context (environment, browser, device, OS, commit/branch)
5. **Severity** - Impact level (blocks work, degraded experience, minor annoyance)

## Your Task

**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `fix/` branch name from the initial bug description
   (`$ARGUMENTS`) and create it. Do NOT proceed to any other step until this is complete.
   Example: "login button broken" → `fix/login-button-broken`
1. Enter **plan mode** (announce this to the user).
2. **Check ADRs for related decisions** - Search `doc/decisions/` for prior decisions related to this area. Summarize any relevant decisions before proposing fixes. Do not suggest changes that contradict existing ADRs without explicitly acknowledging them.
3. Capture bug details via the guided prompts above. Ask each question interactively.
4. **Add to backlog as in-progress** - This enables `/pro:backlog.resume` to pick up where you left off:
   - Ensure `.plan/backlog.json` exists (create with `{"lastSequence": 0, "items": []}` if not)
   - Map severity from bug details: "blocks work" → critical, "degraded experience" → high, "minor annoyance" → low
   - Increment `lastSequence` and add item:
     ```json
     {
       "id": <next sequence>,
       "title": "<brief title from bug description>",
       "description": "<full bug details including repro steps>",
       "category": "bug",
       "severity": "<mapped from bug details>",
       "fingerprint": "bug|<id>|<slugified-title>",
       "source": "/pro:bug",
       "sourceBranch": "<branch name>",
       "createdAt": "<ISO 8601 timestamp>",
       "status": "in-progress"
     }
     ```
5. Store all planning notes, bug details, and related documentation here: `${ProjectRoot}/.plan/${BranchName}` with the following branch naming strategy: `fix/pattern-matcher-tests-static-rule` >> `fix-pattern-matcher-tests-static-rule`.
6. **Investigate root cause** - Gather empirical evidence, trace code paths, identify where the bug originates. Do not proceed to implementation until the root cause is understood.
   - **Per ADR-063:** Check for existing logs at `${XDG_STATE_HOME:-$HOME/.local/state}/<app-name>/` before asking to run the program. Logs are authoritative artifacts—execution is a last resort.
7. Outline fix implementation steps.
8. Implement the fix and document changes.
9. **Verify fix** - Confirm the reproduction steps no longer trigger the bug.
10. `> coderabbit --prompt-only`
11. Document any related issues discovered that won't be addressed here:
    - Use `/pro:backlog.add <description>` to add items to the backlog
    - Set `source` to `/pro:bug` and `sourceBranch` to current branch

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Definition of Done
> SEE: @claude.md

- Bug no longer reproduces using the original reproduction steps.
- Root cause is documented in planning notes.
- Fix does not introduce regressions.
- Verified by both user and assistant.
- No errors, bugs, or warnings.
