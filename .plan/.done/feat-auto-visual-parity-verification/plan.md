# Auto Visual Parity Verification for Permissionless Proof

## Problem Statement

The current `/pro:permissionless-proof` pipeline requires manual human verification at the VERIFY phase:
1. Screenshots of source and parity build are captured
2. User manually compares them side-by-side
3. User identifies gaps and requests fixes
4. Fixes are applied, process repeats until user approves

This is time-consuming when running multiple permissionless proofs for cold outreach. The manual loop typically requires 3-5 iterations to reach 98-99% visual parity.

## Solution

Automate the visual parity checking loop by:
1. Using Claude's vision capability to analyze screenshots
2. Computing a parity score (0-100%)
3. Identifying specific visual gaps
4. Auto-fixing gaps and rebuilding
5. Repeating until success or exit conditions met

## Related ADRs

| ADR | Relevance |
|-----|-----------|
| ADR-035 | Permissionless Proof Pipeline Architecture - defines the 4-phase pipeline |
| ADR-026 | Subagent-Skill Dual Architecture - pattern for proactive features |
| ADR-034 | Playwright Alternative Browser MCP - browser automation options |

## Design Decisions

### 1. Internal Iteration (not ralph-wiggum)

**Decision:** Use internal iteration loop within the command itself.

**Rationale:**
- Simpler than external stop-hook based loops
- No additional plugin infrastructure needed
- Loop state is local to the command execution
- Easier to debug and reason about

### 2. Playwright MCP for Screenshots

**Decision:** Use Playwright MCP (`mcp__plugin_pro_playwright__*`) for browser automation.

**Rationale:**
- Already integrated and working
- Headless Chrome provides consistent rendering
- Full-page screenshots with `fullPage: true`
- Reliable viewport control with `browser_resize`

### 3. Vision-Based Parity Scoring

**Decision:** Use Claude's vision capability to analyze screenshots and produce a structured parity report.

**Approach:**
- Pass both source and parity screenshots to Claude
- Prompt for structured JSON output with:
  - `parityScore`: 0-100 percentage
  - `gaps`: Array of specific visual differences
  - `recommendations`: Actionable fix suggestions

### 4. Exit Conditions

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Success | parity >= 99% | Proceed to ELEVATE |
| Diminishing returns | <1% improvement for 3 consecutive iterations | Ask user to proceed or abort |
| Max iterations | 10 iterations | Ask user to proceed or abort |

### 5. Iteration History

**Decision:** Save iteration history for debugging.

**Storage:** `{OUTPUT_DIR}/screenshots/verify-iterations/`

**Structure:**
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

## Implementation Plan

### Phase 1: Update permissionless-proof.md

Modify the VERIFY phase to add auto-verification loop:

1. **Replace manual verification with auto-loop**
   - Remove user prompts from VERIFY phase
   - Add iteration loop structure
   - Add exit condition checks

2. **Add vision analysis step**
   - Read both screenshots (source is cached from ACQUIRE)
   - Use Read tool on image files to invoke Claude's vision
   - Parse structured parity report

3. **Add auto-fix logic**
   - For each gap identified, generate fix
   - Apply fixes to React components
   - Rebuild with `npm run build`
   - Capture new screenshot

4. **Add iteration state management**
   - Track iteration count
   - Track score history for diminishing returns detection
   - Save iteration artifacts

### Phase 2: Create Visual Parity Checker Skill (Optional)

If the inline approach becomes too complex, extract to a skill:

```
pro/skills/visual-parity-checker/
└── SKILL.md
```

The skill would encapsulate:
- Screenshot comparison logic
- Parity scoring algorithm
- Gap identification
- Fix recommendation generation

### Phase 3: Testing

1. Test on simple static site
2. Test on complex JS-rendered site
3. Test diminishing returns exit path
4. Test max iterations exit path
5. Verify iteration history is saved correctly

## Detailed Command Changes

### Current VERIFY Phase (lines ~470-593)

```markdown
## Phase 3: VERIFY (Dual Verification)

### 3.1 Start Dev Server
### 3.2 Capture Parity Screenshots
### 3.3 Visual Comparison [MANUAL]
### 3.4 Structural Checklist [MANUAL]
### 3.5 User Gate [MANUAL]
### 3.6 Stop Dev Server
```

### New VERIFY Phase

```markdown
## Phase 3: AUTO-VERIFY (Automated Visual Parity Loop)

### 3.1 Start Dev Server
### 3.2 Initialize Verification Loop
### 3.3 Capture Parity Screenshots
### 3.4 Vision Analysis (compare source vs parity)
### 3.5 Check Exit Conditions
  - If parity >= 99%: SUCCESS -> proceed to 3.8
  - If diminishing returns: EXIT -> proceed to 3.7
  - If max iterations: EXIT -> proceed to 3.7
  - Otherwise: proceed to 3.6
### 3.6 Apply Fixes and Rebuild
  - Identify specific component fixes from gaps
  - Apply edits
  - Rebuild with npm run build
  - Increment iteration count
  - Save iteration artifacts
  - Return to 3.3
### 3.7 User Decision (on diminishing returns/max iterations)
  - Present current parity score and remaining gaps
  - Ask: proceed to ELEVATE or abort?
### 3.8 Stop Dev Server
```

## Vision Analysis Prompt Template

```
You are analyzing two screenshots of websites for visual parity.

**Source Website:** [screenshot 1]
**Parity Rebuild:** [screenshot 2]

Analyze both screenshots and provide a structured assessment:

1. **Parity Score (0-100%)**: How closely does the parity rebuild match the source?
   - 100% = pixel-perfect
   - 90-99% = minor differences (spacing, exact colors)
   - 80-89% = noticeable differences (layout shifts, missing elements)
   - 70-79% = significant differences (wrong structure, missing sections)
   - <70% = major gaps

2. **Visual Gaps**: List specific differences, ordered by severity:
   - Area (e.g., "Hero section", "Navigation", "Footer")
   - Issue (e.g., "Background image missing", "Text color wrong")
   - Severity (high/medium/low)

3. **Fix Recommendations**: For each gap, suggest a specific code fix:
   - File to modify (if inferable)
   - What to change

Output as JSON:
{
  "parityScore": <number>,
  "gaps": [
    {"area": "<string>", "issue": "<string>", "severity": "<high|medium|low>"}
  ],
  "recommendations": [
    "<specific fix instruction>"
  ]
}
```

## Files to Modify

| File | Change |
|------|--------|
| `pro/commands/permissionless-proof.md` | Replace manual VERIFY with AUTO-VERIFY loop |
| `doc/decisions/036-auto-visual-parity-verification.md` | New ADR documenting this feature |

## Definition of Done

- [ ] VERIFY phase replaced with AUTO-VERIFY loop
- [ ] Vision analysis produces structured parity reports
- [ ] Exit conditions (99%, diminishing returns, max iterations) all working
- [ ] Iteration history saved to screenshots/verify-iterations/
- [ ] User decision prompt on non-success exits
- [ ] ADR-036 documents the design decisions
- [ ] Manual test on at least 2 websites
