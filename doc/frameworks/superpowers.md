# Superpowers Framework Analysis

> Evaluation of [obra/superpowers](https://github.com/obra/superpowers) for porting to ccplugins.
> Date: 2026-03-17

## Overview

| Property | Value |
|----------|-------|
| Repository | github.com/obra/superpowers |
| Stars | 89k+ |
| First Commit | January 2025 |
| License | MIT |
| Languages | Shell (55%), JavaScript (32%), HTML (5%), Python (4%), TypeScript (3%) |
| Philosophy | Design-first, TDD, systematic processes over ad-hoc |

## Architecture

```
superpowers/
├── skills/                    # 14 auto-invoked capabilities
│   ├── brainstorming/
│   ├── test-driven-development/
│   ├── writing-plans/
│   ├── executing-plans/
│   ├── using-git-worktrees/
│   ├── subagent-driven-development/
│   ├── dispatching-parallel-agents/
│   ├── systematic-debugging/
│   ├── requesting-code-review/
│   ├── receiving-code-review/
│   ├── finishing-a-development-branch/
│   ├── verification-before-completion/
│   ├── using-superpowers/
│   └── writing-skills/
├── commands/                  # 3 user-invoked entry points
│   ├── brainstorm.md
│   ├── write-plan.md
│   └── execute-plan.md
├── agents/                    # 1 subagent
│   └── code-reviewer.md
└── docs/                      # Platform-specific setup
```

---

## Skill-by-Skill Analysis

### 1. Brainstorming

**Purpose:** Transform ideas into designs through Socratic dialogue before implementation.

**Hard Gate:** "Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it."

**Process:**
1. Explore project context (files, docs, commits)
2. Offer visual companion (browser mockups if needed)
3. Ask clarifying questions (one per message, prefer multiple-choice)
4. Propose 2-3 approaches with trade-offs + recommendation
5. Present design in sections (scaled to complexity), get approval per section
6. Write design doc to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
7. Dispatch spec-reviewer subagent (max 3 iterations)
8. User reviews written spec
9. Invoke writing-plans skill ONLY

**Key Insight:** "Simple projects are where unexamined assumptions cause the most wasted work."

---

### 2. Test-Driven Development (TDD)

**Core Rule:** "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"

**Iron Law:** If code exists before tests, delete it completely. Don't keep as reference. Don't adapt it. Delete means delete.

**RED-GREEN-REFACTOR Cycle:**

| Phase | Action | Verification |
|-------|--------|--------------|
| RED | Write one minimal failing test | Run test, confirm expected failure |
| GREEN | Write minimal code to pass | Run test, confirm pass + no regressions |
| REFACTOR | Clean up (remove duplication, improve names) | All tests still pass |

**Common Rationalizations (All Rejected):**

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Tests take 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. |
| "TDD will slow me down" | TDD faster than debugging. |

**Red Flags (Start Over If You Catch Yourself):**
- Writing code before tests
- Tests that pass immediately
- "Just this once"
- Keeping code "as reference"
- "I'm being pragmatic"

---

### 3. Writing Plans

**Purpose:** Create implementation plans with 2-5 minute tasks for engineers unfamiliar with codebase.

**Process:**
1. Announce skill usage and scope-check specification
2. Map file structure, decompose into bite-sized tasks
3. Save to `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
4. Dispatch plan-reviewer subagent (max 3 iterations)
5. Hand off to subagent-driven-development or executing-plans

**Principles:**
- DRY, YAGNI, TDD
- Each task = one action (write test, verify fail, implement, verify pass, commit)
- Include exact file paths, full code snippets, precise commands with expected output

---

### 4. Git Worktrees

**Purpose:** Isolated workspace setup before implementation.

**Principle:** "Systematic directory selection + safety verification = reliable isolation."

**Directory Priority:**
1. Check for existing `.worktrees/` or `worktrees/`
2. Check CLAUDE.md for preference
3. Ask user: project-local vs global (`~/.config/superpowers/worktrees/<project>/`)

**Safety Verification:**
- Project-local directories MUST be git-ignored
- If not ignored: add to .gitignore, commit, then proceed

**Creation Workflow:**
1. Detect project name
2. Create worktree with new branch: `git worktree add "$path" -b "$BRANCH_NAME"`
3. Auto-detect and install dependencies (npm/cargo/pip/poetry/go)
4. Run baseline tests
5. Report location and test status

---

### 5. Subagent-Driven Development

**Purpose:** Execute plans via fresh subagents per task with two-stage review.

**Core:** "Fresh subagent per task + two-stage review (spec then quality)"

**Per-Task Flow:**
1. Dispatch implementer subagent
2. Address questions if needed
3. Implementer executes: implement, test, commit, self-review
4. Dispatch spec reviewer (confirm code matches specification)
5. Fix issues if any, reviewer re-checks
6. Dispatch code quality reviewer
7. Fix issues if any, reviewer re-checks
8. Mark task complete

**Model Selection:**
- Mechanical tasks (1-2 files, clear spec) → cheap model
- Integration tasks (multi-file) → standard model
- Architecture/design/review → most capable model

**Red Flags:**
- Never start on main/master without consent
- Never skip either review stage
- Never proceed with unfixed issues
- Never dispatch multiple implementation subagents simultaneously

---

### 6. Dispatching Parallel Agents

**Purpose:** Concurrent investigation of independent problems.

**When to Use:**
- Multiple unrelated failures
- Each problem stands alone
- No shared state between investigations

**Process:**
1. Identify independent domains
2. Create focused, self-contained prompts per agent
3. Dispatch all simultaneously
4. Integrate results, verify no conflicts, run comprehensive tests

---

### 7. Systematic Debugging

**Core Rule:** "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"

**Four Phases:**

| Phase | Action |
|-------|--------|
| 1. Root Cause Investigation | Read errors, reproduce issue, examine recent changes, trace data flow |
| 2. Pattern Analysis | Compare broken vs working code, understand dependencies |
| 3. Hypothesis & Testing | Form specific hypothesis, test with minimal changes (one variable at a time) |
| 4. Implementation | Failing test first, single targeted fix, verify success |

**Red Flags:** "Just a quick fix", "I'll probably try X", "I don't fully understand but...", "One more fix attempt" (after 2+ failures)

**Critical:** If 3+ fixes fail, stop and question whether architecture is fundamentally flawed.

---

### 8. Code Review (Requesting)

**Mandatory Triggers:**
- Each task completion in subagent-driven development
- After major features
- Before merging to main

**Feedback Handling:**
- Critical issues → fix immediately
- Important issues → fix before proceeding
- Suggestions → note for later
- If disagreeing → provide technical evidence

---

### 9. Code Review (Receiving)

**Core Principle:** "Verify before implementing. Ask before assuming. Technical correctness over social comfort."

**Forbidden:** Performative language ("You're absolutely right!", "Great point!")

**Response Pattern:**
1. Read feedback completely without reacting
2. Understand by restating requirements
3. Verify against actual codebase
4. Evaluate technical soundness
5. Respond with acknowledgment or reasoning

**External Reviewer Checklist:**
- Verify appropriateness for YOUR codebase
- Check if existing functionality could break
- Understand original implementation reasoning
- Apply healthy skepticism

---

### 10. Code Reviewer Agent

**Role:** Senior Code Reviewer focused on architecture, design patterns, best practices.

**Review Functions:**
1. Plan alignment analysis
2. Code quality assessment (patterns, error handling, types, tests, security)
3. Architecture review (SOLID, separation of concerns, scalability)
4. Documentation standards

**Severity Levels:**
- Critical → must fix
- Important → should fix
- Suggestions → optional

---

### 11. Verification Before Completion

**Core Rule:** "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE"

**Five-Step Gate:**
1. IDENTIFY the command that proves your claim
2. RUN the complete command freshly
3. READ full output and exit codes
4. VERIFY output confirms the claim
5. ONLY THEN make the claim with evidence

**What Doesn't Count:**
- Previous test runs
- Assumptions ("should pass")
- Partial checks
- Agent success reports without independent verification
- Confidence without evidence

---

### 12. Finishing a Development Branch

**Process:**
1. Verify tests pass
2. Determine base branch
3. Present exactly 4 options:
   - Merge locally
   - Push and create PR
   - Keep branch as-is
   - Discard work
4. Execute chosen option
5. Cleanup worktree (for merge/discard only)

**Critical:** Require typed "discard" confirmation before force-deleting.

---

## Comparison Matrix: Superpowers vs ccplugins

```
Legend: ✓ FULL  ◐ PARTIAL  ✗ MISSING

CAPABILITY                              SUPERPOWERS   CCPLUGINS    NOTES
─────────────────────────────────────────────────────────────────────────────
Design/Planning Phase
  Brainstorming (Socratic)                  ✓            ◐        ccplugins has /pro:feature planning
  Design doc generation                     ✓            ◐        ccplugins uses .plan/ directory
  Spec review loop                          ✓            ✗        No automated spec review

Implementation Phase
  TDD enforcement                           ✓            ✗        MISSING - No TDD command/skill
  Writing plans (micro-tasks)               ✓            ◐        ccplugins plans lack 2-5 min granularity
  Git worktrees                             ✓            ✗        MISSING - Brief mention only
  Subagent-driven development               ✓            ✗        Different architecture
  Parallel agent dispatch                   ✓            ✗        Different architecture

Quality Assurance
  Systematic debugging (4-phase)            ✓            ◐        /pro:bug has investigation, not 4-phase
  Code review (severity-based)              ✓            ◐        /pro:audit has severity, PR review doesn't
  Verification before completion            ✓            ◐        /pro:quality-gate + DOD checklists
  Two-stage review (spec + quality)         ✓            ✗        Single-stage review only

Branch Lifecycle
  Branch finishing workflow                 ✓            ◐        /pro:pr.merged handles cleanup
  Worktree cleanup                          ✓            ✗        No worktree support
─────────────────────────────────────────────────────────────────────────────

CCPLUGINS EXCLUSIVE CAPABILITIES (NOT IN SUPERPOWERS)
─────────────────────────────────────────────────────────────────────────────
  Backlog system (fingerprint dedup)        ✗            ✓        Unique to ccplugins
  ADR framework                             ✗            ✓        Architecture decision tracking
  3-strike error tracking                   ✗            ✓        Structured error protocol
  Build-in-public automation                ✗            ✓        Social content generation
  Combined security+quality audits          ✗            ✓        /pro:audit namespace
  Version management + tagging              ✗            ✓        Automated versioning
  Spec import + parsing                     ✗            ✓        /pro:spec.import
  Product validation pipeline               ✗            ✓        /pro:product.validate
  MCP server integrations                   ✗            ✓        Figma, Notion, Playwright, etc.
```

---

## Recommendations

### High Priority (Worth Porting)

#### 1. TDD Skill/Command
**Value:** High - completely missing capability
**Effort:** Medium - new skill + optional command
**Design Decision:** Skill-only vs `/pro:tdd` command vs `--tdd` flag on existing commands

#### 2. Git Worktrees Skill
**Value:** Medium-High - enables isolated parallel development
**Effort:** Low - expand brief mention in /pro:spike to full skill
**Design Decision:** Skill-only (auto-invoke) vs `/pro:worktree` command

#### 3. Micro-task Breakdown
**Value:** Medium - better execution granularity
**Effort:** Low - enhance existing planning
**Design Decision:** Integrate into existing planning or separate tool

### Medium Priority (Consider)

#### 4. 4-Phase Debugging
**Value:** Medium - formalizes existing /pro:bug
**Effort:** Low - enhance existing command
**Design Decision:** Add phases to /pro:bug or create skill

#### 5. Severity-Based PR Triage
**Value:** Medium - reduces cognitive load
**Effort:** Low - enhance /pro:pr.resolve
**Design Decision:** Filter by severity vs prioritized display

### Low Priority (Skip)

#### 6. Subagent-Driven Development
**Reason:** Architectural mismatch - ccplugins is single-agent focused

#### 7. Parallel Agent Dispatch
**Reason:** Same as above - different paradigm

#### 8. Two-Stage Review
**Reason:** Adds complexity without clear benefit for single-agent model
