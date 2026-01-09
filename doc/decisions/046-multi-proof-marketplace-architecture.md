# 046. Multi-Proof Marketplace Architecture

Date: 2026-01-09

## Status

Accepted

## Context

The `/pro:permissionless-proof` command (ADR-035) creates website rebuilds for cold outreach. However, the current implementation has limitations that block marketplace and portfolio use cases:

1. **Single proof per domain** - Running the command twice overwrites the previous proof
2. **No persistent metadata** - No structured data about proofs for querying/filtering
3. **No version tracking** - Can't compare how proof quality evolved over time
4. **Overwrite risk** - Re-running on an updated site loses the previous proof

These limitations prevent:
- Building a portfolio of proofs as marketplace items
- Side-by-side comparison of software evolution
- Re-running proofs on updated sites without losing history
- Rich marketplace features (filtering, tagging, pricing)

## Decision

### 1. Date-Sequenced Slug Format

Replace the simple `proof-{domain-slug}` with a date-sequenced format:

```
proof-{domain-slug}-{YYMMDD}{seq}
```

**Examples:**
```
proof-gardens-dentistry-pb-240109a   # First run on Jan 9
proof-gardens-dentistry-pb-240109b   # Second run same day
proof-gardens-dentistry-pb-240215a   # Run on Feb 15
```

**Rationale:**
- Chronologically sortable - newest proofs sort last
- Natural deduplication - date + sequence prevents collisions
- Readable - domain still visible for recognition
- GitHub Pages friendly - all valid URL characters
- Short enough for marketplace presentation

**Sequence logic:**
- For same-day runs, increment letter (a, b, c, ...)
- Scan existing proofs to find highest sequence
- Edge case: after 'z', use 'aa', 'ab', etc. (unlikely in practice)

### 2. Dual Storage Architecture

**Central Registry:** `.plan/proofs/index.json`

Lightweight index for fast querying across all proofs:

```json
{
  "version": "1.0.0",
  "proofs": [
    {
      "id": "proof-gardens-dentistry-pb-240109a",
      "sourceUrl": "https://gardensdentistrypb.com",
      "domainSlug": "gardens-dentistry-pb",
      "createdAt": "2026-01-09T14:30:00Z",
      "status": "deployed",
      "path": "./proof-gardens-dentistry-pb-240109a"
    }
  ]
}
```

**Per-Proof Manifest:** `{proof-dir}/proof.json`

Rich metadata for each proof, self-contained and portable:

```json
{
  "id": "proof-gardens-dentistry-pb-240109a",
  "source": { "url": "...", "domain": "...", "capturedAt": "..." },
  "pipeline": { "parityIterations": 4, "finalParityScore": 98, ... },
  "issues": { "technical": {...}, "content": {...} },
  "deployment": { "pagesUrl": "...", "deployedAt": "..." },
  "marketplace": { "tags": [...], "industry": "...", "showcase": false }
}
```

**Rationale:**
- **Central index** enables fast listing/filtering without filesystem scans
- **Per-proof manifest** makes proofs self-contained and portable
- **Rebuild capability** - index can be regenerated from manifests if corrupted
- **Separation of concerns** - index for queries, manifest for details

### 3. Interactive Prompt for Existing Proofs

When running `/pro:permissionless-proof <url>` on a URL that has existing proofs:

```
Existing proofs found for gardensdentistrypb.com:
  • proof-gardens-dentistry-pb-240109a (deployed, 98% parity)
  • proof-gardens-dentistry-pb-240105a (deployed, 95% parity)

What would you like to do?
  [1] Create new proof
  [2] Update most recent
  [3] View existing and exit
```

**Rationale:**
- Prevents accidental overwrites
- Enables intentional updates (fix issues in existing proof)
- Provides visibility into proof history
- First-time URLs skip the prompt entirely (no friction)

### 4. Marketplace-Ready Metadata Schema

Capture rich metadata for future marketplace features:

| Field | Source | Purpose |
|-------|--------|---------|
| `issues.technical.*` | CHECK phase | Quality indicators |
| `pipeline.finalParityScore` | AUTO-VERIFY | Quality metric |
| `marketplace.tags` | Inferred from content | Filtering |
| `marketplace.industry` | Inferred from domain | Categorization |
| `marketplace.showcase` | Manual flag | Featured proofs |
| `marketplace.pricingTier` | Future manual | Monetization |
| `marketplace.thumbnail` | Auto-captured | Visual preview |

**Rationale:**
- Capture metadata now, build marketplace features later
- Automatic inference reduces manual tagging burden
- Schema versioning allows evolution without breaking existing proofs

## Consequences

### Positive

- **Portfolio growth** - Each proof run adds to the portfolio, not replaces
- **Evolution tracking** - Compare proof quality over time
- **Marketplace foundation** - Rich metadata enables future features
- **Safe re-runs** - Can re-proof updated sites without losing history
- **User control** - Interactive prompt prevents accidents

### Negative

- **More files** - Each proof now has `proof.json`, plus central index
- **Longer slugs** - Date suffix adds characters to directory names
- **Migration** - Existing proofs won't have `proof.json` (acceptable - they're utility outputs)

### Neutral

- **Backward compatible** - Old proofs continue to work, just lack metadata
- **Index is optional** - Proofs work standalone; index is a convenience layer

## Alternatives Considered

### UUID-based slugs

```
proof-a3f8e2c1-9d2b
```

**Rejected because:**
- Ugly URLs, terrible for marketplace presentation
- No semantic meaning - can't tell what site it's for
- Loses the domain grouping benefit

### Version numbers (v1, v2, v3)

```
proof-gardens-dentistry-pb-v1
proof-gardens-dentistry-pb-v2
```

**Rejected because:**
- Requires tracking "max version per domain" - state complexity
- Doesn't communicate when proof was created
- Unclear semantics if v2 is deleted - reuse or skip?

### Central-only storage (no per-proof manifest)

**Rejected because:**
- Proofs become coupled to the project's `.plan/` directory
- Can't share/move proofs independently
- Single point of failure if index corrupts

### Per-proof only (no central index)

**Rejected because:**
- Listing all proofs requires filesystem scan
- Can't efficiently filter/query across proofs
- Marketplace features would be slow

## Related

- ADR-035: Permissionless Proof Pipeline Architecture
- ADR-037: GitHub Pages Deployment for Proofs
- ADR-045: GitHub Pages Full Automation
- Planning: `.plan/feat-multi-proof-marketplace-support/`
