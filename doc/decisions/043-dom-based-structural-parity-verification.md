# 043. DOM-Based Structural Parity Verification

Date: 2025-01-08

## Status

Accepted

## Context

The `/pro:permissionless-proof` command claimed 98% visual parity but produced rebuilds that were ~40-50% structurally accurate. The root cause was the architecture:

```
Screenshot → Vision Analysis → "Understanding" → Creative Rebuild → Screenshot Comparison
```

This approach is fundamentally flawed because:
1. **Screenshots lose structural information** - DOM hierarchy, CSS rules, exact values
2. **Vision inference introduces creative interpretation** - "similar to" not "identical to"
3. **No DOM truth anchor** - nothing to verify against except visual appearance
4. **Optimizes for "looks similar"** not "IS the same structure"

Evidence from gardensdentistrypb.com showed:
- Hero: Full-bleed team photo became flat navy block
- Services: 2-3 sections completely missing
- Testimonials: Wrong background color
- Overall: "Luxury spa dental" became "Generic dental template"

## Decision

Replace screenshot-based semantic inference with DOM-first extraction and structural PASS/FAIL verification.

Key changes:
1. **PARITY MODE constraint**: Forbid design, interpretation, improvement, and simplification during parity phase. Only copying allowed.
2. **DOM/HTML extraction**: Use Playwright to extract actual HTML and create `structure.json` as the parity contract
3. **Structural verification**: PASS/FAIL per section checking section count, image count, heading count, CTA count, background treatments
4. **No early exit**: Remove "diminishing returns" escape - if failures exist, must continue iterating
5. **Content audit**: Add aggressive content analysis for sales talking points

The guiding principle: *"Parity is not creative work. It's clerical work with teeth."*

## Consequences

**Positive:**
- Rebuilds will structurally match source sites
- No more false "98% parity" claims
- Clear PASS/FAIL criteria prevent premature completion
- DOM extraction provides verifiable truth anchor
- Content audit surfaces actual improvement opportunities

**Negative:**
- May require more iterations to achieve parity
- DOM extraction adds complexity to ACQUIRE phase
- Some dynamic/JavaScript-heavy sites may need special handling

## Alternatives Considered

1. **Improve vision scoring prompts** - Rejected because the architecture itself is flawed; better prompts won't fix structural blindness
2. **Add visual diff tooling** - Considered but doesn't solve the root cause; pixel diffs don't understand structure
3. **Human review gates** - Rejected as it breaks the autonomous pipeline promise

## Related

- Planning: `.plan/.done/fix-permissionless-proof-parity-failures/`
- Prior art: ADR-035 (pipeline architecture), ADR-036 (auto visual verification), ADR-039 (check extension)
