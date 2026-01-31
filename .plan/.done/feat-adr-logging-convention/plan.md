# ADR-063: Logging Convention for CLI Tools and Daemons

## Status: Complete

## Summary

Establishes the stdout/stderr-only logging convention for agent-readable, operator-controlled debugging.

## Decisions Made

1. **ADR Location**: `doc/decisions/063-logging-convention-stdout-only.md`
2. **Enforcement Scope**: ADR + command updates
3. **Cross-References**: Yes, references ADR-011 as prior art

## Files Created/Modified

### Created
- `doc/decisions/063-logging-convention-stdout-only.md` - The ADR itself

### Modified
- `doc/decisions/README.md` - Added index entry for ADR-063
- `pro/commands/bug.md` - Added ADR-063 reference in step 6 (Investigate root cause)
- `pro/commands/feature.md` - Added "Debugging During Implementation" section referencing ADR-063
- `.plan/backlog.json` - Added item #86 for this feature

## Key Points from ADR-063

1. Applications write to stdout/stderr only
2. Runtime/operator owns persistence at XDG-compliant locations
3. Agents check logs first, execution is last resort
4. No application-level file logging unless explicit exit criteria are met

## Next Steps

- Create PR
- Merge to main
