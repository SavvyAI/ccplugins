# Plan: Automate Version Tagging in /pro:pr.merged

## Goal

Automatically create and push git tags when a version bump was confirmed during `/pro:pr`.

## Current State

- `/pro:pr` detects unchanged versions and prompts user to bump
- Version is updated in the file but **not recorded** for later use
- After merge, user must manually remember to tag

## Implementation

### 1. Modify `/pro:pr` (pr.md)

After the version bump is applied, write:

```
.plan/{branch-name}/version-bump.json
```

Content:
```json
{
  "version": "0.2.0",
  "confirmedAt": "2026-02-03T00:00:00Z",
  "bumpType": "minor"
}
```

**Location in pr.md:** After Step 3 in "Version Check Instructions" where user chooses to bump.

### 2. Modify `/pro:pr.merged` (pr.merged.md)

Add new step after pulling main:

1. Check for `.plan/.done/{branch-name}/version-bump.json`
2. If found:
   - Determine tag format by checking existing tags (`git tag --list`)
   - If existing tags use `v` prefix → use `v{version}`
   - If no prefix → use `{version}`
   - If no tags exist → default to `v{version}`
3. Check if tag already exists: `git tag --list {tag}`
4. If exists: warn and skip
5. If not exists:
   - `git tag {tag}`
   - `git push origin {tag}`
   - Report success

## Files Modified

1. `pro/commands/pr.md` - Add version-bump.json creation
2. `pro/commands/pr.merged.md` - Add tagging workflow

## Edge Cases

- **No version bump:** No file written, no tag created
- **Tag already exists:** Warn and skip (don't fail workflow)
- **No remote:** Skip push, warn user

## Testing

Manual verification:
1. Create feature branch with version bump
2. Run `/pro:pr` → verify version-bump.json created
3. Merge PR
4. Run `/pro:pr.merged` → verify tag created and pushed
