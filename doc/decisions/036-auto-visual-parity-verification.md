# 036. Auto Visual Parity Verification

Date: 2026-01-05

## Status

Accepted

## Context

The permissionless proof pipeline (ADR-035) requires a VERIFY phase where the parity rebuild is compared against the source website. The original design used manual user verification:

1. Screenshots of source and parity are captured
2. User manually compares them side-by-side
3. User identifies gaps and requests fixes
4. Process repeats until user approves

This manual loop has drawbacks for high-volume cold outreach:
- Requires human attention for each iteration
- Typically needs 3-5 rounds to reach 98-99% parity
- Cannot run unattended while user works on other tasks
- Scales poorly when running multiple permissionless proofs

The insight is that Claude's vision capability can analyze screenshots and identify visual differences, enabling automated iteration without human intervention.

## Decision

### Internal Iteration Loop

The AUTO-VERIFY phase uses an internal iteration loop within the command itself, not an external self-referential mechanism like ralph-wiggum.

**Rationale:**
- Simpler implementation with no additional hooks infrastructure
- Loop state is local to command execution
- Easier to debug and reason about
- No session restart overhead

### Vision-Based Parity Scoring

Claude analyzes both screenshots (source and parity) using its vision capability and produces a structured JSON report:

```json
{
  "parityScore": 87,
  "gaps": [
    {"area": "Hero section", "issue": "Background image missing", "severity": "high"},
    {"area": "Navigation", "issue": "Logo 20% smaller", "severity": "medium"}
  ],
  "recommendations": [
    "Add hero background image from src/assets",
    "Increase logo size in Navigation.tsx"
  ]
}
```

**Rationale:**
- Structured output enables programmatic processing
- Gap severity helps prioritize fixes
- Recommendations provide actionable guidance for auto-fix

### Three Exit Conditions

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Success | parityScore >= 99% | Proceed to ELEVATE phase |
| Diminishing returns | <1% improvement for 3 consecutive iterations | Ask user: proceed or abort? |
| Max iterations | 10 iterations reached | Ask user: proceed or abort? |

**Rationale:**
- 99% threshold allows minor pixel differences while ensuring visual fidelity
- Diminishing returns detection prevents infinite loops on unfixable gaps
- Max iterations provides a safety cap
- User decision on non-success preserves human agency for edge cases

### Iteration History

Each iteration saves artifacts to `{OUTPUT_DIR}/screenshots/verify-iterations/`:

```
verify-iterations/
├── iteration-001/
│   ├── parity.png
│   └── report.json
├── iteration-002/
│   ├── parity.png
│   └── report.json
└── summary.json
```

**Rationale:**
- Enables debugging when parity gets stuck
- Provides audit trail of improvement progression
- Helps identify patterns in common gap types

### Playwright MCP for Screenshots

Uses Playwright MCP (`@playwright/mcp`) for all browser automation.

**Rationale:**
- Already integrated and working in the plugin
- Headless Chrome provides consistent rendering across runs
- Full-page screenshots capture entire page layout
- Reliable viewport control for desktop/mobile comparisons

## Consequences

### Positive

- **Unattended operation**: Pipeline can run to completion without human intervention
- **Faster iteration**: No wait time for human review between iterations
- **Scalable**: Can run multiple permissionless proofs in parallel
- **Consistent**: Vision analysis applies same criteria every iteration
- **Debuggable**: Iteration history enables post-hoc analysis

### Negative

- **Vision limitations**: Claude's vision may miss subtle differences human would catch
- **Context usage**: Each iteration consumes context for screenshot analysis
- **False positives**: May attempt fixes for non-issues
- **No true pixel-diff**: Uses perceptual comparison, not mathematical pixel diff

### Mitigations

- User decision gate on non-success exits catches vision failures
- Max iterations limit prevents runaway context consumption
- Severity-weighted gaps prioritize real issues over noise
- Iteration history enables human review if needed

## Alternatives Considered

### 1. Ralph-Wiggum Style External Loop

Use stop hooks to create self-referential feedback loop.

**Rejected because:**
- Adds complexity (hooks, state files, session management)
- Overkill for this use case which has bounded iterations
- Internal loop is sufficient and simpler

### 2. Pixel-Perfect Diff Tool

Use image diff libraries (pixelmatch, resemblejs) for mathematical comparison.

**Rejected because:**
- Pixel-perfect is too strict (browser rendering variance)
- Doesn't provide semantic understanding of gaps
- Can't generate meaningful fix recommendations

### 3. Separate Verification Subagent

Create a dedicated subagent that runs proactively after PARITY phase.

**Rejected because:**
- Adds infrastructure complexity
- Subagent pattern is for true proactive behavior
- AUTO-VERIFY is part of the pipeline, not a proactive feature

### 4. User-Defined Parity Threshold

Let user specify target parity percentage (e.g., 95%, 99%, 100%).

**Deferred:**
- Could be added later as `--parity-threshold` flag
- Default of 99% is reasonable for most use cases

## Related

- ADR-035: Permissionless Proof Pipeline Architecture (parent feature)
- ADR-026: Subagent-Skill Dual Architecture (considered but not used)
- ADR-034: Playwright Alternative Browser MCP (Playwright is primary)
