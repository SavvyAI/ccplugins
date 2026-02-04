# 065. Branch Lifecycle Park and rmrf Commands

Date: 2026-02-04

## Status

Accepted

## Context

Work-initiating commands (`/pro:feature`, `/pro:bug`, `/pro:spike`, etc.) create branches per ADR-017 and ADR-052. However, there was no standardized way to:

1. **Pause work** - Preserve planning documentation and return an item to the backlog for later
2. **Abandon work** - Completely remove a branch and all associated artifacts

Users were manually performing these workflows with ad-hoc commands, leading to inconsistent handling of planning docs and backlog state.

A real-world session showed the "park" pattern:
```
mkdir -p .plan/.parked
mv .plan/{branch}/ .plan/.parked/
Update backlog: status → "open", add parkedAt, planningDocs
Commit on main
git branch -d {branch}
```

## Decision

Introduce two commands for branch lifecycle management:

### `/pro:branch.park` - Pause for Later

Preserves work for future resumption:
- Moves planning docs to `.plan/.parked/{branch-slug}/`
- Updates backlog item: `status: "open"`, adds `parkedAt` timestamp and `planningDocs` path
- Preserves `sourceBranch` field (required for resumption)
- Triages uncommitted changes (commit, stash, or discard)
- Deletes branch (local and remote)
- Returns to main

### `/pro:branch.rmrf` - Destroy Everything

Complete abandonment with Unix-style naming:
- Requires explicit "RMRF" confirmation
- Deletes planning docs (`.plan/{branch-slug}/` and `.plan/.parked/{branch-slug}/`)
- Marks backlog item as `status: "aborted"` (preserves history)
- Removes park-related fields (`parkedAt`, `planningDocs`)
- Force deletes branch (local and remote)
- Returns to main

### Backlog Status Values

Extended with new status:
- `open` - Ready to work on (park reverts to this)
- `in-progress` - Currently being worked on
- `resolved` - Completed successfully
- `aborted` - Work abandoned (via rmrf)

### Integration with `/pro:backlog.resume`

Added Step 3b to handle resuming parked work:
1. Detect `planningDocs` field on backlog item
2. Restore docs from `.plan/.parked/` to `.plan/`
3. Recreate branch using preserved `sourceBranch`
4. Remove park metadata from backlog item
5. Continue with normal resume flow

## Consequences

### Positive

- **Standardized workflows** - Consistent handling of pause/abandon scenarios
- **Context preservation** - Parked work retains full planning context for resumption
- **Clean abandonment** - `rmrf` provides a "nuclear option" without orphaned artifacts
- **Backlog integrity** - Status tracking enables project visibility across paused/abandoned work
- **Safety by default** - `rmrf` requires explicit confirmation, `park` triages uncommitted changes

### Negative

- **Two commands for related action** - Could be one command with modes, but explicit commands are more discoverable
- **New backlog status** - `aborted` adds to the status taxonomy

### Neutral

- Naming (`park`, `rmrf`) uses developer-familiar terminology
- Follows existing command namespace pattern (`branch.*`)

## Alternatives Considered

### 1. Single `/pro:branch.abort` with modes

```
/pro:branch.abort pause
/pro:branch.abort nix
```

Rejected: User explicitly requested separate commands for clarity.

### 2. Use `status: resolved` with resolution note for abandonment

Rejected: `resolved` implies successful completion, confusing for abandoned work. Explicit `aborted` status is clearer.

### 3. Delete backlog items on rmrf

Rejected: Preserving items as `aborted` maintains history for project retrospectives.

## Related

- ADR-017: Branch Naming Invariant and Work-Type Taxonomy
- ADR-052: Branch-First Enforcement for Work Commands
- Planning: `.plan/.done/feat-branch-cleanup-pause-or-nix/`
