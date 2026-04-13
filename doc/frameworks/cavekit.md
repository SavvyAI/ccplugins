# Cavekit Analysis

> Evaluation of [JuliusBrussee/cavekit](https://github.com/JuliusBrussee/cavekit) against ccplugins.
> Date: 2026-04-13

## Overview

| Property | Value |
|----------|-------|
| Repository | github.com/JuliusBrussee/cavekit |
| Stars | 353 |
| First Commit | 2026-03-15 (ccplugins: 2025-10-26) |
| License | MIT |
| Languages | Go, Shell, TypeScript |
| Philosophy | Specification-driven development with parallel execution and adversarial review |

**Summary:** Cavekit is a specification-first framework where "kits" (structured requirements with acceptance criteria) drive the entire development process. Code is derived from specs, not the other way around. It features parallel task execution via tmux/worktrees and dual-model adversarial review (Codex challenges Claude).

## Architecture

```
cavekit/
├── agents/                    # 9 specialized agents
│   ├── architect.md
│   ├── builder.md
│   ├── cavekit-reviewer.md
│   ├── convergence-monitor.md
│   ├── design-reviewer.md
│   ├── drafter.md
│   ├── inspector.md
│   ├── surveyor.md
│   └── task-builder.md
├── commands/                  # 14 commands (+ aliases)
│   ├── check.md              # Gap analysis + peer review
│   ├── config.md             # Execution model presets
│   ├── design.md             # DESIGN.md management
│   ├── help.md
│   ├── init.md               # Bootstrap context hierarchy
│   ├── judge.md              # On-demand Codex review
│   ├── make.md               # Parallel build execution
│   ├── map.md                # Generate build site from kits
│   ├── progress.md           # Task progress dashboard
│   ├── quick.md              # End-to-end: draft→build→inspect
│   ├── research.md           # Multi-agent research
│   ├── revise.md             # Trace fixes back to kits
│   ├── scan.md               # Built vs intended comparison
│   └── sketch.md             # Write kits from requirements
├── skills/                    # 16 skills
│   ├── brownfield-adoption/
│   ├── cavekit-writing/
│   ├── caveman/
│   ├── context-architecture/
│   ├── convergence-monitoring/
│   ├── design-system/
│   ├── documentation-inversion/
│   ├── impl-tracking/
│   ├── methodology/
│   ├── peer-review/
│   ├── peer-review-loop/
│   ├── prompt-pipeline/
│   ├── revision/
│   ├── speculative-pipeline/
│   ├── ui-craft/
│   └── validation-first/
├── context/                   # Project context files
│   ├── impl/                 # Implementation tracking
│   ├── kits/                 # Kit definitions
│   └── plans/                # Build plans
├── internal/                  # Go implementation
│   ├── exec/                 # Executor
│   ├── session/              # Session management
│   ├── site/                 # Build site logic
│   ├── tmux/                 # Terminal multiplexer
│   ├── tui/                  # Terminal UI (Bubble Tea)
│   └── worktree/             # Git worktree management
├── references/                # Reference documentation
├── scripts/                   # Shell scripts + visual companion
└── cmd/cavekit/main.go       # CLI entry point
```

---

## Capability-by-Capability Analysis

### 1. Specification-First Development ("Kits")

**What it does:** Structured requirements with numbered requirements (R1, R2...) and testable acceptance criteria. All code traces back to kits.

**ccplugins equivalent:** `/pro:spec.import` ingests PRDs but doesn't enforce the same traceability. Plan files in `.plan/` are similar but less formal.

**Value:** High - enforces discipline that prevents "prompt and pray" failures.

---

### 2. Parallel Task Execution

**What it does:** Groups independent tasks into "waves" and dispatches them as parallel subagents using tmux sessions and git worktrees.

**ccplugins equivalent:** None. ccplugins uses sequential single-agent execution. We have a backlog item (#109) for git worktrees skill.

**Value:** High - massive speed improvement for independent tasks.

---

### 3. Dual-Model Adversarial Review (Codex)

**What it does:** Uses OpenAI Codex to challenge Claude's design decisions and code output. Catches blind spots that Claude cannot see in its own work.

**ccplugins equivalent:** None. `/pro:audit.quality` does code review but same-model, not adversarial. No cross-model review.

**Value:** Medium-High - interesting approach but requires Codex dependency.

---

### 4. Build Site / Dependency Graph

**What it does:** `/ck:map` generates a tiered task dependency graph. Tier 0 has no deps, Tier 1 depends on Tier 0, etc. Enables parallel execution.

**ccplugins equivalent:** None. Our backlog is flat, not tiered. Task dependencies exist in the task tools but not exploited for parallelism.

**Value:** Medium - useful for large projects.

---

### 5. Validation Gates (6-Phase)

**What it does:** Compilation → Unit tests → Integration → Acceptance criteria → Lint → Security. Every implementation must pass all gates.

**ccplugins equivalent:** `/pro:audit.quality` and `/pro:audit.security` cover similar ground but aren't integrated into build loop.

**Value:** Medium - we have the pieces but not the orchestration.

---

### 6. Research Phase

**What it does:** `/ck:research` dispatches 2-8 parallel subagents to explore codebase + web for best practices before designing.

**ccplugins equivalent:** None directly. `/pro:spike` is exploratory but not multi-agent research.

**Value:** Medium - grounding in evidence before designing is valuable.

---

### 7. Design System Management

**What it does:** `/ck:design` creates/imports DESIGN.md as cross-cutting constraint. All UI implementations audited against it.

**ccplugins equivalent:** `/pro:frontend-design` skill has design principles but no DESIGN.md extraction or audit.

**Value:** Low-Medium - niche, primarily UI-focused projects.

---

### 8. Progress Dashboard

**What it does:** `/ck:progress` shows tasks done, in progress, blocked, remaining.

**ccplugins equivalent:** `/pro:roadmap` shows backlog status but less granular. No real-time build progress.

**Value:** Low - we have similar via roadmap.

---

### 9. Brownfield Adoption

**What it does:** Layer kits on existing codebase without rewrite. Reverse-engineer specs from code.

**ccplugins equivalent:** None. We don't have a "spec from code" extraction.

**Value:** Medium - useful for adopting methodology on existing projects.

---

### 10. Revision Tracking

**What it does:** `/ck:revise` traces manual code fixes back into kits and context files.

**ccplugins equivalent:** None. We don't track fixes back to specs.

**Value:** Low-Medium - maintains spec-code alignment.

---

### 11. Go CLI + TUI

**What it does:** Native Go binary with Bubble Tea TUI for session management, progress, diffs.

**ccplugins equivalent:** None. ccplugins is pure prompt-based, no native CLI.

**Value:** Medium - nice UX but significant implementation effort.

---

## Comparison Matrix

```
Legend: ✓ FULL  ◐ PARTIAL  ✗ MISSING

CAPABILITY                              CAVEKIT   CCPLUGINS   NOTES
─────────────────────────────────────────────────────────────────────────────
Specification/Planning
  Specification-first (kits)                ✓         ◐       /pro:spec.import + .plan/ files
  Numbered requirements (R1, R2...)         ✓         ✗       No formal requirement numbering
  Acceptance criteria tracking              ✓         ◐       Definition of Done exists
  Build site / dependency graph             ✓         ✗       MISSING - flat backlog only

Execution
  Parallel task execution                   ✓         ✗       MISSING - sequential only
  Tmux session management                   ✓         ✗       MISSING - no terminal multiplexer
  Git worktree isolation                    ✓         ◐       Mentioned in /pro:spike, backlog #109

Quality/Review
  Dual-model adversarial review             ✓         ✗       MISSING - same-model only
  6-phase validation gates                  ✓         ◐       /pro:audit covers pieces
  Peer review patterns                      ✓         ◐       /pro:audit.quality does review
  Gap analysis (built vs spec)              ✓         ◐       /pro:audit.quality partial

Research/Design
  Multi-agent research                      ✓         ✗       MISSING
  Design system management                  ✓         ◐       /pro:frontend-design skill
  Brownfield adoption                       ✓         ✗       MISSING

Utilities
  Progress dashboard                        ✓         ◐       /pro:roadmap similar
  Revision tracking                         ✓         ✗       MISSING
  Quick end-to-end mode                     ✓         ◐       /pro:feature does planning+impl
  Native CLI + TUI                          ✓         ✗       ccplugins is prompt-only
─────────────────────────────────────────────────────────────────────────────

CCPLUGINS EXCLUSIVE CAPABILITIES (NOT IN CAVEKIT)
─────────────────────────────────────────────────────────────────────────────
  Backlog system (fingerprint dedup)        ✗         ✓       Unique to ccplugins
  ADR framework                             ✗         ✓       doc/decisions/
  Security audit (CVE, OWASP, secrets)      ✗         ✓       /pro:audit.security
  Build-in-public automation                ✗         ✓       /pro:bip
  Product validation pipeline               ✗         ✓       /pro:product.validate
  Bounty hunting automation                 ✗         ✓       /pro:bounty.scout/hunter
  MCP server integrations                   ✗         ✓       Figma, Notion, Playwright, etc.
  PR lifecycle automation                   ✗         ✓       /pro:pr, /pro:pr.merged
  Social sharing (OG images)                ✗         ✓       /pro:og, /pro:social
  Version bump + tagging                    ✗         ✓       Automated in /pro:pr flow
```

---

## Recommendations

### High Priority (Worth Porting)

#### 1. Parallel Task Execution Pattern
**Value:** High - enables significant speedup for independent tasks
**Effort:** High - requires tmux/worktree orchestration
**Design Decision:** Whether to build as skill vs native tooling. Could leverage existing Task tool for spawning parallel agents.

#### 2. Tiered Build Site / Dependency Graph
**Value:** Medium-High - enables parallel execution and better planning
**Effort:** Medium - requires backlog enhancement with dependency fields
**Design Decision:** Integrate into existing backlog or separate "build site" concept

### Medium Priority (Consider)

#### 3. Specification Formalization
**Value:** Medium - numbered requirements with acceptance criteria
**Effort:** Low - enhance /pro:spec.import output format
**Design Decision:** Add R-numbered requirements to spec parsing

#### 4. Multi-Agent Research Phase
**Value:** Medium - grounding before design
**Effort:** Medium - leverage existing Task tool for parallel exploration
**Design Decision:** New `/pro:research` command or enhance `/pro:spike`

#### 5. Brownfield Adoption Pattern
**Value:** Medium - extract specs from existing code
**Effort:** Medium - new command or skill
**Design Decision:** `/pro:spec.extract` command

### Low Priority (Skip)

#### 6. Dual-Model Adversarial Review
**Reason:** Requires external Codex dependency. Same-model review with different prompts may suffice.

#### 7. Native Go CLI + TUI
**Reason:** Significant implementation effort, ccplugins philosophy is prompt-first. Would fragment tooling.

#### 8. Revision Tracking
**Reason:** Nice-to-have but low impact. Manual fixes rarely need spec tracing.

---

## Suggested ADRs

- **ADR-XXX: Parallel Task Execution Architecture** - Design for tmux/worktree-based parallel agent dispatch
- **ADR-XXX: Tiered Backlog with Dependencies** - Add dependency fields to backlog items for build ordering

## Suggested Backlog Items

- **Add parallel task execution pattern** - Port cavekit's wave-based parallel dispatch using tmux and worktrees. Source: cavekit/make.md
- **Enhance backlog with task dependencies** - Add `dependsOn` field to backlog items, enable tiered execution. Source: cavekit build site concept
- **Add /pro:spec.extract for brownfield adoption** - Reverse-engineer specs from existing codebase. Source: cavekit brownfield-adoption skill

---

## Key Philosophical Differences

| Aspect | Cavekit | ccplugins |
|--------|---------|-----------|
| **Focus** | Specification-driven, code is derivative | Workflow-driven, planning is advisory |
| **Execution** | Parallel via tmux/worktrees | Sequential single-agent |
| **Quality** | Cross-model adversarial review | Same-model review |
| **Tooling** | Native Go CLI + TUI | Pure prompt-based |
| **Traceability** | Every line traces to R-numbered requirement | Loose connection via plan files |

Cavekit is more opinionated and heavyweight, while ccplugins is lighter and more flexible. The parallel execution and tiered dependencies are the most valuable portable patterns.
