# Design: /pro:quality-gate Command

## Overview

A command that configures pre-commit quality gates for any project type.

## Architecture

```
/pro:quality-gate
    │
    ├── Detect project type (TypeScript, Python, Go, Rust, etc.)
    │
    ├── Generate GitHub Actions CI workflow
    │   └── .github/workflows/ci.yml
    │
    ├── Configure local git hooks (husky + lint-staged)
    │   ├── .husky/pre-commit
    │   └── .lintstagedrc.json
    │
    └── Report configuration summary
```

## Project Type Detection

| Indicator | Project Type | Build | Lint | Test |
|-----------|--------------|-------|------|------|
| `tsconfig.json` | TypeScript | `tsc --noEmit` or `npm run build` | `npm run lint` | `npm test` |
| `package.json` (no ts) | JavaScript/Node | `npm run build` | `npm run lint` | `npm test` |
| `pyproject.toml` or `setup.py` | Python | `python -m py_compile **/*.py` | `ruff check .` | `pytest` |
| `go.mod` | Go | `go build ./...` | `golangci-lint run` | `go test ./...` |
| `Cargo.toml` | Rust | `cargo check` | `cargo clippy` | `cargo test` |
| `build.sbt` or `build.sc` | Scala | `sbt compile` | `sbt scalafmtCheck` | `sbt test` |
| None | Generic | Check for `build` script | Check for `lint` script | Check for `test` script |

## Configuration Principle: CI is Authoritative

1. **CI workflow** defines the canonical checks
2. **Local hooks** run a subset of CI checks (fast feedback)
3. **Both use the same commands** - no drift

## Implementation Steps

### Step 1: Detect Project Type

Read project files to determine:
- Primary language/framework
- Existing scripts in `package.json` or equivalent
- Existing CI configuration (to avoid conflicts)

### Step 2: Check for Existing Configuration

- If `.github/workflows/ci.yml` exists → ask to merge or skip
- If `.husky/` exists → ask to extend or skip
- If `lint-staged` config exists → ask to extend or skip

### Step 3: Configure CI Workflow

Generate `.github/workflows/ci.yml` with:
- Checkout
- Language-specific setup (setup-node, setup-python, setup-go, etc.)
- Install dependencies
- Build check
- Lint check
- Test check

### Step 4: Configure Local Hooks

Install husky + lint-staged:
```bash
npm install --save-dev husky lint-staged  # or use npx for non-Node projects
npx husky init
```

Configure `.lintstagedrc.json` or `lint-staged` in package.json:
```json
{
  "*.ts": ["tsc-files --noEmit", "eslint --fix"],
  "*.tsx": ["tsc-files --noEmit", "eslint --fix"],
  "*.py": ["ruff check", "ruff format"]
}
```

### Step 5: Summary Report

```
## Quality Gates Configured

### CI Workflow
File: .github/workflows/ci.yml
Checks:
  ✓ Build: npm run build
  ✓ Lint: npm run lint
  ✓ Test: npm test

### Local Hooks (pre-commit)
File: .husky/pre-commit
Checks:
  ✓ TypeScript: tsc-files --noEmit
  ✓ ESLint: eslint --fix

### Next Steps
1. Review .github/workflows/ci.yml
2. Run `npm test` to verify tests pass
3. Make a commit to test the hooks
```

## File Templates

### templates/ci.yml.hbs

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      {{#if nodeProject}}
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      {{/if}}

      {{#if pythonProject}}
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - run: pip install -e ".[dev]"
      {{/if}}

      {{#if goProject}}
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      {{/if}}

      - name: Build
        run: {{buildCommand}}

      - name: Lint
        run: {{lintCommand}}

      - name: Test
        run: {{testCommand}}
```

## Edge Cases

1. **Monorepo** - Detect workspace config, configure per-package
2. **No test script** - Skip test check, warn user
3. **Custom scripts** - Prefer existing scripts over defaults
4. **Existing CI** - Offer merge or skip, don't overwrite

## Dependencies

For Node.js projects:
- `husky` - Git hooks management
- `lint-staged` - Run linters on staged files
- `tsc-files` - Type-check only changed files (performance)

For non-Node projects:
- Use `pre-commit` Python package (`.pre-commit-config.yaml`)
- Or shell-based hooks directly in `.husky/pre-commit`

## Non-Goals

- IDE integration (VS Code, etc.)
- Editor config (`.editorconfig`)
- Code formatting (that's the linter's job)
- Dependency security scanning (that's `/pro:audit.security`)
