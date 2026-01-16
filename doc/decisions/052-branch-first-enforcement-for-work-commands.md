# 052. Branch-First Enforcement for Work Commands

Date: 2026-01-15

## Status

Accepted

## Context

ADR-017 established a "Branch Naming Invariant" requiring all work-initiating commands to create branches "at invocation time." However, the implementation of these commands placed branch creation at steps 3-5, after:

- Entering plan mode (step 0)
- Checking ADRs (step 1)
- Gathering information through prompts (steps 2-3)

This ordering created a gap where Claude could start investigating code, analyzing issues, or even implementing fixes while still on `main`. Users reported that fixes were being implemented without a branch being created, violating the core invariant.

## Decision

Restructure all 5 work-initiating commands to create the branch **immediately** as step 0:

```markdown
**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `{prefix}/` branch name from the initial description
   (`$ARGUMENTS`) and create it. Do NOT proceed to any other step until this is complete.
```

The branch name is derived directly from `$ARGUMENTS` (the user's initial description), not from clarifying questions asked later. This mirrors real developer behavior: `git checkout -b fix/issue-123` happens before investigating the issue.

## Consequences

### Positive

- **Enforces ADR-017 invariant** - No work can happen on `main`
- **Matches developer mental model** - Branch first, then investigate
- **Self-documenting** - CRITICAL warning makes the requirement explicit
- **Fail-safe** - Even if Claude misinterprets later steps, the branch already exists

### Negative

- **Less refined branch names** - Branch name comes from initial description, not refined understanding
- **Slightly awkward ordering** - Branch created before plan mode feels unconventional

### Neutral

- Backlog integration still works (step renumbered but unchanged)
- Plan mode still happens (just after branch creation)

## Commands Updated

| Command | Prefix | New Step 0 |
|---------|--------|------------|
| `/pro:bug` | `fix/` | IMMEDIATELY create branch |
| `/pro:feature` | `feat/` | IMMEDIATELY create branch |
| `/pro:refactor` | `refactor/` | IMMEDIATELY create branch |
| `/pro:spike` | `spike/` | IMMEDIATELY create branch |
| `/pro:chore` | `chore/` | IMMEDIATELY create branch |

## Alternatives Considered

### 1. Add validation hook before plan mode

Rejected because:
- Adds complexity
- Doesn't change the root cause (ordering)
- Could still be bypassed

### 2. Trust Claude to follow step ordering

Rejected because:
- Already failing in practice
- Instructions at step 4 can be overlooked when step 0 says "enter plan mode"
- Explicit step 0 is more reliable

## Related

- ADR-017: Branch Naming Invariant and Work-Type Taxonomy
- ADR-016: ADR Check and Backlog Integration for Work Commands
- Planning: `.plan/.done/fix-bug-command-branch-enforcement/`
