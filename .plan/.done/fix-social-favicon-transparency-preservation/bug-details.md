# Bug: /pro:social favicon generation loses transparency

## Severity
High (degraded experience)

## Steps to Reproduce
1. Have a project with a transparent SVG logo (e.g., `logo.svg`)
2. Run `/pro:social` on the project
3. Command generates favicon using: `magick logo.svg -resize 32x32 app/favicon.ico`
4. View site in browser - favicon shows white background bleed on inactive tabs

## Expected Behavior
Favicon should preserve transparency from the source SVG, appearing correctly on both active tabs (white background) and inactive tabs (light blue background in Chrome).

## Actual Behavior
Favicon has white/opaque background instead of transparent, causing visible "bleed" on inactive tabs where the browser uses a different background color.

## Environment
- Browser: Chrome (macOS)
- Source: Transparent SVG logo
- Generated: favicon.ico via ImageMagick
- Command file: `pro/commands/social.md`

## Root Cause Analysis

### Location
`pro/commands/social.md` - Phase 3.3: Generate Icons

### Issue
The ImageMagick commands don't include `-background none` flag to preserve alpha channel transparency.

**Current commands (lines 196-217):**
```bash
# Missing -background none flag
magick logo.svg -resize 32x32 app/favicon.ico
magick logo.svg -resize 180x180 app/apple-icon.png
```

**Why this causes the bug:**
When ImageMagick processes SVG files, it may composite the image onto a default white background if not explicitly told to preserve transparency. The `-background none` flag tells ImageMagick to keep the alpha channel intact.

### Evidence
The screenshot shows:
- Active tab: favicon looks correct (white tab background matches favicon's white fill)
- Inactive tab: white "bleed" visible around favicon edges (light blue tab background reveals the non-transparent background)

## Related ADR
ADR-033: Social Sharing Meta-Command Architecture
- Documents ImageMagick as a dependency for icon generation
- Does NOT specify transparency preservation requirements
