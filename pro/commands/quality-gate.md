---
description: "Ready to enforce quality? → Auto-detects project type, configures CI + pre-commit hooks → Never deploy broken code again"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

## Quality Gate

Configures pre-commit quality gates that prevent broken code from being committed.

**Principle**: CI is authoritative. Local hooks mirror CI for fast feedback.

---

## Step 1: Detect Project Type

Check for project type indicators:

```bash
# Check each indicator in order
[ -f "tsconfig.json" ]     # → TypeScript
[ -f "pyproject.toml" ]    # → Python
[ -f "setup.py" ]          # → Python
[ -f "go.mod" ]            # → Go
[ -f "Cargo.toml" ]        # → Rust
[ -f "package.json" ]      # → Node.js (if no tsconfig)
```

Set `projectType` based on first match:
- `typescript` - TypeScript/Node.js
- `python` - Python
- `go` - Go
- `rust` - Rust
- `node` - Node.js (no TypeScript)
- `generic` - Fallback

---

## Step 2: Detect Available Commands

### For Node.js/TypeScript projects

Read `package.json` and check for scripts:

| Script | Purpose | Default if missing |
|--------|---------|-------------------|
| `build` | Build check | `tsc --noEmit` (if TypeScript) |
| `lint` | Lint check | Skip |
| `test` | Test check | Skip |
| `typecheck` | Type check | Use instead of `build` if present |

### For Python projects

| Command | Purpose | Default |
|---------|---------|---------|
| `ruff check .` | Lint | Install ruff if missing |
| `pytest` | Test | Skip if no tests |
| `mypy .` | Type check | Skip if no mypy |

### For Go projects

Read `go.mod` for Go version.

| Command | Purpose |
|---------|---------|
| `go build ./...` | Build |
| `golangci-lint run` | Lint |
| `go test ./...` | Test |

### For Rust projects

| Command | Purpose |
|---------|---------|
| `cargo check` | Build |
| `cargo clippy -- -D warnings` | Lint |
| `cargo test` | Test |

---

## Step 3: Check Existing Configuration

```bash
# Check for existing CI
ls .github/workflows/*.yml 2>/dev/null

# Check for existing hooks
[ -d ".husky" ]

# Check for existing lint-staged
grep -q "lint-staged" package.json 2>/dev/null
```

If any exist, use AskUserQuestion:

```
Question: "Existing {config} detected. How should we proceed?"
Header: "Existing Config"
Options:
- Label: "Skip" / Description: "Keep existing configuration, don't modify"
- Label: "Merge" / Description: "Add quality checks alongside existing config"
- Label: "Replace" / Description: "Replace existing with new quality gate config"
```

---

## Step 4: Interactive Confirmation

Use AskUserQuestion to confirm:

```
Question 1: "Detected project type: {projectType}. Is this correct?"
Header: "Project Type"
Options:
- Label: "Yes, correct" / Description: "Proceed with {projectType} configuration"
- Label: "Wrong type" / Description: "I'll specify the correct project type"

Question 2: "Which quality checks should be enforced?"
Header: "Checks"
Options:
- Label: "All (Recommended)" / Description: "Build + Lint + Test"
- Label: "Build + Lint" / Description: "Skip tests (useful for projects without tests)"
- Label: "Build only" / Description: "Only verify the project compiles"
multiSelect: false
```

---

## Step 5: Generate CI Workflow

Create `.github/workflows/ci.yml` using appropriate template:

Template location: `pro/commands/_templates/quality-gate/`

| Project Type | Template |
|--------------|----------|
| TypeScript/Node | `ci-node.yml.hbs` |
| Python | `ci-python.yml.hbs` |
| Go | `ci-go.yml.hbs` |
| Rust | `ci-rust.yml.hbs` |

Process template with Handlebars, substituting:
- `{{buildCommand}}` - Detected build command
- `{{lintCommand}}` - Detected lint command
- `{{testCommand}}` - Detected test command
- `{{goVersion}}` - Go version from go.mod (Go only)

