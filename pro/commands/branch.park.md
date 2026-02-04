---
description: "Pause this branch? → Preserves planning docs and returns item to backlog → Ready for later"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

Pause work on the current branch and preserve everything for later resumption.

## Your Task

### Step 1: Detect Current Branch

```bash
git branch --show-current
```

**If on main or master:**
- Error: "Nothing to park. You're on main. Use `/pro:backlog` to start new work."
- Stop execution

**If on a work branch:**
- Store branch name for later steps
- Convert branch name to planning directory slug: `feat/add-auth` → `feat-add-auth`

### Step 2: Triage Working Directory

Check for uncommitted changes:

```bash
git status --porcelain
```

**If working directory is clean:**
- Skip to Step 3

**If changes exist:**
- Show the user what's modified/untracked
- Use `AskUserQuestion` to ask how to handle:

| Option | Label | Description |
|--------|-------|-------------|
| Commit | Create a WIP commit | Commits all changes with message "WIP: parking {branch}" |
| Stash | Stash for later | Creates a stash with message "Parked: {branch}" |
| Discard | Throw away changes | Discards all uncommitted changes (requires confirmation) |

**Execute chosen option:**

- **Commit:**
  ```bash
  git add -A
  git commit -m "WIP: parking {branch-name}"
  ```

- **Stash:**
  ```bash
  git stash push -m "Parked: {branch-name}"
  ```

- **Discard:**
  - Require confirmation: "Type DISCARD to confirm"
  ```bash
  git restore .
  git clean -fd
  ```

### Step 3: Check for MVP Batch

Read `.plan/backlog.json` and check if any items have:
- `sourceBranch` matching current branch
- `mvpBatch: true`

**If MVP batch detected:**
- Use `AskUserQuestion`:
  - "Abort entire MVP batch" - Park all MVP items
  - "Abort only current item" - Park just the current item, keep MVP batch active

### Step 4: Move Planning Docs to Parked Location

Check if planning directory exists:

```bash
ls -la .plan/{branch-slug}/
```

**If planning docs exist:**

```bash
mkdir -p .plan/.parked/
mv .plan/{branch-slug}/ .plan/.parked/{branch-slug}/
```

**If no planning docs:**
- Note this for the summary but continue

### Step 5: Find and Update Backlog Item

Read `.plan/backlog.json` and find items where `sourceBranch` matches the current branch.

**For each matching item, update:**

```json
{
  "status": "open",
  "parkedAt": "{ISO-8601-timestamp}",
  "planningDocs": ".plan/.parked/{branch-slug}/"
}
```

**Important:** Preserve the `sourceBranch` field - it's required by `/pro:backlog.resume` Step 3b to recreate the branch when resuming parked work.

**Optional enrichment:**
- If planning docs contain key findings (root cause, recommended fix, etc.), append a summary to the item's `description`

**If no backlog item found:**
- Warn: "No backlog item found for branch '{branch-name}'. Proceeding with branch cleanup only."

### Step 6: Commit Changes on Main

Switch to main and commit the parked state:

```bash
git checkout main
git add .plan/.parked/ .plan/backlog.json
git commit -m "$(cat <<'EOF'
chore: park {branch-name}

Planning docs preserved at .plan/.parked/{branch-slug}/

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Step 7: Delete the Branch

**Delete local branch (force delete to handle unmerged changes):**
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

### Step 8: Push Changes

```bash
git push origin main
```

### Step 9: Report Summary

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Branch parked successfully                               │
│                                                             │
│  Branch: {branch-name} (deleted)                            │
│  Planning docs: .plan/.parked/{branch-slug}/                │
│  Backlog item: #{id} - {title} (status: open)               │
│                                                             │
│  To resume later:                                           │
│  - Run /pro:backlog and select item #{id}                   │
│  - Or run /pro:backlog.resume if it's highest priority      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| On main/master | Error with guidance |
| No planning docs | Skip preservation, continue |
| No remote branch | Skip remote deletion |
| No backlog item | Warn, continue with cleanup |
| Commit/lint fails | Fix issues and retry |

## Definition of Done

- Planning docs preserved in `.plan/.parked/`
- Backlog item reverted to `open` status with `parkedAt` and `planningDocs`
- Branch deleted (local and remote)
- On main branch, ready for new work
