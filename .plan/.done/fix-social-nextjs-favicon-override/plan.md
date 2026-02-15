# Fix Plan: /pro:social Next.js App Router Favicon Override

## Summary
Update `/pro:social` command to place favicons in the correct location based on detected framework, specifically handling Next.js App Router's `app/` directory convention.

## Changes Required

### 1. Update Phase 1.3 - Scan Existing Metadata (Assets section)

Add framework-aware favicon locations:

**Before:**
```
- Favicon (`public/favicon.ico`, `public/favicon.png`)
- Apple touch icon (`public/apple-touch-icon.png`)
```

**After:**
```
- Favicon (framework-dependent):
  - Next.js App Router: `app/favicon.ico`, `app/icon.png`
  - All others: `public/favicon.ico`, `public/favicon.png`
- Apple touch icon (framework-dependent):
  - Next.js App Router: `app/apple-icon.png`
  - All others: `public/apple-touch-icon.png`
```

### 2. Update Phase 3 - Favicon & Touch Icon Generation

#### 3.1 Add framework-aware destination logic

Insert before icon generation:

```markdown
#### 3.1.5 Determine Icon Destination

Based on detected framework:

| Framework | Favicon Location | Apple Icon Location |
|-----------|------------------|---------------------|
| Next.js App Router | `app/favicon.ico` | `app/apple-icon.png` |
| Next.js Pages Router | `public/favicon.ico` | `public/apple-touch-icon.png` |
| Vite | `public/favicon.ico` | `public/apple-touch-icon.png` |
| Plain HTML | `public/favicon.ico` | `public/apple-touch-icon.png` |

**Important for Next.js App Router:**
If `app/favicon.ico` already exists (e.g., default Vercel favicon), it MUST be replaced.
The `public/favicon.ico` will NOT override `app/favicon.ico`.
```

#### 3.2 Update icon generation commands

**Before:**
```bash
# Favicon (multi-size ICO)
magick logo.svg -resize 32x32 public/favicon.ico

# Apple touch icon
magick logo.svg -resize 180x180 public/apple-touch-icon.png
```

**After (with framework detection):**
```markdown
**For Next.js App Router:**
```bash
# Favicon - MUST go in app/ to override default
magick logo.svg -resize 32x32 app/favicon.ico

# Apple touch icon - use app/ naming convention
magick logo.svg -resize 180x180 app/apple-icon.png
```

**For all other frameworks:**
```bash
# Favicon
magick logo.svg -resize 32x32 public/favicon.ico

# Apple touch icon
magick logo.svg -resize 180x180 public/apple-touch-icon.png
```
```

### 3. Update Phase 4.2 - Apply Metadata

The Next.js App Router metadata example already uses:
```typescript
icons: {
  icon: '/favicon.ico',
  apple: '/apple-touch-icon.png',
},
```

Update to reflect the actual file location:
```typescript
icons: {
  icon: '/favicon.ico',  // served from app/favicon.ico
  apple: '/apple-icon.png',  // served from app/apple-icon.png
},
```

### 4. Update Phase 6.1 - Summary Output

Add note about framework-specific placement:
```
Changes made:
  [✓] Favicon generated: app/favicon.ico (Next.js App Router)
  [✓] Apple touch icon: app/apple-icon.png (Next.js App Router)
```

## Files to Modify
- `pro/commands/social.md`

## Testing
1. Run `/pro:social` on a fresh Next.js App Router project with default Vercel favicon
2. Verify `app/favicon.ico` is replaced with custom favicon
3. Verify `app/apple-icon.png` is created
4. Verify favicon appears correctly in browser without cache clearing tricks
5. Run `/pro:social` on a Vite project to ensure no regression (should still use `public/`)

## Definition of Done
- [x] Phase 1.3 audit checks correct locations based on framework
- [x] Phase 3 generates icons to correct location based on framework
- [x] Phase 4.2 metadata example reflects actual file paths
- [x] Phase 6.1 summary shows framework-specific paths
- [x] No regressions for non-Next.js App Router projects (instructions preserved for Vite/HTML)
