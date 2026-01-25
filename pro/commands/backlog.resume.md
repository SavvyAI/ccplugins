---
description: "What's next? → Resumes in-progress work OR recommends highest priority item → Smart continuation"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion", "TodoWrite"]
---

## Context

Smart "next action" command that either resumes in-progress work or recommends the next highest priority item from the backlog.

## Your Task

### 1. Check for in-progress work

Read `.plan/backlog.json` and filter items with `status: "in-progress"`.

**Check for MVP batch first:**

If any items have `mvpBatch: true`:
- This is an active MVP workflow → Go to step 3a (MVP Resume)
- Show MVP progress and continue from where it left off

**If in-progress items exist (non-MVP):**

- If single item → Resume it (go to step 3)
- If multiple items → Present list and ask which to resume

**If NO in-progress items:**

- Continue to step 2 (recommend next item)

### 2. Recommend next item from backlog

If no work is in progress, show the backlog with the highest priority item pre-selected:

1. Filter items with `status: "open"`
2. Sort by severity (critical > high > medium > low), then by `createdAt` (oldest first)
3. Pre-select the top item as the recommended choice
4. Present using `AskUserQuestion`:

   ```
   ┌─────────────────────────────────────────────────────────┐
   │  No work in progress. Recommended next:                 │
   │                                                         │
   │  [●] [Security] [critical] Fix API key exposure         │
   │  [ ] [Bug]      [high]     Payment timeout issue        │
   │  [ ] [Tests]    [medium]   Add auth flow tests          │
   │  [ ] [Feature]  [low]      Dark mode support            │
   │                                                         │
   │  ● = Recommended (highest priority)                     │
   │                                                         │
   │  Accept recommendation or choose differently.           │
   └─────────────────────────────────────────────────────────┘
   ```

5. Enable `multiSelect: true` so user can pick multiple related items
6. User can:
   - Accept the pre-selected recommendation
   - Select different item(s)
   - Select additional items along with recommendation

7. Once selected, create branch and begin work (same as `/pro:backlog` step 6)

### 3a. Resume MVP Batch

When resuming an MVP batch (`mvpBatch: true` items detected):

1. **Gather MVP batch items**
   - Filter all items with `mvpBatch: true`
   - Separate into: completed (`status: "resolved"`) and remaining (`status: "in-progress"`)
   - Calculate progress: `{completed}/{total}`

2. **Find next item to work on**
   - Sort remaining items by `id` (original order)
   - First item in remaining list is the "current" item

3. **Switch to MVP branch**
   - Get branch from any MVP item's `sourceBranch` (should all be same)
   - Switch to the branch: `git checkout {mvp-branch}`

4. **Display MVP progress**

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MVP Progress: ████████░░░░░░░░░░░░ 3/8 complete
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✓ Completed:
     #12 User can sign up with email
     #13 User can log in
     #14 User can view dashboard

   ▶ Current: #15 User can reset password

   ○ Remaining:
     #16 User can update profile
     #17 User can change password
     #18 User can delete account
     #19 Admin can view all users

   Branch: mvp/my-project
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Continue with current item**
   - Read planning notes from `.plan/mvp-{branch-name}/item-{id}.md`
   - Enter implementation mode for current item
   - Follow the same flow as `/pro:backlog.mvp` step 7

### 3. Resume in-progress work (non-MVP)

For the selected in-progress item:

1. **Switch to the work branch**
   - Get branch from the backlog item (check `sourceBranch` or infer from planning directory)
   - Check if branch exists locally: `git branch --list {branch}`
   - If exists, switch to it: `git checkout {branch}`
   - If not, check remote and create tracking branch

2. **Gather context**
   - Read planning notes from `.plan/{branch-name}/`
   - Read recent git history: `git log --oneline -10`
   - Check for uncommitted changes: `git status`
   - Review the backlog item's description and requirements
   - **Check for checkpoint**: Read `.plan/{branch-name}/checkpoint.json` if it exists
     - If found, restore todos using `TodoWrite` with the checkpoint's `todos` array
     - This preserves work state from the previous session
   - **Check for error context**: Read `.plan/{branch-name}/errors.json` if it exists
     - If found, note the strike count and any unresolved errors
     - If strike count > 0, apply 3-Strike Protocol rules:
       - Strike 1: Normal operation, previous attempt failed
       - Strike 2: MUST use different approach than previous attempt
       - Strike 3+: Escalate to user before proceeding

3. **Present status summary**

   ```
   ┌─────────────────────────────────────────────────────────┐
   │  Resuming: #1 - [Title]                                 │
   │  Branch: feat/example-branch                            │
   │                                                         │
   │  Planning notes: .plan/feat-example-branch/             │
   │  Last commit: abc1234 - "Add initial implementation"    │
   │  Uncommitted changes: 3 files modified                  │
   │  Checkpoint: ✓ restored (3 completed, 2 pending)        │
   │  Errors: ⚠ 2 unresolved (Strike 2 - different approach) │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
   ```

   If checkpoint was restored, show the todo summary. If no checkpoint exists, omit that line.
   If errors exist with strike count > 0, show the error summary line.

4. **Continue work**
   - Read and follow the planning notes
   - Resume implementation where it left off
   - Use the todo list to track remaining tasks

## Priority Sort Order

1. **Phase** (descending): must > should > could > wont > unset
2. **Severity** (descending): critical > high > medium > low
3. **Age** (ascending): oldest items first (by `createdAt`)

**Phase inference:** If item has no `phase` field, infer from severity:
- `critical`/`high` → `must`
- `medium` → `should`
- `low` → `could`

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Definition of Done

- If in-progress: Switched to branch, context gathered, ready to continue
- If new work: Branch created, items marked in-progress, plan mode entered
