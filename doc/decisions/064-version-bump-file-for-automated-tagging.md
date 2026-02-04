# 064. Version Bump File for Automated Tagging

Date: 2026-02-03

## Status

Accepted

## Context

When `/pro:pr` determines a version bump is needed and the user confirms it, the workflow ends with a manual reminder to tag after merge. This breaks the automation flow and is easy to forget.

The challenge: how to pass information from `/pro:pr` (run before merge) to `/pro:pr.merged` (run after merge) so that tagging can be automated.

## Decision

Use `.plan/{branch}/version-bump.json` as a persistence mechanism for version bump decisions:

1. **In `/pro:pr`**: When user confirms a version bump, write:
   ```json
   {
     "version": "0.2.0",
     "confirmedAt": "2026-02-03T00:00:00Z",
     "bumpType": "minor"
   }
   ```

2. **In `/pro:pr.merged`**: After pulling main, check `.plan/.done/{branch}/version-bump.json`. If found:
   - Determine tag format by matching existing tags (default: v-prefix)
   - Skip with warning if tag already exists
   - Create and push the git tag

This leverages the existing `.plan/{branch}` → `.plan/.done/{branch}` archive pattern.

### Tag Format Detection

Rather than hardcode a tag format, we match the project's existing convention:
- If existing tags use `v` prefix → use `v{version}`
- If no prefix → use `{version}`
- If no tags exist → default to `v{version}`

This follows ADR-005's principle of runtime inference over hardcoded rules.

## Consequences

### Positive

- Fully automated release tagging after merge
- Version decision is captured with PR, applied after merge
- No manual steps to forget
- Uses existing `.plan/` infrastructure (no new patterns)
- Tag format adapts to project conventions

### Negative

- Requires both commands to follow the pattern (coupling)
- If user runs `git tag` manually, the automation will skip with warning (not fail)

### Neutral

- File is archived to `.plan/.done/` like other planning artifacts
- Extends ADR-005's version checking (not a new concept)

## Alternatives Considered

1. **Commit message parsing** - Parse version from commit messages. Rejected: fragile and requires specific commit message format.

2. **GitHub release workflow** - Trigger release on merge. Rejected: adds external dependency and complexity.

3. **Manual tagging reminder only** - Keep the current behavior. Rejected: too easy to forget.

## Related

- ADR-005: Runtime Inference for Version Check
- Planning: `.plan/.done/feat-automate-version-tagging-pr-merged/`
