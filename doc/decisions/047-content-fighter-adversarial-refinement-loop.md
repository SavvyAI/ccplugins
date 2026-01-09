# 047. Content Fighter Adversarial Refinement Loop

Date: 2026-01-09

## Status

Accepted

## Context

Content creation for social media (X, LinkedIn) requires iterative refinement to achieve high signal density. The manual workflow involves:

1. Write initial content
2. Paste into a scoring GPT (e.g., "Content Meter")
3. Receive score and feedback
4. Paste feedback back to original GPT
5. Receive rewritten content
6. Repeat until score is satisfactory

This context-switching is tedious and error-prone. We wanted to automate this adversarial refinement loop within Claude Code.

Key design questions:
1. How to structure the dual-agent interaction?
2. What stopping condition to use?
3. Should this be a skill (proactive) or command (user-invoked)?
4. How verbose should the iteration feedback be?

## Decision

### Command-Only Architecture

Content Fighter is implemented as a **command** (`/pro:content-fight`), not a skill or subagent.

**Rationale:**
- User explicitly initiates with content they want refined
- Not proactive - doesn't make sense to automatically score random content
- Similar to utility commands like `/pro:audit` rather than background features like `build-in-public`

### Single-Command Dual-Agent Loop

Both Critic and Rewriter roles are defined within the same command, alternating in a loop:

```
User Content → Critic (score) → Rewriter (improve) → Critic (score) → ...
```

**Rationale:**
- Simpler than spawning actual subagents
- No inter-agent communication overhead
- Context stays coherent within single execution
- User sees the full journey transparently

### Embedded Scoring Rubric

The full Content Meter v1.2 scoring rubric is embedded directly in the command:

- **5 axes**: Authority, Directionality, Founder Pull, Action Gravity, Signal Density
- **Scale**: 0-10 per axis (5 = mediocre)
- **Medium-specific penalties**: Images, PDFs, Text each have distinct biases

**Rationale:**
- No external configuration needed
- Rubric is stable and well-defined
- Embedding ensures consistent behavior

### 10/10 Victory Condition (No Configuration)

The loop continues until content achieves exactly 10.0/10 average score.

**Rationale:**
- Eliminates configuration complexity
- Forces truly excellent output
- User can Ctrl+C to exit early if needed
- "Good enough" is antithetical to the feature's purpose

### Verbose Round-by-Round Output

Each iteration displays:
- Full score breakdown (all 5 axes)
- Primary failure diagnosis
- One-line upgrade suggestion
- Complete rewritten content

**Rationale:**
- Transparency builds trust in the process
- User learns from the refinement journey
- Debugging is possible if scores plateau

## Consequences

### Positive

- **Zero context-switching**: Entire refinement loop in one place
- **Transparent iteration**: User sees every round
- **No configuration**: 10/10 or bust
- **Embedded expertise**: Full scoring rubric captured in code
- **Lightweight**: Command-only, no skills/subagents

### Negative

- **Potentially long loops**: Some content may take many iterations
- **No customization**: Fixed rubric, fixed target score
- **Large command file**: Embedded rubric makes the command substantial

### Neutral

- Uses haiku model for cost-effective iteration
- No persistence layer - each session is fresh
- No learning from previous sessions

## Alternatives Considered

### 1. Skill + Subagent Architecture

Rejected because:
- Content refinement is user-initiated, not proactive
- Over-engineered for a utility command
- ADR-026 pattern is for background features

### 2. Configurable Target Score

Rejected because:
- "Good enough" defeats the purpose
- Simplicity over flexibility
- User can always Ctrl+C

### 3. External Rubric File

Rejected because:
- Adds configuration complexity
- Rubric is stable, not user-customizable
- Single source of truth is cleaner

### 4. Actual Subagent Spawning

Rejected because:
- Overhead not justified for alternating loop
- Same model handles both roles fine
- Simpler implementation

## Related

- ADR-014: Skills Directory (not applicable - command)
- ADR-026: Subagent-Skill Dual Architecture (contrast case)
- Planning: `.plan/.done/feat-content-fighter-dual-agent-refinement/`
