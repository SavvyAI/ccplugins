# Bug: /pro:social doesn't handle Next.js App Router favicon override

## Severity
Critical (blocks work)

## Steps to Reproduce
1. Run `/pro:social` on a Next.js App Router project (has `app/layout.tsx`)
2. Command generates favicon to `public/favicon.ico`
3. Browser still shows default Vercel favicon

## Expected Behavior
The `/pro:social` command should detect Next.js App Router projects and place favicons in `app/favicon.ico` (which takes precedence over `public/favicon.ico`).

## Actual Behavior
Favicon placed in `public/` but Next.js App Router uses `app/favicon.ico` which overrides it, causing the default Vercel favicon to persist.

## Environment
- Framework: Next.js App Router
- Command: `/pro:social` skill in ccplugins

## Root Cause Analysis

### Location
`pro/commands/social.md` - Phase 3: Favicon & Touch Icon Generation

### Issue
The command hardcodes `public/` as the favicon destination without considering Next.js App Router conventions.

**Current behavior (lines 177-187):**
```bash
magick logo.svg -resize 32x32 public/favicon.ico
magick logo.svg -resize 180x180 public/apple-touch-icon.png
```

**Next.js App Router convention:**
- `app/favicon.ico` takes precedence over `public/favicon.ico`
- `app/icon.png` or `app/icon.svg` for dynamic icons
- `app/apple-icon.png` for Apple touch icon

### Why This Matters
Next.js App Router projects scaffolded with `create-next-app` include a default `app/favicon.ico` (Vercel logo). Even when `/pro:social` generates a custom favicon to `public/favicon.ico`, the `app/favicon.ico` takes precedence, making the custom favicon invisible.

## Related ADR
ADR-033: Social Sharing Meta-Command Architecture
- Line 54 mentions framework detection for Next.js App Router
- Does NOT document favicon placement differences by framework
