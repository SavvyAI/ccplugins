# Fix: Backlog Status Not Updated on PR Merged

## Root Cause

The `/pro:pr.merged` command does not update the backlog item status to `resolved` after a PR is merged. Per ADR-065, the canonical status values are:

- `open` - Ready to work on
- `in-progress` - Currently being worked on
- `resolved` - Completed successfully
- `aborted` - Work abandoned

**Current behavior:** Items created by `/pro:feature` (and other work commands) stay at `status: "in-progress"` forever because `/pro:pr.merged` only:
1. Checks for ADRs
2. Switches to main
3. Pulls latest
4. Creates version tag
5. Deletes branch

**Missing step:** Update backlog item to `status: "resolved"` with `resolvedAt` timestamp.

## Impact

- Backlog drifts out of sync with GitHub reality
- `/pro:roadmap` shows incorrect "in-progress" counts
- `/pro:backlog.resume` may suggest work that's already complete

## Fix

Add new step to `/pro:pr.merged` between step 4 (tagging) and step 5 (branch deletion):

**New Step: Update Backlog Item**
1. Find the backlog item matching the merged branch (`sourceBranch` field)
2. Set `status: "resolved"`
3. Add `resolvedAt: "<ISO 8601 timestamp>"`
4. Commit the backlog update

## Files Changed

- `pro/commands/pr.merged.md` - Add backlog status update step

## Testing

1. Verify `/pro:pr.merged` updates backlog item status
2. Verify `/pro:roadmap` reflects correct completion counts