Ensure `.github/workflows/` directory exists:
```bash
mkdir -p .github/workflows
```

---

## Step 6: Configure Husky + lint-staged

### 6a: Install dependencies

For Node.js/TypeScript projects:
```bash
npm install --save-dev husky lint-staged tsc-files
```

For non-Node projects, initialize package.json first:
```bash
[ ! -f "package.json" ] && npm init -y
npm install --save-dev husky lint-staged
```

### 6b: Initialize husky

```bash
npx husky init
```

This creates:
- `.husky/` directory
- `.husky/pre-commit` hook

### 6c: Configure pre-commit hook

Write `.husky/pre-commit`:

```bash
#!/bin/sh
npx lint-staged
```

Make executable:
```bash
chmod +x .husky/pre-commit
```

### 6d: Configure lint-staged

Select appropriate lint-staged config based on project type:

| Project Type | Template |
|--------------|----------|
| TypeScript | `lintstaged-node.json` |
| Node | `lintstaged-node.json` |
| Python | `lintstaged-python.json` |
| Go | `lintstaged-go.json` |
| Rust | `lintstaged-rust.json` |

Copy template to `.lintstagedrc.json`:
```bash
cp pro/commands/_templates/quality-gate/lintstaged-{type}.json .lintstagedrc.json
```

Or add to `package.json` under `"lint-staged"` key.

---

## Step 7: Summary Report

Display configuration summary:

```markdown
## Quality Gates Configured

### CI Workflow
**File:** `.github/workflows/ci.yml`

| Check | Command | Status |
|-------|---------|--------|
| Build | {buildCommand} | ✓ Configured |
| Lint | {lintCommand} | ✓ Configured |
| Test | {testCommand} | ✓ Configured |

### Pre-commit Hooks
**File:** `.husky/pre-commit`

Checks run on staged files only (via lint-staged):
- TypeScript: `tsc-files --noEmit`
- ESLint: `eslint --fix`

### Next Steps

1. **Review CI workflow**: `.github/workflows/ci.yml`
2. **Test hooks locally**: Make a change and commit
3. **If hooks fail**: Fix issues before committing
4. **Bypass (emergency)**: `git commit --no-verify` (CI will still catch it)

### Troubleshooting

If pre-commit hook isn't running:
```bash
npx husky install
chmod +x .husky/pre-commit
```

To skip hooks temporarily:
```bash
git commit --no-verify -m "message"
```
Note: CI will still run checks on push.
```

---

## Edge Cases

### Monorepo Detection

If root has `workspaces` in `package.json` or `pnpm-workspace.yaml`:
- Warn user about monorepo complexity
- Suggest configuring per-package or root-level

### No Test Script

If no test command detected:
- Skip test check in CI
- Note in summary: "No test script detected. Add `npm test` or `pytest` for test coverage."

### Existing CI with Different Name

If `.github/workflows/` contains `build.yml`, `test.yml`, etc.:
- Ask if user wants to consolidate into `ci.yml`
- Or add quality checks to existing workflow

---

## Template Processing

Use Node.js inline replacement if Handlebars not available:

```javascript
const content = fs.readFileSync(templatePath, 'utf-8');
const result = content
  .replace(/\{\{buildCommand\}\}/g, buildCommand)
  .replace(/\{\{lintCommand\}\}/g, lintCommand)
  .replace(/\{\{testCommand\}\}/g, testCommand)
  .replace(/\{\{goVersion\}\}/g, goVersion || '1.22');
fs.writeFileSync(outputPath, result);
```

Or use bash `sed`:
```bash
sed -e "s/{{buildCommand}}/$BUILD_CMD/g" \
    -e "s/{{lintCommand}}/$LINT_CMD/g" \
    -e "s/{{testCommand}}/$TEST_CMD/g" \
    template.yml.hbs > .github/workflows/ci.yml
```
