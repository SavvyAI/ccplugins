---
description: "Need to improve existing code? → Creates a dedicated branch for refactoring → Systematic code improvements without breaking features"
allowed-tools: ["Bash", "Read", "Write", "Edit"]
---

Review the coding standards (SEE: @claude.md), docs, and code, and refactor the code follow the standards, including:

  0. Make errors more user-friendly in development while still keeping useful debugging info.
  1. **Magic Strings/Numbers**: Replace with named constants in appropriate constant files or i18n keys
  2. **Hardcoded Values**: Move to configuration files, environment variables, or .dev/pid.json (for ports)
  3. **Duplicated Logic**: Extract to shared utilities/helpers
  4. **User-Facing Text**: Move to i18n/translations.ts with proper keys
  5. **Missing Types**: Add proper TypeScript types (no 'any', no implicit types)
  6. **Error Handling**: Ensure proper error handling with user-friendly messages
  7. **Missing Tests**: Identify what tests are needed for the change
  8. **Code Smells**: Remove commented code, console.logs, TODOs, or placeholder implementations
  9. **CLAUDE.md Violations**: Check against both global and project CLAUDE.md requirements

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Your Task

**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `refactor/` branch name from the initial description
   (`$ARGUMENTS` or context) and create it. Do NOT proceed to any other step until this is complete.
   Example: "clean up auth module" → `refactor/clean-up-auth-module`
1. Enter **plan mode** (announce this to the user).
2. **Check ADRs for related decisions** - Search `doc/decisions/` for prior decisions related to this code. Summarize any relevant decisions before proposing refactors. Do not suggest changes that contradict existing ADRs without explicitly acknowledging them.
3. **Add to backlog as in-progress** - This enables `/pro:backlog.resume` to pick up where you left off:
   - Ensure `.plan/backlog.json` exists (create with `{"lastSequence": 0, "items": []}` if not)
   - Increment `lastSequence` and add item:
     ```json
     {
       "id": <next sequence>,
       "title": "<brief title from refactor scope>",
       "description": "<full description of refactor>",
       "category": "debt",
       "severity": "medium",
       "fingerprint": "debt|<id>|<slugified-title>",
       "source": "/pro:refactor",
       "sourceBranch": "<branch name>",
       "createdAt": "<ISO 8601 timestamp>",
       "status": "in-progress"
     }
     ```
4. Store all planning notes, todos, and related documentation here: `${ProjectRoot}/.plan/${BranchName}` with the following branch naming strategy: `refactor/clean-up-auth` >> `refactor-clean-up-auth`.
5. Outline detailed implementation steps.
6. Implement the refactor and document changes.
7. `> coderabbit --prompt-only`
8. Document any known issues that won't be addressed here:
   - Use `/pro:backlog.add <description>` to add items to the backlog
   - Set `source` to `/pro:refactor` and `sourceBranch` to current branch
