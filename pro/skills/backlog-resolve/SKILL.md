---
name: backlog-resolve
description: Mark backlog items as resolved when work is complete. Use when a PR is merged or work is finished. Finds item by sourceBranch and updates status to resolved with timestamp.
---

# Backlog Resolve

Mark backlog items as resolved when work is complete.

## When to Use This Skill

This skill is invoked by:
- `/pro:pr.merged` - After a PR is successfully merged
- Any workflow that completes work tracked in the backlog

Can also be invoked standalone to resolve items manually.

## Input

- **Branch name**: The branch that was merged/completed (required)
  - If not provided explicitly, read from current context (e.g., PR details, merged branch name)

## Execution

### Step 1: Read the backlog

```bash
cat .plan/backlog.json
```

If file doesn't exist, report "No backlog found" and exit.

### Step 2: Find matching item

Search items where `sourceBranch` matches the provided branch name.

**Matching rules:**
- Exact match: `sourceBranch === branchName`
- Flexible match: Handle with/without prefix (e.g., `feat/foo` matches `foo` if no exact match)

**If no match found:**
- Report: "No backlog item found for branch: {branchName}"
- This is not an error - work may have been started manually without /pro:feature

### Step 3: Check current status

Read the item's current `status`:

| Current Status | Action |
|----------------|--------|
| `in-progress` | Update to `resolved` (continue to Step 4) |
| `open` | Update to `resolved` (continue to Step 4) |
| `resolved` | Already resolved - skip update, report "Item already resolved" |
| `aborted` | Already aborted - skip update, warn "Item was aborted, not resolved" |

### Step 4: Update the item

Update the matching item in `.plan/backlog.json`:

```json
{
  "status": "resolved",
  "resolvedAt": "<current ISO 8601 timestamp>"
}
```

Example transformation:
```json
// Before
{
  "id": 42,
  "title": "Add dark mode",
  "status": "in-progress",
  "sourceBranch": "feat/add-dark-mode",
  ...
}

// After
{
  "id": 42,
  "title": "Add dark mode",
  "status": "resolved",
  "resolvedAt": "2026-02-28T15:30:00Z",
  "sourceBranch": "feat/add-dark-mode",
  ...
}
```

### Step 5: Commit the change

```bash
git add .plan/backlog.json
git commit -m "chore: mark backlog item #<id> as resolved"
```

## Output

Report the result:

```
✓ Backlog item #<id> marked as resolved
  Title: <item title>
  Branch: <sourceBranch>
```

## Error Handling

| Scenario | Response |
|----------|----------|
| No backlog.json | "No backlog found - nothing to update" |
| No matching item | "No backlog item for branch {branch}" (not an error) |
| Already resolved | "Item #{id} already resolved at {resolvedAt}" |
| Already aborted | "Warning: Item #{id} was aborted, not marking as resolved" |
| JSON parse error | "Error reading backlog.json: {error}" |

## Integration Points

Commands that invoke this skill:
- `/pro:pr.merged` - After successful merge

To invoke from another command, include:

```markdown
## Mark Backlog Item Resolved

After merge completes, invoke the backlog-resolve skill:
1. Pass the merged branch name
2. The skill will find and update the matching backlog item
3. Commit the change
```
