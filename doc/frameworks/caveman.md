# Caveman Analysis

> Evaluation of [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) against ccplugins.
> Date: 2026-04-13

## Overview

| Property | Value |
|----------|-------|
| Repository | github.com/JuliusBrussee/caveman |
| Stars | 25,358 |
| First Commit | 2026-04-04 (ccplugins: 2025-10-26) |
| License | MIT |
| Languages | Python, JavaScript, Shell |
| Philosophy | Token efficiency through compressed communication |

**Summary:** Caveman is a viral Claude Code skill that makes the agent communicate in compressed "caveman speak" — cutting ~75% of output tokens while maintaining technical accuracy. Also includes input compression for memory files (~46% reduction). Very focused, single-purpose utility.

## Architecture

```
caveman/
├── skills/                    # 5 skills
│   ├── caveman/              # Core terse communication mode
│   ├── caveman-commit/       # Compressed commit messages
│   ├── caveman-review/       # One-line code reviews
│   ├── caveman-help/         # Help documentation
│   └── compress/             # Input file compression
├── caveman-compress/          # Python CLI for file compression
│   └── scripts/              # compress, detect, validate
├── hooks/                     # Claude Code hooks
│   ├── caveman-activate.js   # SessionStart hook
│   ├── caveman-mode-tracker.js # UserPromptSubmit hook
│   └── caveman-statusline.sh # Statusline badge
├── commands/                  # TOML command definitions
│   ├── caveman.toml
│   ├── caveman-commit.toml
│   └── caveman-review.toml
├── benchmarks/               # Token usage benchmarks
├── evals/                    # Evaluation scripts
├── plugins/caveman/          # Plugin packaging
├── rules/                    # Activation rules
└── tests/                    # Test files
```

---

## Capability-by-Capability Analysis

### 1. Output Token Compression (Caveman Speak)

**What it does:** Makes Claude communicate in compressed terse style. Drops articles, filler words, pleasantries. Keeps technical accuracy.

**Intensity levels:**
- `lite` - No filler/hedging, keep articles + full sentences
- `full` - Drop articles, fragments OK, short synonyms (default)
- `ultra` - Abbreviations, arrows for causality, maximum compression
- `wenyan` - Classical Chinese compression modes

**ccplugins equivalent:** None. ccplugins doesn't have output compression modes.

**Value:** High - 75% output token reduction is significant for long sessions.

---

### 2. Input File Compression (caveman-compress)

**What it does:** Python CLI that compresses CLAUDE.md, todos, and memory files into caveman format. Preserves code blocks, URLs, technical terms exactly. Saves ~46% input tokens per session.

**ccplugins equivalent:** None. We don't have memory file compression.

**Value:** Medium-High - reduces context window usage for large CLAUDE.md files.

---

### 3. Terse Commit Messages (caveman-commit)

**What it does:** Generates ultra-compressed commit messages. Conventional Commits format, ≤50 char subject, body only when "why" isn't obvious.

**ccplugins equivalent:** Partial. Our commit workflow in CLAUDE.md has guidelines but not a dedicated skill for compression.

**Value:** Low - nice polish but marginal improvement.

---

### 4. One-Line Code Reviews (caveman-review)

**What it does:** Compressed code review output. Findings in terse format.

**ccplugins equivalent:** `/pro:audit.quality` produces full reports, not compressed.

**Value:** Low - our audit output is already structured.

---

### 5. Claude Code Hooks Integration

**What it does:**
- `caveman-activate.js` - SessionStart hook sets mode
- `caveman-mode-tracker.js` - UserPromptSubmit tracks mode changes
- `caveman-statusline.sh` - Shows active mode in status bar

**ccplugins equivalent:** None. We don't use Claude Code hooks for runtime state.

**Value:** Medium - hooks pattern is interesting for persistent state.

---

### 6. Auto-Clarity Rules

**What it does:** Automatically disables caveman for security warnings, irreversible actions, multi-step sequences where fragments risk misread.

**ccplugins equivalent:** None - we don't have context-aware communication modes.

**Value:** Low-Medium - smart safety feature but niche.

---

## Comparison Matrix

```
Legend: ✓ FULL  ◐ PARTIAL  ✗ MISSING

CAPABILITY                              CAVEMAN   CCPLUGINS   NOTES
─────────────────────────────────────────────────────────────────────────────
Token Efficiency
  Output compression (caveman speak)        ✓         ✗       MISSING - 75% reduction
  Input file compression                    ✓         ✗       MISSING - 46% reduction
  Intensity levels (lite/full/ultra)        ✓         ✗       MISSING
  Auto-clarity (disable for warnings)       ✓         ✗       MISSING

Specialized Skills
  Terse commit messages                     ✓         ◐       Have guidelines, not skill
  Terse code review                         ✓         ◐       /pro:audit is full format

Hooks/State
  SessionStart hook                         ✓         ✗       MISSING - don't use hooks
  Statusline integration                    ✓         ✗       MISSING
  Mode persistence across turns             ✓         ✗       MISSING
─────────────────────────────────────────────────────────────────────────────

CCPLUGINS EXCLUSIVE CAPABILITIES (NOT IN CAVEMAN)
─────────────────────────────────────────────────────────────────────────────
  Full development workflow                 ✗         ✓       /pro:feature, /pro:pr, etc.
  Backlog management                        ✗         ✓       /pro:backlog
  Security auditing                         ✗         ✓       /pro:audit.security
  MCP server integrations                   ✗         ✓       Figma, Notion, Playwright
  Product validation                        ✗         ✓       /pro:product.validate
  Framework evaluation                      ✗         ✓       /pro:evaluate.framework
  ADR framework                             ✗         ✓       doc/decisions/
```

---

## Recommendations

### High Priority (Worth Porting)

#### 1. Output Compression Skill
**Value:** High - 75% token reduction for long sessions
**Effort:** Low - single SKILL.md file
**Design Decision:** Separate skill or integrate into existing skills as mode toggle?

Note: Caveman is already available as a separate plugin. Consider whether to port vs recommend installing alongside ccplugins.

### Medium Priority (Consider)

#### 2. Input File Compression Tool
**Value:** Medium-High - reduce CLAUDE.md context overhead
**Effort:** Medium - Python CLI + validation
**Design Decision:** Port the Python tool or implement as skill-only?

#### 3. Claude Code Hooks Pattern
**Value:** Medium - persistent state across turns
**Effort:** Low - learn from their hook implementation
**Design Decision:** Use hooks for ccplugins state management?

### Low Priority (Skip)

#### 4. Terse Commit/Review Skills
**Reason:** Marginal improvement, caveman plugin can be used alongside ccplugins.

#### 5. Wenyan (Classical Chinese) Mode
**Reason:** Niche use case.

---

## Suggested ADRs

- **ADR-XXX: Token Efficiency Mode** - Whether to port caveman-style compression or recommend using caveman plugin alongside ccplugins

## Suggested Backlog Items

- **Consider caveman integration** - Evaluate whether to port caveman skill to ccplugins or document as recommended companion plugin. Source: doc/frameworks/caveman.md

---

## Key Insight

Caveman is **complementary** to ccplugins, not competitive. It solves token efficiency while ccplugins solves workflow orchestration. The recommended approach may be:

1. Document caveman as a "recommended companion plugin" in ccplugins README
2. Optionally port the core caveman skill to `pro/skills/` for convenience
3. Learn from their hooks pattern for state management

The 25k+ stars in 9 days demonstrates strong demand for token efficiency - this is a validated need worth addressing somehow.
