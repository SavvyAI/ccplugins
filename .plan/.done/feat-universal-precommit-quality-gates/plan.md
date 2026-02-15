# Implementation Plan: /pro:quality-gate

## Summary

Create a `/pro:quality-gate` command that configures pre-commit quality gates (CI + local hooks) for any project type.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | ccplugins command only | Fits existing command architecture |
| Checks | Build + Lint + Test | Comprehensive coverage |
| CI Authority | CI defines truth, hooks mirror | Single source of truth |
| Hook Manager | Husky everywhere | Consistent DX, even for non-Node projects |

## Files to Create

| File | Purpose |
|------|---------|
| `doc/decisions/068-universal-precommit-quality-gates.md` | ADR |
| `pro/commands/quality-gate.md` | Command definition |
| `pro/commands/_templates/quality-gate/ci-node.yml.hbs` | Node/TS CI workflow |
| `pro/commands/_templates/quality-gate/ci-python.yml.hbs` | Python CI workflow |
| `pro/commands/_templates/quality-gate/ci-go.yml.hbs` | Go CI workflow |
| `pro/commands/_templates/quality-gate/ci-rust.yml.hbs` | Rust CI workflow |
| `pro/commands/_templates/quality-gate/pre-commit.sh.hbs` | Pre-commit hook |

## Implementation Steps

### Step 1: Create ADR (068)
Document the architecture decision.

### Step 2: Create CI Templates
One template per project type with appropriate:
- Setup action (setup-node, setup-python, etc.)
- Dependency install command
- Build, lint, test commands

### Step 3: Create Pre-commit Hook Template
Single template that:
- Detects what checks are available
- Runs appropriate commands based on staged files
- Fails fast on first error

### Step 4: Create Command
Write `pro/commands/quality-gate.md` with:
1. Project type detection
2. Existing config detection
3. Interactive confirmation
4. Template processing
5. Husky installation
6. Summary report

### Step 5: Test
- Test on ccplugins (TypeScript)
- Test on a fresh project

## Command Flow

```
/pro:quality-gate

1. DETECT PROJECT TYPE
   tsconfig.json       → TypeScript
   pyproject.toml      → Python
   go.mod              → Go
   Cargo.toml          → Rust
   package.json        → Node.js
   (fallback)          → Generic

2. DETECT EXISTING CONFIG
   .github/workflows/  → Existing CI?
   .husky/             → Existing hooks?

3. INTERACTIVE SETUP
   Confirm project type
   Select checks (Build/Lint/Test)
   Handle existing config (merge/skip/overwrite)

4. GENERATE CI WORKFLOW
   → .github/workflows/ci.yml

5. CONFIGURE HUSKY
   npm install --save-dev husky lint-staged
   npx husky init
   → .husky/pre-commit (build/lint commands)

6. SUMMARY
   Show configured checks
   Next steps
```

## Definition of Done

- [x] ADR-068 written and reviewed
- [x] Command `pro/commands/quality-gate.md` created
- [x] CI templates created for all project types
- [x] Pre-commit hook template created
- [ ] Tested on ccplugins repository
- [ ] Pre-commit hook successfully blocks bad commits
