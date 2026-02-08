# Bug: Scaffold chrome-extension missing production code patterns

## Summary

The `/pro:scaffold.chrome-extension` template produces extensions that don't match the quality patterns of the reference extension (conversation-titles-chatgpt).

## Steps to Reproduce

1. Run `/pro:scaffold.chrome-extension` to create a new extension
2. Examine generated `src/content/index.ts`
3. Note: has `console.log`, no centralized selectors, no unit tests

## Expected Behavior

Generated scaffolds should follow production-ready patterns:
- No debug console.log statements in production code
- Centralized selectors module (`selectors.ts`)
- Unit test templates with Chrome API mocking patterns
- Vitest setup with jsdom for DOM testing

## Actual Behavior

Current template produces:
- `console.log('[Extension] Content script loaded');` in `src/content/index.ts`
- No `selectors.ts` file
- No unit test files (only e2e tests)
- No examples of Chrome API mocking

## Environment

- Repository: ccplugins
- Branch: fix/add-to-attio-code-quality
- Template location: `pro/commands/_templates/chrome-extension/`

## Severity

**High** - Degraded experience. Extensions work but require manual cleanup to match production standards.

## Root Cause

The template extraction (per PLAN.md) explicitly excluded source files as "app-specific", but the reference extension's patterns for:
1. Centralized selectors (constants, timing values, element IDs)
2. Zero debug logging
3. Unit test structure with mocking

...are NOT app-specific. They are reusable patterns that should be in the scaffold.

## Related ADRs

- ADR-066: Scaffold Command Namespace Pattern
- ADR-044: Chrome Extension Developer Skill
- ADR-049: Code Quality Skill Architecture

## Fix Implementation Steps

1. Remove `console.log` from `src/content/index.ts` template
2. Add `src/content/selectors.ts` template with example constants
3. Add `src/content/index.test.ts` template with:
   - Chrome API mocking pattern
   - DOM mocking with jsdom
   - Example test structure
4. Update package.json.hbs with test dependencies if missing
