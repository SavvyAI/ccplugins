# Implementation TODO

## Step 1: Create ADR-036

- [ ] Create `doc/decisions/036-auto-visual-parity-verification.md`
- [ ] Document decision to use internal iteration loop
- [ ] Document vision-based parity scoring approach
- [ ] Document exit conditions and thresholds

## Step 2: Update permissionless-proof.md - Phase 3 Rewrite

### 2.1 Replace Phase 3 Header
- [ ] Change "Phase 3: VERIFY (Dual Verification)" to "Phase 3: AUTO-VERIFY (Automated Visual Parity Loop)"
- [ ] Update purpose description

### 2.2 Add Iteration Initialization (new section 3.2)
- [ ] Define iteration variables (count, scoreHistory, maxIterations=10)
- [ ] Create verify-iterations directory
- [ ] Document loop structure

### 2.3 Add Vision Analysis Section (new section 3.4)
- [ ] Add instructions to read source and parity screenshots
- [ ] Add vision analysis prompt template
- [ ] Add JSON output parsing instructions
- [ ] Add iteration artifact saving

### 2.4 Add Exit Condition Checks (new section 3.5)
- [ ] Success condition: parity >= 99%
- [ ] Diminishing returns: <1% improvement for 3 consecutive iterations
- [ ] Max iterations: count >= 10
- [ ] Branch to appropriate next section

### 2.5 Add Auto-Fix Section (new section 3.6)
- [ ] Parse gaps from vision report
- [ ] Generate component fixes for each gap
- [ ] Apply edits to files
- [ ] Rebuild project
- [ ] Increment iteration count
- [ ] Loop back to screenshot capture

### 2.6 Add User Decision Section (new section 3.7)
- [ ] Present current parity score
- [ ] List remaining gaps
- [ ] Use AskUserQuestion: proceed to ELEVATE or abort?

### 2.7 Update Structural Checklist
- [ ] Keep structural checklist as secondary verification
- [ ] Run after visual parity loop succeeds OR user approves

## Step 3: Update allowed-tools in Frontmatter

- [ ] Ensure Read tool is allowed (for vision on screenshots)
- [ ] Ensure all Playwright MCP tools are allowed

## Step 4: Update Output Summary

- [ ] Add AUTO-VERIFY results to completion summary
- [ ] Include final parity score
- [ ] Include iteration count
- [ ] Reference screenshots/verify-iterations/ directory

## Step 5: Update Error Handling Table

- [ ] Add "Vision analysis fails" error case
- [ ] Add "Build fails during iteration" error case
- [ ] Add "All iterations exhausted" handling

## Step 6: Testing

- [ ] Manual test on simple single-page site
- [ ] Manual test on multi-section site
- [ ] Verify iteration artifacts saved correctly
- [ ] Verify exit conditions trigger correctly
- [ ] Verify user prompt appears on non-success exit

## Step 7: Documentation

- [ ] Update README if needed
- [ ] Update command description in plugin.json if needed
