# Fix Plan: /pro:social Favicon Transparency Preservation

## Summary
Add `-background none` flag to all ImageMagick commands in `/pro:social` to preserve alpha channel transparency when converting SVG logos to favicon.ico and PNG icons.

## Root Cause
ImageMagick commands use simple `-resize` without explicitly preserving transparency:
```bash
magick logo.svg -resize 32x32 app/favicon.ico  # Loses transparency
```

## Fix
Add `-background none` flag before resize to preserve alpha channel:
```bash
magick logo.svg -background none -resize 32x32 app/favicon.ico  # Preserves transparency
```

## Changes Required

### Update Phase 3.3 - Generate Icons

**Lines 196-201 (Next.js App Router):**

Before:
```bash
magick logo.svg -resize 32x32 app/favicon.ico
magick logo.svg -resize 180x180 app/apple-icon.png
```

After:
```bash
magick logo.svg -background none -resize 32x32 app/favicon.ico
magick logo.svg -background none -resize 180x180 app/apple-icon.png
```

**Lines 205-210 (Other frameworks):**

Before:
```bash
magick logo.svg -resize 32x32 public/favicon.ico
magick logo.svg -resize 180x180 public/apple-touch-icon.png
```

After:
```bash
magick logo.svg -background none -resize 32x32 public/favicon.ico
magick logo.svg -background none -resize 180x180 public/apple-touch-icon.png
```

**Lines 214-216 (PWA icons):**

Before:
```bash
magick logo.svg -resize 192x192 public/icon-192.png
magick logo.svg -resize 512x512 public/icon-512.png
```

After:
```bash
magick logo.svg -background none -resize 192x192 public/icon-192.png
magick logo.svg -background none -resize 512x512 public/icon-512.png
```

## Files to Modify
- `pro/commands/social.md`

## Testing
1. Run `/pro:social` on a project with a transparent SVG logo
2. Verify generated favicon.ico has transparent background
3. View in browser - confirm no white bleed on inactive tabs
4. Verify PNG icons (apple-icon, PWA) also preserve transparency

## Definition of Done
- [x] All ImageMagick commands include `-background none` flag (6 commands updated)
- [x] Favicon preserves transparency
- [x] PNG icons preserve transparency
- [x] No regressions in non-transparent logo handling
