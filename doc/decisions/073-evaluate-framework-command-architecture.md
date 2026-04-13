# 073. Evaluate Framework Command Architecture

Date: 2026-03-19

## Status

Accepted

## Context

We periodically evaluate external frameworks, skill packs, and plugins (like obra/superpowers) against ccplugins to identify capabilities worth porting. This process was previously ad-hoc, with each evaluation following a slightly different approach and producing inconsistent outputs.

The superpowers evaluation demonstrated the value of systematic analysis but also revealed the need for:
1. Standardized output format for comparison matrices
2. Consistent project type detection (marketplace, plugin, skill pack, MCP config)
3. Clear recommendations categorization (High/Medium/Low priority)
4. Persistent documentation in `doc/frameworks/`

## Decision

Create `/pro:evaluate.framework` as a non-work-initiating command that:

1. **Creates spike branch** - `spike/evaluate-{name}` for isolation (follows ADR-017 taxonomy)
2. **Clones to $TMPDIR** - Keeps clone for session duration, auto-cleaned on exit
3. **Detects project type** - Marketplace, plugin, skill pack, MCP config, or rules pack
4. **Generates comparison matrix** - Uses ✓/◐/✗ notation for capability mapping
5. **Categorizes recommendations** - High/Medium/Low priority with rationale
6. **Outputs to doc/frameworks/** - Persistent documentation for future reference
7. **Suggests but does not create** - ADRs and backlog items listed, user decides to create

### Project Type Detection

| Pattern | Type | Compare Against |
|---------|------|-----------------|
| `marketplace.json` | Marketplace | `.claude-plugin/marketplace.json` |
| `commands/` + `skills/` | Plugin | `pro/commands/`, `pro/skills/` |
| `skills/` only | Skill Pack | `pro/skills/` |
| `.mcp.json` or `mcp/` | MCP Config | `pro/.mcp.json` |
| `CLAUDE.md` patterns | Rules Pack | `pro/bundled-rules/` |

### Output Structure

```
doc/frameworks/{name}.md
├── Overview (stars, age, license, languages)
├── Architecture (tree structure)
├── Capability-by-Capability Analysis
├── Comparison Matrix (✓/◐/✗)
├── Recommendations (High/Medium/Low)
├── Suggested ADRs
└── Suggested Backlog Items
```

## Consequences

### Positive

- **Consistent evaluations** - Every framework analysis follows same structure
- **Persistent documentation** - Findings preserved in `doc/frameworks/`
- **Age comparison first** - Immediately shows relative maturity
- **Non-destructive** - Suggests but doesn't auto-create ADRs/backlog items

### Negative

- **Creates spike branches** - Adds branches even for pure analysis (but aligns with ADR-017)
- **Requires cleanup** - Spike branches need manual deletion after evaluation

### Neutral

- Uses existing patterns (spike branches, doc/ directory, backlog integration)
- Compatible with existing `/pro:feature` workflow for implementing recommendations

## Alternatives Considered

### 1. Non-branching command (like `/pro:audit`)

Rejected because:
- Evaluation often involves exploration and experimentation
- Spike branch provides safe space for temporary changes
- Aligns with existing ADR-017 work-type taxonomy

### 2. Auto-create ADRs and backlog items

Rejected because:
- User should review recommendations before committing
- Reduces noise in backlog/ADRs
- Maintains human-in-the-loop for decisions

### 3. Store clones permanently in `.cache/`

Rejected because:
- Adds disk space overhead
- Session-scoped $TMPDIR sufficient for analysis
- User can re-run command if needed later

## Related

- ADR-017: Branch Naming Invariant and Work-Type Taxonomy
- Planning: `.plan/.done/feat-add-framework-evaluation-command/`
- Example output: `doc/frameworks/superpowers.md`
