# Branch Cleanup Commands - Park and rmrf Workflows

## Summary

Create two commands for branch cleanup:
1. **`/pro:branch.park`** - Preserve planning docs, return item to backlog, delete branch
2. **`/pro:branch.rmrf`** - Completely remove branch, planning artifacts, and backlog item (kill everything)

## User Stories

### Use Case 1: PARK (Preserve for Later)
> "I want to stop the branch, but I want to keep the planning, and I just want to backlog everything so it can pause it, rethink things, and or just because I don't feel like working on it anymore."

- Preserve planning docs in `.plan/.parked/{branch-name}/`
- Update backlog item: `status: "open"`, add `parkedAt` timestamp and `planningDocs` reference
- Enrich description with any analysis/findings from planning docs
- Delete branch (local and remote)
- Switch to main

### Use Case 2: RMRF (Kill Everything)
> "I want to stop and kill the whole thing. Kill the planning, kill everything."

- Delete planning directory (`.plan/{branch-name}/`)
- Update backlog item: `status: "aborted"` or delete entirely
- Delete branch (local and remote)
- Switch to main

## Relevant ADRs

- **ADR-017**: Branch Naming Invariant and Work-Type Taxonomy - Defines branch prefixes
- **ADR-052**: Branch-First Enforcement - Branch created first before investigation

## Reference Session

From the user's real-world usage of the "park" pattern:

```
⏺ mkdir -p .plan/.parked
⏺ mv .plan/fix-resume-summary-duplication .plan/.parked/
⏺ Update backlog: status → "pending", add parkedAt, add planningDocs reference
⏺ Commit changes on main
⏺ git branch -d fix/resume-summary-duplication
⏺ git push origin main
```

## Design

### /pro:branch.park

```markdown
---
description: "Pause this branch? → Preserves planning docs and returns item to backlog → Ready for later"
---
```

**Workflow:**

1. **Detect current branch**
   - If on main: Error - "Nothing to park. You're on main."
   - Extract branch name for planning directory lookup

2. **Triage working directory**
   - Check `git status` for uncommitted changes
   - If changes exist, ask user:
     - Commit changes with message
     - Stash changes
     - Discard changes
   - Proceed once working directory is clean

3. **Move planning docs to parked location**
   - Create `.plan/.parked/` if needed
   - Move `.plan/{branch-slug}/` to `.plan/.parked/{branch-slug}/`

4. **Find and update backlog item**
   - Search by `sourceBranch` matching current branch
   - Update:
     - `status`: "in-progress" → "open"
     - Add `parkedAt`: ISO timestamp
     - Add `planningDocs`: ".plan/.parked/{branch-slug}/"
     - Optionally enrich `description` with key findings

5. **Commit changes on main**
   - Switch to main
   - Commit parked docs and backlog update

6. **Delete branch**
   - Delete local: `git branch -d {branch}`
   - Delete remote (if exists): `git push origin --delete {branch}`

7. **Report summary**
   - Show what was preserved
   - Remind user how to resume (pull from backlog, planning docs location)

### /pro:branch.rmrf

```markdown
---
description: "Kill this branch? → Removes branch, planning docs, and aborts backlog item → Clean slate"
---
```

**Workflow:**

1. **Detect current branch**
   - If on main: Error - "Nothing to remove. You're on main."

2. **Confirmation required**
   - Show what will be deleted:
     - Branch name
     - Planning directory contents
     - Backlog item (if found)
   - Require explicit confirmation: "Type RMRF to confirm"

3. **Switch to main first**
   - `git checkout main` (can't delete current branch)

4. **Delete planning docs**
   - `rm -rf .plan/{branch-slug}/`
   - Also check `.plan/.parked/{branch-slug}/` if partially parked before

5. **Update backlog item**
   - Option A: Set `status: "aborted"` with resolution note
   - Option B: Delete the item entirely
   - Recommendation: Set status to "aborted" (preserves history)

6. **Delete branch**
   - Force delete local: `git branch -D {branch}` (capital D, force)
   - Delete remote (if exists): `git push origin --delete {branch}`

7. **Report summary**
   - Confirm destruction complete

### Working Directory Triage (for /pro:branch.park)

When uncommitted changes exist:

```
┌─────────────────────────────────────────────────────────────┐
│  Uncommitted changes detected:                              │
│                                                             │
│  Modified:                                                  │
│    src/components/Button.tsx                                │
│    src/utils/helpers.ts                                     │
│                                                             │
│  Untracked:                                                 │
│    src/components/NewFeature.tsx                            │
│                                                             │
│  How would you like to handle these before parking?         │
│                                                             │
│  [C] Commit - Create a WIP commit on this branch            │
│  [S] Stash - Stash changes for later                        │
│  [D] Discard - Throw away all changes                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### MVP Batch Handling

When on an MVP batch branch:

```
┌─────────────────────────────────────────────────────────────┐
│  This branch is part of an MVP batch.                       │
│                                                             │
│  MVP Progress: 3/8 complete                                 │
│                                                             │
│  What would you like to do?                                 │
│                                                             │
│  [A] Abort entire MVP batch                                 │
│  [C] Abort only current item (#4)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Backlog Status Values

Current:
- `open` - Ready to be worked on
- `in-progress` - Currently being worked on
- `resolved` - Completed successfully

New:
- `aborted` - Work was abandoned (via rmrf)
- (No change for park - reverts to `open`)

### Edge Cases

1. **Not on a work branch**
   - Error with guidance

2. **No planning docs exist**
   - Skip preservation step, continue with branch cleanup

3. **Remote branch doesn't exist**
   - Skip remote deletion

4. **No backlog item found**
   - Proceed with branch cleanup, skip backlog update
   - Warn user: "No backlog item found for this branch"

5. **Uncommitted changes (park)**
   - Triage with user input

6. **Uncommitted changes (rmrf)**
   - Force discard (part of "kill everything")
   - But still require RMRF confirmation

## Implementation Steps

1. Create `pro/commands/branch.park.md`
2. Create `pro/commands/branch.rmrf.md`
3. Update plugin.json to register both commands
4. Test both workflows manually

## Definition of Done

- [x] /pro:branch.park preserves planning and returns to backlog
- [x] /pro:branch.rmrf destroys everything
- [x] Working directory triage works for park
- [x] MVP batch handling implemented
- [x] Safety confirmations for destructive actions
- [x] Edge cases handled gracefully
- [ ] No errors, bugs, or warnings (pending testing)

## Implementation

Created two command files:
- `pro/commands/branch.park.md` - Preserve and pause workflow
- `pro/commands/branch.rmrf.md` - Destroy everything workflow

Updated `pro/commands/backlog.resume.md`:
- Added Step 3b for resuming parked work
- Restores planning docs from `.plan/.parked/` location
- Creates new branch with original name

## Related ADRs

- [ADR-065: Branch Lifecycle Park and rmrf Commands](../../doc/decisions/065-branch-lifecycle-park-and-rmrf-commands.md)
