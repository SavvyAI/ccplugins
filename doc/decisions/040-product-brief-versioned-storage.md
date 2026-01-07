# 040. Product Brief Versioned Storage

Date: 2026-01-07

## Status

Accepted

## Context

The `/pro:product.brief` command originally created a single file at `.plan/product/brief.md`. This worked for greenfield products but caused confusion for mature products:

1. Running the command for a new feature produced a file suggesting it represented the entire product
2. Products with briefs created outside the system had no clear place in the index
3. ADR-031 specified "timestamped files" for versioning, but the implementation used a single file

Users creating feature briefs for existing products found the single-file approach misleading—a red herring implying completeness where none existed.

## Decision

Transform the product brief storage from single-file to index + versioned files:

### New Structure

```
.plan/product/
├── brief.md                              # Index linking to all briefs
├── briefs/
│   ├── 2026-01-07-user-analytics.md      # Timestamped individual briefs
│   └── 2026-01-05-payment-flow.md
├── validation-*.md                       # Existing validation reports
└── pitch-*.md                            # Existing pitch decks
```

### Index Format

The `brief.md` file becomes an index:

```markdown
# Product Briefs

| Date | Title | Path |
|------|-------|------|
| 2026-01-07 | User Analytics | [View](briefs/2026-01-07-user-analytics.md) |
```

### Brief Filename Pattern

`YYYY-MM-DD-{slugified-working-title}.md`

Example: `2026-01-07-user-analytics-dashboard.md`

### Migration Path

Legacy single-file briefs are migrated automatically:
1. Detect non-index `brief.md` (doesn't start with `# Product Briefs`)
2. Extract Working Title and Created date
3. Move to `briefs/` with appropriate timestamped name
4. Create fresh index

### Resolution Priority

Related commands (`product.validate`, `product.pitch`) find briefs in order:
1. Explicit file path argument
2. Most recent file in `briefs/*.md` (by filename date)
3. Legacy `brief.md` (non-index format, for backward compatibility)

## Consequences

### Positive

- **Clear versioning**: Multiple briefs coexist without confusion
- **ADR alignment**: Implements ADR-031's "timestamped files" decision
- **Feature briefs**: Adding briefs to mature products is now intuitive
- **Historical record**: Index shows evolution of product thinking
- **Backward compatible**: Legacy single-file briefs still work

### Negative

- **More files**: Directory structure is slightly more complex
- **Migration overhead**: First run after upgrade migrates existing briefs

### Neutral

- Validation and pitch commands now use "most recent" semantics
- Index file must be maintained (added/sorted on each brief creation)

## Alternatives Considered

### 1. Numbered Sequence

`brief-001.md`, `brief-002.md`, etc.

Rejected because:
- Numbers don't communicate timing
- Harder to identify specific briefs at a glance
- Date-based naming provides natural chronological ordering

### 2. Append to Single File

Add new briefs as sections in the same file.

Rejected because:
- Makes individual brief validation difficult
- Large files become unwieldy
- Harder to reference specific briefs

### 3. No Migration

Require manual migration of existing briefs.

Rejected because:
- Poor user experience
- Creates friction for existing users
- Automatic migration is deterministic and safe

## Related

- ADR-031: Product Validation Pipeline Architecture (specifies timestamped versioning)
- Planning: `.plan/fix-product-brief-versioning-confusion/`
