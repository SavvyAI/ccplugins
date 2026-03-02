---
description: "PR successfully merged? → Cleans up planning artifacts and branches → Completes the development cycle"
allowed-tools: ["Bash", "Read", "Write", "Glob", "Grep", "Edit"]
---

The pull request: $ARGUMENTS was successfully merged and closed.

## Your Task

1. **Check for ADRs** - If ADRs were NOT created during `/pro:pr`, create them now (see ADR instructions below).
2. Switch to the main branch.
3. Pull latest changes.
4. **Create version tag** - If version bump was recorded, create and push the git tag (see Tagging instructions below).
5. **Mark backlog item resolved** - Invoke the `backlog-resolve` skill (see Backlog Status Update below).
6. Delete the merged feature branch (local and remote).
7. Clear the conversation.

---

## ADR Instructions (if not already created)

Architecture Decision Records capture the "why" behind implementation choices for future reference.

### Step 1: Check if ADRs already exist

Read `.plan/adr-index.json` and check if an entry exists for the merged branch. If ADRs already exist for this branch, skip to cleanup.

### Step 2: Setup (if needed)

Create directory and files if they don't exist:

1. Create `doc/decisions/` directory
2. Create `doc/decisions/README.md`:

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions.

## What is an ADR?

An ADR captures the context, decision, and consequences of an architecturally significant choice.

## Format

We use the [Michael Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Naming Convention

- Filename: `NNN-kebab-case-title.md` (e.g., `001-use-localStorage-for-tracking.md`)
- NNN = zero-padded sequence number (001, 002, 003...)
- Title in heading must match: `# NNN. Title` (e.g., `# 001. Use localStorage for Tracking`)

## Index

<!-- New ADRs added below -->
```

3. Create `.plan/adr-index.json` (if not exists):

```json
{
  "lastSequence": 0,
  "entries": []
}
```

### Step 3: Determine next ADR number

- Read `lastSequence` from `.plan/adr-index.json`
- Next number = lastSequence + 1

### Step 4: Extract decisions

Review the following to identify architectural decisions:
- `.plan/.done/{branch-name}/` archived planning documents
- Recent commits on main from the merged PR

Look for decisions about:
- Technology/library choices
- Data storage approaches
- API design patterns
- Architecture patterns
- Trade-offs made
- Rejected alternatives

### Step 5: Create ADRs

For each decision, create `doc/decisions/{NNN}-{kebab-case-title}.md`:

```markdown
# {NNN}. {Title}

Date: {YYYY-MM-DD}

## Status

Accepted

## Context

{What problem or situation prompted this decision?}

## Decision

{What did we decide to do?}

## Consequences

{What are the positive and negative outcomes?}

## Alternatives Considered

{What options were evaluated? Why rejected?}

## Related

- Planning: `.plan/.done/{branch-name}/`
```

### Step 6: Update tracking files

1. Update `.plan/adr-index.json`:
   - Set `lastSequence` to highest ADR number created
   - Add entry: `{"branch": "{branch-name}", "adrs": ["NNN-title.md", ...]}`

2. Update `doc/decisions/README.md` index with links to new ADRs

3. Add "Related ADRs" section to `.plan/.done/{branch-name}/plan.md`

### Step 7: Commit and push ADRs

```bash
git add doc/decisions/ .plan/adr-index.json .plan/.done/
git commit -m "Add ADRs for {feature-name}"
git push origin main
```

---

## Tagging Instructions

If a version bump was recorded during `/pro:pr`, create and push the git tag.

### Step 1: Check for version bump file

Look for `.plan/.done/{merged-branch-name}/version-bump.json`.

- **If file does not exist:** Skip tagging (no version bump was recorded).
- **If file exists:** Continue to Step 2.

### Step 2: Determine tag format

Check existing tags to match the project's convention:

```bash
git tag --list | head -5
```

- If existing tags use `v` prefix (e.g., `v1.0.0`) → use `v{version}`
- If existing tags have no prefix (e.g., `1.0.0`) → use `{version}`
- If no tags exist → default to `v{version}`

### Step 3: Check if tag already exists

```bash
git tag --list {tag}
```

- **If tag exists:** Warn the user and skip:
  > "Tag {tag} already exists. Skipping tag creation."
- **If tag does not exist:** Continue to Step 4.

### Step 4: Create and push the tag

```bash
git tag {tag}
git push origin {tag}
```

Report success:
> "Tagged and pushed {tag}"

---

## Backlog Status Update

After a PR is merged, the corresponding backlog item must be marked as resolved.

**Invoke the `backlog-resolve` skill** with the merged branch name. The skill will:
1. Find the matching backlog item by `sourceBranch`
2. Update `status` to `"resolved"` with `resolvedAt` timestamp
3. Commit the change

If no matching backlog item exists (work started manually), this is not an error.

---

## Cleanup Commands

```bash
git fetch origin main && git checkout main && git pull origin main
git branch -d {merged-branch-name}
git push origin --delete {merged-branch-name}
```
