# Multi-Proof Marketplace Support

## Branch
`feat/multi-proof-marketplace-support`

## Problem Statement

Currently, `/pro:permissionless-proof` creates a single proof per domain with no versioning or metadata persistence:

1. Running the command twice on the same URL overwrites the previous proof
2. No way to compare proofs side-by-side to see software evolution
3. No persistent metadata to power a marketplace
4. If the original site changes, we lose the previous proof when re-running
5. Current slug (`proof-{domain}`) doesn't support multiple runs

## User Stories

1. As a freelancer, I want to run multiple proofs on the same site so I can show how my rebuild techniques have improved over time
2. As an agency, I want to build a portfolio of proofs so I can present them as marketplace items
3. As a user, I want metadata captured about each proof so I can filter/search my portfolio
4. As a user, I want to re-run proofs on updated sites without losing previous versions
5. As a user, I want to choose whether to create a new proof or update an existing one

## Requirements

### R1: New Slug Format

**Format:** `proof-{domain-slug}-{YYMMDD}{seq}`

Where:
- `proof-` = standard prefix (unchanged)
- `{domain-slug}` = existing domain slug algorithm (unchanged)
- `{YYMMDD}` = 2-digit year, month, day
- `{seq}` = sequence letter (a, b, c, ...) for same-day runs

**Examples:**
```
proof-gardens-dentistry-pb-240109a   # First run on Jan 9, 2024
proof-gardens-dentistry-pb-240109b   # Second run same day
proof-gardens-dentistry-pb-240215a   # Run on Feb 15
```

**Sequence logic:**
- Scan existing proofs matching `proof-{domain-slug}-{YYMMDD}*`
- Find highest sequence letter
- Increment (a→b→c... z→aa→ab)

### R2: Interactive Prompt for Existing Proofs

When running `/pro:permissionless-proof <url>`:

1. Check if proofs exist for this domain (via registry or filesystem scan)
2. If proofs exist, present `AskUserQuestion`:
   - **"Create new proof"** - Generate with new timestamp/sequence
   - **"Update most recent"** - Overwrite the latest proof in place
   - **"View existing"** - List existing proofs and exit

### R3: Dual Storage Architecture

**Central Registry:** `.plan/proofs/index.json`
```json
{
  "version": "1.0.0",
  "proofs": [
    {
      "id": "proof-gardens-dentistry-pb-240109a",
      "sourceUrl": "https://gardensdentistrypb.com",
      "domainSlug": "gardens-dentistry-pb",
      "createdAt": "2026-01-09T14:30:00Z",
      "updatedAt": "2026-01-09T15:00:00Z",
      "status": "deployed",
      "path": "./proof-gardens-dentistry-pb-240109a",
      "pagesUrl": "https://user.github.io/proof-gardens-dentistry-pb-240109a/"
    }
  ]
}
```

**Per-Proof Manifest:** `{proof-dir}/proof.json`
```json
{
  "id": "proof-gardens-dentistry-pb-240109a",
  "version": "1.0.0",
  "source": {
    "url": "https://gardensdentistrypb.com",
    "domain": "gardensdentistrypb.com",
    "domainSlug": "gardens-dentistry-pb",
    "capturedAt": "2026-01-09T14:30:00Z"
  },
  "pipeline": {
    "acquireCompleted": "2026-01-09T14:35:00Z",
    "checkCompleted": "2026-01-09T14:40:00Z",
    "parityCompleted": "2026-01-09T14:50:00Z",
    "parityIterations": 4,
    "finalParityScore": 98,
    "elevateCompleted": "2026-01-09T14:55:00Z",
    "deployCompleted": "2026-01-09T15:00:00Z"
  },
  "issues": {
    "technical": {
      "desktop": 2,
      "tablet": 1,
      "mobile": 4,
      "total": 7
    },
    "content": {
      "total": 5
    }
  },
  "deployment": {
    "status": "deployed",
    "pagesUrl": "https://user.github.io/proof-gardens-dentistry-pb-240109a/",
    "evidenceUrl": "https://user.github.io/proof-gardens-dentistry-pb-240109a/evidence/",
    "deployedAt": "2026-01-09T15:00:00Z"
  },
  "marketplace": {
    "showcase": false,
    "tags": ["dental", "healthcare", "local-business"],
    "industry": "healthcare",
    "pricingTier": null,
    "thumbnail": "screenshots/source/source-desktop-hero.png"
  },
  "meta": {
    "createdAt": "2026-01-09T14:30:00Z",
    "updatedAt": "2026-01-09T15:00:00Z",
    "createdBy": "pro:permissionless-proof",
    "proofSchemaVersion": "1.0.0"
  }
}
```

### R4: Registry Operations

**On proof creation:**
1. Generate unique slug with date + sequence
2. Create proof directory
3. Write `proof.json` at end of pipeline
4. Append to `.plan/proofs/index.json` (create if not exists)

**On proof update:**
1. Update `proof.json` with new timestamps
2. Update corresponding entry in `index.json`

**Registry rebuild (if corrupted):**
- Scan for `*/proof.json` files
- Rebuild `index.json` from manifests

### R5: Marketplace Metadata

Capture during pipeline:
- **Automatic:** URL, domain, timestamps, issue counts, parity scores
- **Inferred:** Industry/tags (from domain keywords, content analysis)
- **Manual (future):** Pricing tier, showcase status, custom tags

## Implementation Plan

### Phase 1: Schema & Registry Infrastructure
1. Create `.plan/proofs/` directory structure
2. Define `index.json` schema
3. Define `proof.json` schema
4. Create registry read/write utilities in command spec

### Phase 2: Slug Generation Update
1. Update `Derive Domain Slug` section in `permissionless-proof.md`
2. Add date + sequence logic
3. Add existing proof detection

### Phase 3: Interactive Prompt
1. Add proof existence check before pipeline starts
2. Add `AskUserQuestion` with create/update/view options
3. Handle "View existing" to list and exit

### Phase 4: Metadata Capture
1. Add `proof.json` generation at Phase 5 (OUTPUT)
2. Capture all pipeline metrics as they occur
3. Add registry update at end of pipeline

### Phase 5: ADR Documentation
1. Create ADR-046 documenting the architecture decision

## Files to Modify

1. `pro/commands/permissionless-proof.md` - Main command spec
2. `.plan/proofs/index.json` - New file (central registry)
3. `doc/decisions/046-multi-proof-marketplace-architecture.md` - New ADR

## Definition of Done

- [ ] New slug format generates unique identifiers with date + sequence
- [ ] Interactive prompt appears when existing proofs detected
- [ ] `proof.json` created in each proof directory
- [ ] `.plan/proofs/index.json` updated on each proof creation
- [ ] Marketplace metadata captured (issues, scores, timestamps)
- [ ] ADR documenting the architecture decision
- [ ] Existing proof behavior unchanged for first-time URLs

## Related ADRs

- ADR-035: Permissionless Proof Pipeline Architecture
- ADR-037: GitHub Pages Deployment for Proofs
- ADR-045: GitHub Pages Full Automation
- ADR-046: Multi-Proof Marketplace Architecture (NEW)
