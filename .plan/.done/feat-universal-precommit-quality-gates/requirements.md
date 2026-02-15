# Universal Pre-commit Quality Gates

## Problem Statement

Code quality issues (TypeScript errors, lint failures, test failures) slip through to CI because there's no local enforcement. This wastes developer cycles and blocks deployments.

## User Requirements

| Aspect | Decision |
|--------|----------|
| **Scope** | ccplugins only - a `/pro:quality-gate` command/skill |
| **Checks** | Project-specific: Build + Lint + Tests (auto-detected) |
| **Enforcement** | CI + local hooks in sync (CI is authoritative, hooks replicate locally) |

## Success Criteria

1. A developer runs `/pro:quality-gate` in any project
2. The command detects the project type (TypeScript, Python, Go, Rust, etc.)
3. It configures:
   - CI workflow (GitHub Actions) with appropriate checks
   - Local git hooks (husky + lint-staged) that mirror CI
4. Bad commits are blocked locally
5. If hooks are bypassed, CI catches and fails

## Key Design Principles

- **CI is authoritative**: The CI workflow defines what "passing" means
- **Hooks mirror CI**: Local hooks run the same checks as CI
- **Project-type detection**: Auto-detect language/framework and apply appropriate checks
- **Non-invasive**: Works with existing project configs, doesn't override custom setups
- **Escape hatch**: `--no-verify` still works (but CI catches violations)

## Project Types to Support

| Type | Build Check | Lint Check | Test Check |
|------|-------------|------------|------------|
| TypeScript/Node | `npm run build` or `tsc --noEmit` | `npm run lint` | `npm test` |
| Python | `python -m py_compile` | `ruff` or `flake8` | `pytest` |
| Go | `go build ./...` | `golangci-lint` | `go test ./...` |
| Rust | `cargo check` | `cargo clippy` | `cargo test` |
| Generic | Check for `build` script | Check for `lint` script | Check for `test` script |

## Implementation Approach

TBD - pending design discussion
