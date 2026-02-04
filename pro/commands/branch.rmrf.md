---
description: "Kill this branch? → Removes branch, planning docs, and aborts backlog item → Clean slate"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

Completely destroy the current branch and all associated artifacts. This is irreversible.

## Your Task

### Step 1: Detect Current Branch

```bash
git branch --show-current
```

**If on main or master:**
- Error: "Nothing to remove. You're on main."
- Stop execution

**If on a work branch:**
- Store branch name for later steps
- Convert branch name to planning directory slug: `feat/add-auth` → `feat-add-auth`

### Step 2: Gather What Will Be Deleted

Collect information about what will be destroyed:

**1. Branch info:**
```bash
git log --oneline -5
```

**2. Planning docs:**
```bash
ls -la .plan/{branch-slug}/ 2>/dev/null || echo "No planning docs"
```

**3. Parked docs (if previously parked):**
```bash
ls -la .plan/.parked/{branch-slug}/ 2>/dev/null || echo "No parked docs"
```

**4. Backlog item:**
- Read `.plan/backlog.json`
- Find items where `sourceBranch` matches current branch

**5. Uncommitted changes:**
```bash
git status --porcelain
```

### Step 3: Show Destruction Preview

Display what will be deleted:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  DESTRUCTIVE OPERATION                                   │
│                                                             │
│  The following will be PERMANENTLY DELETED:                 │
│                                                             │
│  Branch: {branch-name}                                      │
│    └─ 5 commits (abc1234..def5678)                          │
│    └─ 3 uncommitted changes (WILL BE LOST)                  │
│                                                             │
│  Planning docs: .plan/{branch-slug}/                        │
│    └─ plan.md (2.4 KB)                                      │
│    └─ checkpoint.json (1.1 KB)                              │
│                                                             │
│  Backlog item: #{id} - {title}                              │
│    └─ Will be marked as 'aborted'                           │
│                                                             │
│  This action is IRREVERSIBLE.                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Require Explicit Confirmation

Use `AskUserQuestion` with a single option:

```
To confirm destruction, type: RMRF

[ ] RMRF - Confirm permanent deletion
```

**If user confirms:**
- Continue to Step 5

**If user cancels (selects Other or doesn't confirm):**
- Abort: "Operation cancelled. No changes made."
- Stop execution

### Step 5: Check for MVP Batch

Read `.plan/backlog.json` and check if any items have:
- `sourceBranch` matching current branch
- `mvpBatch: true`

**If MVP batch detected:**
- Use `AskUserQuestion`:
  - "Abort entire MVP batch" - Mark all MVP items as aborted
  - "Abort only current item" - Mark just current item as aborted

### Step 6: Switch to Main

Cannot delete the current branch while on it:

```bash
git checkout main
```

**If checkout fails due to uncommitted changes:**
- Force discard (user already confirmed RMRF - all uncommitted changes will be lost):
```bash
git checkout -f main
```

**Note:** The force checkout (`-f`) discards ALL uncommitted changes in the working directory. This is intentional for RMRF - the user confirmed destruction.

### Step 7: Delete Planning Docs

**Delete active planning directory:**
```bash
rm -rf .plan/{branch-slug}/
```

**Delete parked planning directory (if exists):**
```bash
rm -rf .plan/.parked/{branch-slug}/ 2>/dev/null
```

### Step 8: Update Backlog Item

Find items in `.plan/backlog.json` where `sourceBranch` matches the branch.

**For each matching item, update:**

```json
{
  "status": "aborted",
  "abortedAt": "{ISO-8601-timestamp}",
  "resolution": "Aborted via /pro:branch.rmrf"
}
```

**Also remove park-related fields if present:**
- Remove `parkedAt` (if exists)
- Remove `planningDocs` (if exists)

**Write updated backlog.json**

**If no backlog item found:**
- Note: "No backlog item found for this branch"

### Step 9: Delete the Branch

**Force delete local branch:**
```bash
git branch -D {branch-name}
```

**Check if remote branch exists:**
```bash
git ls-remote --heads origin {branch-name}
```

**If remote exists, delete it:**
```bash
git push origin --delete {branch-name}
```

### Step 10: Commit Backlog Update (if changed)

If backlog was updated:

**First verify we're on main:**
```bash
# Verify current branch
CURRENT=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT" != "main" ]; then
  echo "ERROR: Expected to be on main, but on $CURRENT"
  exit 1
fi

# Pull latest to avoid conflicts
git pull --ff-only origin main
```

**Then commit and push:**
```bash
git add .plan/backlog.json
git commit -m "$(cat <<'EOF'
chore: abort {branch-name}

Branch and planning docs removed via /pro:branch.rmrf

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
git push origin main
```

### Step 11: Report Summary

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Branch destroyed                                         │
│                                                             │
│  Deleted:                                                   │
│    ✗ Branch: {branch-name}                                  │
│    ✗ Planning docs: .plan/{branch-slug}/                    │
│    ✗ Remote branch: origin/{branch-name}                    │
│                                                             │
│  Updated:                                                   │
│    • Backlog item #{id}: status → aborted                   │
│                                                             │
│  You are now on: main                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| On main/master | Error with guidance |
| No planning docs | Note in summary, continue |
| No remote branch | Skip remote deletion |
| No backlog item | Note in summary, continue |
| User doesn't confirm | Abort operation |
| Checkout fails | Force checkout (user confirmed RMRF) |

## Safety Features

1. **Explicit RMRF confirmation** - User must type "RMRF" to confirm
2. **Preview before deletion** - Show exactly what will be deleted
3. **MVP batch awareness** - Special handling for batch work
4. **Backlog preservation** - Item marked aborted, not deleted (history preserved)

## Definition of Done

- Branch deleted (local and remote)
- Planning docs removed
- Backlog item marked as `aborted`
- On main branch, clean slate
