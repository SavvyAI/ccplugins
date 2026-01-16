# Plan: Fix Branch-First Enforcement for Work Commands

## Problem Summary

When `/pro:bug` (and other work-initiating commands) are invoked, the branch is created **after** several steps of setup, allowing investigation and potentially fixes to happen on `main`.

**Severity:** Critical - Violates core ADR-017 invariant that work-initiating commands must create branches "at invocation time."

## Root Cause

The command step ordering puts branch creation at steps 3-5, after:
- Entering plan mode (step 0)
- Checking ADRs (step 1)
- Gathering info/asking questions (step 2-3)

During this time, Claude may start reading code, investigating issues, or even making changes - all on `main`.

## Solution

Restructure all 5 work-initiating commands to:

1. **Create branch FIRST** (step 0) - Generate branch name from `$ARGUMENTS` immediately
2. Add explicit CRITICAL warning that branch creation is non-negotiable
3. Renumber remaining steps accordingly

## Implementation Steps

1. **Update `pro/commands/bug.md`**
   - Move branch creation to step 0
   - Add CRITICAL warning block
   - Renumber steps 1-12

2. **Update `pro/commands/feature.md`**
   - Same restructuring

3. **Update `pro/commands/refactor.md`**
   - Same restructuring

4. **Update `pro/commands/spike.md`**
   - Same restructuring

5. **Update `pro/commands/chore.md`**
   - Same restructuring

6. **Add backlog entry** for this work (as in-progress)

7. **Verify** by tracing through a sample `/pro:bug` invocation

## Files Changed

- `pro/commands/bug.md`
- `pro/commands/feature.md`
- `pro/commands/refactor.md`
- `pro/commands/spike.md`
- `pro/commands/chore.md`

## Risk Assessment

- **Low risk** - These are documentation/prompt files, not code
- **No breaking changes** - Same functionality, different ordering
- **Testing** - Manual verification by running commands

## Related ADRs

- [052. Branch-First Enforcement for Work Commands](../../../doc/decisions/052-branch-first-enforcement-for-work-commands.md)
