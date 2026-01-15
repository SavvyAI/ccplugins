# Implementation Plan: Branch-First Enforcement

## Summary

All 5 work-initiating commands need restructuring to create branches **immediately** upon invocation, before any other work begins.

## Current (Broken) Order

All commands follow this pattern:
```
0. Enter plan mode
1. Check ADRs
2-3. Gather info / ask questions
4-5. Create branch (TOO LATE!)
6+. Do work
```

## New (Fixed) Order

```
0. Generate branch name from $ARGUMENTS (extract key terms)
1. Create and switch to branch IMMEDIATELY
2. Enter plan mode
3. Check ADRs
4+. Continue with command-specific flow
```

## Key Design Decisions

### 1. Branch Name Generation Must Be First

The branch name must be derived from `$ARGUMENTS` directly, not from later clarification.
- Use initial description to generate a reasonable branch name
- Can still refine understanding later, but branch exists from the start
- This mirrors how real developers work: `git checkout -b fix/issue-123` before investigating

### 2. Add Explicit Warning

Add a CRITICAL instruction that branch creation is non-negotiable:

```markdown
**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**
```

### 3. Backlog Entry After Branch

The backlog entry naturally comes after branch creation since it needs the branch name.
This is fine - the key invariant is that no work happens on main.

## Files to Modify

1. `pro/commands/bug.md` - Critical
2. `pro/commands/feature.md`
3. `pro/commands/refactor.md`
4. `pro/commands/spike.md`
5. `pro/commands/chore.md`

## Change Template

For each command, restructure "Your Task" section:

### Before (bug.md example):
```markdown
0. Enter **plan mode** (announce this to the user).
1. **Check ADRs for related decisions** - ...
2. Capture bug details via the guided prompts above.
3. Generate a clear, descriptive `fix/` branch name...
4. Create and switch to the new branch.
5. **Add to backlog as in-progress** - ...
```

### After (bug.md example):
```markdown
**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `fix/` branch name from the initial description
   and create it. Do NOT proceed to any other step until this is complete.
1. Enter **plan mode** (announce this to the user).
2. **Check ADRs for related decisions** - ...
3. Capture bug details via the guided prompts above.
4. **Add to backlog as in-progress** - ...
... (remaining steps renumbered)
```

## Verification

After implementation:
1. Test `/pro:bug` with a simple issue
2. Verify branch is created before any questions are asked
3. Confirm git status shows new branch immediately
