---
description: "Feature complete and tested? → Archives planning docs and analyzes commits → Creates a comprehensive pull request"
allowed-tools: ["Bash", "Read", "Write", "Glob", "Grep", "Edit", "AskUserQuestion"]
---

Clean up completed planning documentation, document architectural decisions, and create a pull request.

---

## Git & Remote Prerequisites

**Run these checks BEFORE proceeding to "Your Task".** Handle any failures using the guided workflows below.

### Step 1: Verify GitHub CLI Authentication

```bash
gh auth status
```

**If authenticated:** Continue to Step 2.

**If NOT authenticated:**

1. Inform user: "GitHub CLI is not authenticated. This is required to create PRs."
2. Use AskUserQuestion to offer:
   - Option 1: "Authenticate now with `gh auth login`" (Recommended)
   - Option 2: "Skip - I'll create the PR manually"
3. If Option 1: Run `gh auth login` and verify success before continuing.
4. If Option 2: Skip to "Manual PR Instructions" at the end of this file.

### Step 2: Check Git Repository Status

```bash
git rev-parse --git-dir 2>/dev/null
```

**If this returns `.git` or a path:** Continue to Step 3.

**If this fails (not a git repo):**

1. Inform user: "This directory is not a git repository."
2. Use AskUserQuestion to offer:
   - Option 1: "Initialize git and create GitHub repo" (Recommended)
   - Option 2: "Skip - I'll set up git manually"
3. If Option 1, run the following workflow:

```bash
# Initialize git
git init

# Create initial commit (if no commits exist)
git add .
git commit -m "Initial commit"

# Create GitHub repo (will prompt for name/visibility)
gh repo create --source=. --push
```

4. Verify remote was created: `git remote -v`
5. If successful, continue to "Your Task".

### Step 3: Check for Git Remote

```bash
git remote -v
```

**If remote exists (shows origin or other remote):** Continue to "Your Task".

**If NO remote configured:**

1. Inform user: "No git remote is configured."
2. Use AskUserQuestion to offer:
   - Option 1: "Create GitHub repo and push" (Recommended)
   - Option 2: "Skip - I'll add a remote manually"
3. If Option 1:

```bash
# Create repo on GitHub and add as remote
gh repo create --source=. --push
```

4. Verify: `git remote -v` should now show origin.
5. Continue to "Your Task".

---

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Your Task

1. Move planning documentation located under `.plan/{current-branch-name}` to `.plan/.done/`.
2. **Create Architecture Decision Records (ADRs)** - see ADR instructions below.
3. **Version check** - see Version Check instructions below.
4. Create and push a pull request.
5. Document any known issues that won't be addressed here:
   - Use `/pro:backlog.add <description>` to add items to the backlog
   - Set `source` to `/pro:pr` and `sourceBranch` to current branch

---

## ADR Instructions

Architecture Decision Records capture the "why" behind implementation choices for future reference.

### Step 1: Setup (if needed)

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

### Step 2: Check for existing ADRs

Read `.plan/adr-index.json` and check if an entry exists for the current branch.

- **If ADRs already exist for this branch and no new decisions were made:** Skip the entire ADR workflow (proceed to Step 3 of "Your Task" above).
- **If ADRs already exist but new architectural decisions were made:** Continue to Step 3 to add new ADRs.
- **If no ADRs exist for this branch:** Continue to Step 3.

### Step 3: Determine next ADR number

- Read `lastSequence` from `.plan/adr-index.json`
- Next number = lastSequence + 1

### Step 4: Extract decisions

Review the following to identify architectural decisions:
- `.plan/{branch-name}/` planning documents
- Git commit history: `git log main..HEAD`
- Code changes: `git diff main...HEAD`

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

---

## Version Check Instructions

Before creating the PR, verify that the project version has been updated.

### Step 1: Find the version file

Search the project root for the primary version file. Common locations include:
- Package manifests: `package.json`, `Cargo.toml`, `pyproject.toml`, `composer.json`, `mix.exs`
- Build configs: `pom.xml`, `build.gradle`, `*.csproj`
- Plugin metadata: `**/.claude-plugin/plugin.json`
- Dedicated version files: `VERSION`, `version.txt`, `lib/**/version.rb`

If no version file is found, skip version check.

### Step 2: Compare to base branch

```bash
# Get base branch version
git show main:{path/to/version-file} | # extract version

# Get current version
cat {path/to/version-file} | # extract version
```

Use the appropriate extraction method for the file format (JSON, TOML, XML, etc.).

### Step 3: Handle unchanged version

If version is unchanged:

1. **Warn the user:**
   > Version unchanged ({current_version}). Edit `{version_file}` to bump.

2. **Ask user to choose:**
   - Bump version now (recommended for `feat/*` and `fix/*` branches)
   - Proceed without bump (acceptable for `docs/*` branches)

3. If bumping, suggest increment based on branch prefix:
   - `feat/*` → minor (1.3.0 → 1.4.0)
   - `fix/*` → patch (1.3.0 → 1.3.1)
   - `docs/*` → typically none needed

### Step 4: Record version bump for tagging

If a version bump was applied (either in Step 3 or already changed from base):

1. **Get the new version** from the version file
2. **Write** `.plan/{branch-name}/version-bump.json`:

```json
{
  "version": "{new_version}",
  "confirmedAt": "{ISO 8601 timestamp}",
  "bumpType": "minor|patch|major"
}
```

This file is archived to `.plan/.done/` and used by `/pro:pr.merged` to automatically create and push the git tag after merge.

---

### Omit the following from the commit message:
- [ ] "Generated with" line
- [ ] "Co-Auth-By"

---

## Manual PR Instructions

If the user chose to skip automated setup, provide these manual steps:

```
Next Steps (Manual Setup Required):

1. Initialize git (if needed):
   git init
   git add .
   git commit -m "Initial commit"

2. Create a GitHub repository at https://github.com/new

3. Add the remote:
   git remote add origin <your-repo-url>

4. Push your branch:
   git push -u origin {current-branch-name}

5. Create the PR:
   gh pr create
   # or use the GitHub web UI
```

**Important:** After manual setup is complete, the user can re-run `/pro:pr` to continue with the full PR workflow.
