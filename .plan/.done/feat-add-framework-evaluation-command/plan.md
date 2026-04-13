# Plan: /pro:evaluate.framework Command

**Branch:** `feat/add-framework-evaluation-command`
**Status:** Planning
**Date:** 2026-03-19

## Overview

Create a command that systematically evaluates external frameworks, skill packs, or plugins against ccplugins with consistent output format.

## Requirements

1. Create `spike/evaluate-{name}` branch before any work
2. Clone target repo to `$TMPDIR/{name}` (keep until session ends)
3. Gather metadata (age, stars, commits, languages, license)
4. Detect project type (marketplace, plugin, skill pack)
5. Run standard checks
6. Generate comparison matrix
7. Output `doc/frameworks/{name}.md`
8. Suggest ADRs and backlog items (don't auto-create)

## Standard Checks

| Check | Description |
|-------|-------------|
| Age comparison | First commit date vs ccplugins (2025-10-26) |
| Manifest comparison | Compare marketplace.json, plugin.json, .mcp.json |
| Capability matrix | What they have vs what we have |
| Architecture analysis | Directory structure, patterns |
| Recommendations | Port, inspire, ignore with rationale |

## Project Type Detection

| Pattern | Type | Compare Against |
|---------|------|-----------------|
| `marketplace.json` or `.claude-plugin/marketplace.json` | Marketplace | `.claude-plugin/marketplace.json` |
| `plugin.json` or has `commands/` + `skills/` | Plugin | `pro/commands/`, `pro/skills/` |
| `skills/` only | Skill Pack | `pro/skills/` |
| `.mcp.json` or `mcp/` | MCP Config | `pro/.mcp.json` |
| `CLAUDE.md` rules files | Rules | `pro/bundled-rules/` |

## Output Template

```markdown
# {Framework} Analysis

> Evaluation of [{owner}/{repo}]({url}) against ccplugins.
> Date: {date}

## Overview

| Property | Value |
|----------|-------|
| Repository | {url} |
| Stars | {stars} |
| First Commit | {date} (ccplugins: 2025-10-26) |
| License | {license} |
| Languages | {breakdown} |
| Philosophy | {summary} |

## Architecture

{tree structure}

## Capability-by-Capability Analysis

{detailed breakdown}

## Comparison Matrix

{capability table with ✓/◐/✗}

## Recommendations

### High Priority (Worth Porting)
{items with rationale}

### Medium Priority (Consider)
{items}

### Low Priority (Skip)
{items with reasons}

## Suggested ADRs

- ADR-XXX: {title} - {one-line summary}

## Suggested Backlog Items

- {title} - {description}
```

## Implementation Steps

1. Create `pro/commands/evaluate.framework.md`
2. Define standard checks as enumerated list
3. Add detection logic for project types
4. Create output template
5. Update pro/readme.md with new command
6. Commit and verify

## Definition of Done

- [ ] Command exists at `pro/commands/evaluate.framework.md`
- [ ] Creates spike branch before work
- [ ] Clones to $TMPDIR
- [ ] Detects project type
- [ ] Runs all standard checks
- [ ] Outputs to doc/frameworks/
- [ ] Suggests (not creates) ADRs and backlog items
- [ ] Added to pro/readme.md

## Related ADRs

- [ADR-073: Evaluate Framework Command Architecture](../../doc/decisions/073-evaluate-framework-command-architecture.md)
