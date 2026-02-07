# Local Development Guide

This document explains how to develop and debug your Chrome extension efficiently.

## Hot Reload Reality Check

This project uses Vite + CRXJS for development. The marketing pitch is "hot reload for Chrome extensions." Here's what actually happens:

| Expectation | Reality |
|-------------|---------|
| Save file → changes appear instantly | Sometimes, but not always |
| Just like React/Vue hot reload | Not quite - extensions have more moving parts |
| Never need to manually reload | You will still reload frequently |

**Bottom line:** CRXJS hot reload helps, but Chrome's extension architecture requires manual intervention for many change types.

## Reload Matrix

When you make changes, use this matrix to determine what action is needed:

| What Changed | Required Action |
|--------------|-----------------|
| Content script CSS | Refresh the target page |
| Content script JS (existing code) | Refresh the target page |
| Content script (new file added) | Reload extension, then refresh page |
| Popup HTML/CSS/JS | Close popup, reopen it |
| Service worker event listeners | Reload extension |
| Service worker internal logic | Reload extension |
| manifest.json (version) | Reload extension |
| manifest.json (permissions) | **Remove extension, re-add** |
| manifest.json (content_scripts matches) | **Remove extension, re-add** |
| manifest.json (background service_worker) | **Remove extension, re-add** |
| New file referenced in manifest | **Remove extension, re-add** |

### How to Reload

**Refresh page:**
- Just press F5 or Cmd+R on the target page

**Reload extension:**
1. Go to `chrome://extensions`
2. Find your extension
3. Click the refresh icon (circular arrow)

**Remove and re-add extension:**
1. Go to `chrome://extensions`
2. Click "Remove" on your extension
3. Click "Load unpacked"
4. Select your `dist/` directory again

## Why Manifest Changes Require Full Reinstall

Chrome caches certain manifest properties at install time:

- **Permissions** - Which APIs you can access
- **Content script match patterns** - Which pages inject your scripts
- **Service worker registration** - Where Chrome looks for your background code

When you reload an extension, Chrome re-reads the manifest but **does not re-register** these cached properties. Only removing and re-adding the extension forces Chrome to re-process the full manifest.

### Symptom: "My Permission Isn't Working"

If you added a permission to `manifest.json` and your code still gets "Permission denied":

1. Check that the permission is in `manifest.json` ✓
2. Check that the code is correct ✓
3. **Remove and re-add the extension** ← This is probably the issue

### Symptom: "Content Script Isn't Injecting on New Pages"

If you expanded `matches` in manifest.json but the script doesn't inject on the new URLs:

1. The manifest looks correct ✓
2. The URL matches the pattern ✓
3. **Remove and re-add the extension** ← Chrome is using cached patterns

## Development Workflow Recommendations

### Fast Iteration (Code Logic Only)

When iterating on logic within existing files:

```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Watch for when you need to reload
# (Dev server will log when HMR can't handle a change)
```

Refresh the page after each save.

### Slower Iteration (Manifest Changes)

When changing permissions, match patterns, or adding new files:

1. Stop the dev server (`Ctrl+C`)
2. Run `npm run build`
3. Remove extension from Chrome
4. Load unpacked from `dist/`
5. Resume development

### Nuclear Option

If things are broken and you don't know why:

1. Stop the dev server
2. `rm -rf dist/`
3. `npm run build`
4. Remove extension from Chrome
5. Clear browser cache (`Cmd+Shift+Delete` or `Ctrl+Shift+Delete`)
6. Load unpacked from `dist/`

This eliminates all caching issues and gives you a clean slate.

## Debugging

### Service Worker

1. Go to `chrome://extensions`
2. Find your extension
3. Click "service worker" under "Inspect views"
4. DevTools opens for background context

### Content Scripts

1. Open DevTools on the target page (F12)
2. Look in Console for your logs
3. In Sources panel, find your script under "Content scripts"

### Popup

1. Click your extension icon to open popup
2. Right-click inside popup → "Inspect"
3. DevTools opens for popup context

## Common Gotchas

### "Extension context invalidated"

**Cause:** Service worker restarted while you had a stale reference.

**Fix:** Reload extension and refresh the page.

### Code changes not appearing

**Checklist:**
1. Is the dev server running?
2. Did you refresh the page?
3. Did you reload the extension? (for service worker changes)
4. Did you remove/re-add the extension? (for manifest changes)

### "Cannot read property of undefined" in service worker

**Cause:** Service worker woke up from sleep and your variables were reset.

**Fix:** Use `chrome.storage.local` instead of in-memory variables for persistent state.

## Related

- [PUBLISHING.md](./PUBLISHING.md) - Chrome Web Store setup
- [RELEASING.md](./RELEASING.md) - Release workflow
