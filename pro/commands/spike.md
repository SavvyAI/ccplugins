---
description: "Exploring something uncertain? → Time-boxed investigation with optional documentation → Creates a spike branch for learning-first work"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

## Context

Let's explore: $ARGUMENTS

## What is a Spike?

A spike is time-boxed exploratory work focused on **uncertainty reduction**, not delivery.

**Spike characteristics:**
- Learning over completion
- Exploration over delivery
- No guarantee of merge or continuation
- May be discarded, promoted to feature, or merged as-is

## Tip: Git Worktrees for Full Isolation

For risky experiments where you want **complete isolation** from your current work, consider using [git worktrees for parallel Claude sessions](https://www.anthropic.com/engineering/claude-code-best-practices):

```bash
# Create isolated worktree (sibling directory)
git worktree add -b spike/experiment ../$(basename $PWD)--experiment

# Open new terminal, cd into worktree, start fresh Claude session
cd ../project--experiment
claude

# When done, clean up
git worktree remove ../project--experiment --force
git branch -D spike/experiment
```

This keeps your main working directory pristine while experimenting in parallel.

## Your Task

**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

0. **IMMEDIATELY create branch** - Generate a `spike/` branch name from the initial description
   (`$ARGUMENTS`) and create it. Do NOT proceed to any other step until this is complete.
   Example: "explore redis caching options" → `spike/explore-redis-caching-options`
1. Enter **plan mode** (announce this to the user).
2. **Check ADRs for related decisions** - Search `doc/decisions/` for prior decisions related to this exploration. Summarize any relevant decisions.
3. Clarify the spike scope:
   - What uncertainty are we trying to reduce?
   - What would "success" look like for this spike?
   - What is the time-box? (suggest a reasonable default if not specified)
4. **Add to backlog as in-progress** - This enables `/pro:backlog.resume` to pick up where you left off:
   - Ensure `.plan/backlog.json` exists (create with `{"lastSequence": 0, "items": []}` if not)
   - Increment `lastSequence` and add item:
     ```json
     {
       "id": <next sequence>,
       "title": "<brief title from exploration goal>",
       "description": "<full description including what we're trying to learn>",
       "category": "spike",
       "severity": "medium",
       "fingerprint": "spike|<id>|<slugified-title>",
       "source": "/pro:spike",
       "sourceBranch": "<branch name>",
       "createdAt": "<ISO 8601 timestamp>",
       "status": "in-progress"
     }
     ```
5. Create minimal planning directory: `${ProjectRoot}/.plan/${BranchName}` (branch naming: `spike/foo-bar` → `spike-foo-bar`)
6. Begin exploration. Document findings as you go (inline comments, notes, or code).
7. **After exploration, prompt the user:**
   > "Would you like to document your findings? This helps preserve institutional memory for future reference."
   - If yes: Create `.plan/{branch}/findings.md` with:
     - What was explored
     - Key learnings
     - Decisions made (or deferred)
     - Recommendations for next steps
   - If no: Proceed without formal documentation

## Spike Lifecycle

After exploration, the spike can:
1. **Be discarded** - Learning complete, no further action needed
2. **Be promoted to feature** - Use `/pro:feature` to start proper implementation based on findings
3. **Be merged as-is** - If the spike produced usable code

**Note:** Spikes do not require CodeRabbit review since they may not merge.

## Browser Verification

For web applications, use Playwright MCP (if available) rather than screenshots for:
- Visual verification and UI state inspection
- Console log and error analysis
- Network request inspection

## Definition of Done

- The uncertainty that motivated the spike has been reduced or resolved.
- Findings are documented (if user opted in).
- Next steps are clear (discard, promote, or merge).
