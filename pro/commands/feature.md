---
description: "Starting something new? → Plan your approach with guided questions → Creates a feature branch ready for implementation"
allowed-tools: ["Bash", "Read", "Write", "Edit"]
---

## Context

Let's plan the implementation for: $ARGUMENTS

## Your Task

**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `feat/` branch name from the initial description
   (`$ARGUMENTS`) and create it. Do NOT proceed to any other step until this is complete.
   Example: "add dark mode toggle" → `feat/add-dark-mode-toggle`
1. Enter **plan mode** (announce this to the user).
2. **Check ADRs for related decisions** - Search `doc/decisions/` for prior decisions related to this work. Summarize any relevant decisions before proposing changes. Do not suggest reversing or contradicting existing ADRs without explicitly acknowledging them.
3. Confirm and document the requirements and scope.
4. Ask clarifying questions until mutual clarity is reached on the design and approach.
5. **Add to backlog as in-progress** - This enables `/pro:backlog.resume` to pick up where you left off:
   - Ensure `.plan/backlog.json` exists (create with `{"lastSequence": 0, "items": []}` if not)
   - Increment `lastSequence` and add item:
     ```json
     {
       "id": <next sequence>,
       "title": "<brief title from requirements>",
       "description": "<full description>",
       "category": "feature",
       "severity": "medium",
       "fingerprint": "feature|<id>|<slugified-title>",
       "source": "/pro:feature",
       "sourceBranch": "<branch name>",
       "createdAt": "<ISO 8601 timestamp>",
       "status": "in-progress"
     }
     ```
6. Store all planning notes, todos, and related documentation here: `${ProjectRoot}/.plan/${BranchName}` with the following branch naming strategy: `feat/add-dark-mode` >> `feat-add-dark-mode`.
7. Outline detailed implementation steps.
8. Implement the feature and document changes.
9. `> coderabbit --prompt-only`
10. Document any known issues that won't be addressed here:
    - Use `/pro:backlog.add <description>` to add items to the backlog
    - Set `source` to `/pro:feature` and `sourceBranch` to current branch

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Definition of Done
> SEE: @claude.md

- All features meet the agreed specification.
- Verified by both user and assistant.
- No errors, bugs, or warnings.
