# Content Fighter - Dual-Agent Content Refinement System

## Overview

A command (`/pro:content-fight`) that runs an iterative content refinement loop using two agents:
1. **Critic** - Scores content using a ruthless 5-axis rubric
2. **Rewriter** - Applies feedback to improve the content

The loop continues until the content achieves a 10/10 score.

## Architecture

### Command Only (Not Skill/Subagent)

This is a user-invoked utility, not a proactive background feature. Therefore:
- Single command file: `pro/commands/content-fight.md`
- No skill needed (not model-invoked)
- No subagent needed (not proactive)

### Agent Roles

| Agent | Responsibility | Model |
|-------|---------------|-------|
| Critic | Score content on 5 axes (0-10 each), identify primary failure | haiku |
| Rewriter | Apply feedback to improve content, no persona | haiku |

## Scoring Rubric (Content Meter v1.2)

### Five Axes (0-10 each, 5 = mediocre)

1. **Authority Signal** - Does this sound like someone who has *decided things*?
2. **Directionality** - Does this reduce ambiguity or force a mental move?
3. **Founder Pull** - Would this repel 80% of readers and attract the right 20%?
4. **Action Gravity** - Does this create pressure to respond, disagree, or act?
5. **Signal Density** - How much thinking happens per word?

### Scoring Rules

- 5 is mediocre, not good
- Assume the internet is saturated and attention is scarce
- Average content = failure
- Correct content = irrelevant
- Polite content = weak

### Medium-Specific Penalties

- **Images**: Quote cards = borrowed authority, screenshots without synthesis = passivity
- **PDFs**: Length is a liability, trend summaries without stance = failures
- **Text**: Agreement without reframing = weak, safe consensus = invisible

## Workflow

```
User provides content
       |
       v
+------------------+
|   CRITIC         |
|   - Score 5 axes |
|   - Diagnose     |
|   - One-line fix |
+------------------+
       |
       v
  Score = 10.0?
       |
  no   |   yes
       v       \
+------------------+   \
|   REWRITER       |    --> Output final content
|   - Apply fix    |
|   - Rewrite      |
+------------------+
       |
       v
  Display new version
       |
       v
  (loop back to CRITIC)
```

## Output Format

### Each Round

```
## Round N

### Score: X.X / 10

| Axis | Score |
|------|-------|
| Authority | X |
| Direction | X |
| Founder Pull | X |
| Action Gravity | X |
| Signal Density | X |

**Primary Failure:** [One sentence diagnosis]

**Why This Loses Attention:** [One sentence cost]

**One-Line Upgrade:** [Rewritten line]

---

### Rewritten Content

[Full rewritten content]
```

### Final Output (Score = 10.0)

```
## CONTENT FIGHT COMPLETE

### Final Score: 10.0 / 10

### Polished Content

[Final content]

---

Rounds: N
```

## Design Decisions

- **No iteration limit**: Keep going until 10/10 (user can Ctrl+C)
- **No configuration**: 10/10 is the only acceptable outcome
- **Verbose progress**: Show each round's breakdown
- **Rewriter has no persona**: Just applies feedback directly
- **Both agents use haiku**: Cost-effective for iteration

## Files

- `pro/commands/content-fight.md` - The command definition

## Related ADRs

- ADR-014: Skills Directory (not applicable - this is a command)
- ADR-026: Subagent-Skill Dual Architecture (not applicable - user-invoked)
- **ADR-047: Content Fighter Adversarial Refinement Loop** - Documents the design decisions for this feature
