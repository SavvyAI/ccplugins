# Bug Report: Work Commands Not Creating Branch Before Fix

## Bug Details

**Reported:** 2026-01-15
**Severity:** Critical (blocks work)
**Reporter:** User via `/pro:bug`

### Steps to Reproduce

1. Run `/pro:bug` with a bug description
2. Claude starts fixing immediately without creating a branch first
3. Fix is implemented on `main` branch

### Expected Behavior

Per ADR-017 "Branch Naming Invariant":
> All **work-initiating commands** must:
> 1. **Create a new branch at invocation time**

The `/pro:bug` command should:
1. Gather bug details
2. **Create the `fix/` branch BEFORE any investigation or implementation**
3. Then proceed with root cause analysis and fix

### Actual Behavior

The command starts work (investigation, planning, potentially even fixing) while still on `main` branch. Branch creation happens later in the flow, if at all.

### Environment

- Project: ccplugins
- Current branch at report time: main
- All work-initiating commands potentially affected

## Root Cause Analysis

### The Problem

The current command ordering is:

```
bug.md:
0. Enter plan mode
1. Check ADRs
2. Capture bug details (questions)
3. Generate branch name        ← Branch created HERE
4. Create and switch to branch
5-12. Investigation, fix, etc.
```

The issue is that **plan mode and investigation can begin before the branch is created**.

In Claude's execution, after entering plan mode (step 0) and starting ADR checks (step 1), it may:
- Start reading code to understand the issue
- Begin investigating the bug
- Even start making changes

...all before reaching step 4 where the branch is created.

### Why This Violates ADR-017

ADR-017 states branches must be created "at invocation time" - meaning **immediately** when the command starts, not after several steps of questioning and investigation.

### The Fix

The commands need to be restructured to enforce:
1. **Branch creation FIRST** (immediately after command invocation)
2. Then proceed with planning, questions, investigation

The new flow should be:

```
0. Generate branch name from initial description
1. Create and switch to the new branch (IMMEDIATELY)
2. Enter plan mode
3. Check ADRs
4. Capture detailed bug info
5-N. Investigation, fix, etc.
```

This ensures that **no work ever happens on main**.

## Commands Affected

All work-initiating commands per ADR-017:
- `/pro:bug` (fix/ prefix)
- `/pro:feature` (feat/ prefix)
- `/pro:refactor` (refactor/ prefix)
- `/pro:spike` (spike/ prefix)
- `/pro:chore` (chore/ prefix)
