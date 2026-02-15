# 068. Universal Pre-commit Quality Gates

Date: 2026-02-14

## Status

Accepted

## Context

Code quality issues (TypeScript errors, lint failures, test failures) slip through to CI because there's no enforcement at commit time. When CI catches them, developers waste cycles fixing issues that should have been caught locally.

The user experienced this firsthand: a Vercel deployment failed due to pre-existing TypeScript errors in `bin/dev.ts` that weren't caught until CI ran.

We needed a solution that:
1. Works for any project type (TypeScript, Python, Go, Rust, etc.)
2. Catches issues before commit, not after
3. Has a single source of truth (no drift between local and CI)

## Decision

Create a `/pro:quality-gate` command that configures:

1. **GitHub Actions CI workflow** - The authoritative definition of "passing"
2. **Local git hooks (husky)** - Mirror CI checks for fast local feedback

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| CI is authoritative | CI workflow defines what "passing" means |
| Hooks mirror CI | Local hooks run the same commands as CI |
| Husky everywhere | Use husky for all project types (requires Node.js) |
| Project-aware | Auto-detect project type and apply appropriate checks |
| Non-invasive | Works with existing configs, doesn't override custom setups |

### Project Type Detection

| Indicator | Project Type | Build | Lint | Test |
|-----------|--------------|-------|------|------|
| `tsconfig.json` | TypeScript | `tsc --noEmit` | `npm run lint` | `npm test` |
| `package.json` | Node.js | `npm run build` | `npm run lint` | `npm test` |
| `pyproject.toml` | Python | `python -m py_compile` | `ruff check .` | `pytest` |
| `go.mod` | Go | `go build ./...` | `golangci-lint run` | `go test ./...` |
| `Cargo.toml` | Rust | `cargo check` | `cargo clippy` | `cargo test` |

### Hook Manager: Husky Everywhere

We chose husky for all project types because:
- Consistent developer experience
- Well-maintained and widely used
- Works with lint-staged for efficient incremental checks
- Single toolchain to understand

The tradeoff is requiring Node.js, but most projects already have it or can easily add it.

## Consequences

### Positive

- **No more CI surprises** - Issues caught before commit
- **Single source of truth** - CI defines checks, hooks mirror them
- **Language-agnostic** - Works for TypeScript, Python, Go, Rust
- **Fast feedback** - lint-staged only checks changed files

### Negative

- **Requires Node.js** - Even for Python/Go/Rust projects
- **Can be bypassed** - `--no-verify` still works (but CI catches it)
- **Initial setup** - Developers need to run `npm install` after clone

### Mitigations

- CI always runs as backstop
- Documentation explains the setup
- Command handles existing configs gracefully

## Alternatives Considered

### 1. Native per-language hooks

Use `pre-commit` (Python tool) for Python, shell scripts for Go/Rust.

Rejected because:
- Inconsistent DX across project types
- More complex to implement and maintain
- Users would need to learn multiple tools

### 2. CI-only enforcement

Let CI be the only quality gate.

Rejected because:
- Wastes CI resources on obviously bad commits
- Slower feedback loop (push → wait → fail → fix → push)
- Defeats the purpose of preventing the problem

### 3. Shell scripts without husky

Raw `.git/hooks/pre-commit` scripts.

Rejected because:
- Hooks aren't version-controlled by default
- No lint-staged for incremental checks
- Poor developer experience

## Related

- ADR-049: Code Quality Skill Architecture (runtime patterns)
- ADR-052: Branch-First Enforcement (precedent for invariant enforcement)
