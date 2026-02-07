---
name: chrome-extension
description: Chrome extension development expertise. Use when working with Chrome Web Store publishing, extension status checking, manifest.json configuration, or Chrome extension APIs. Provides lifecycle guidance, URL patterns, API status workflows, and common pitfalls.
---

# Chrome Extension Developer

Expert guidance for Chrome extension development and Chrome Web Store publishing.

## When to Use This Skill

Invoke when:
- Working with Chrome Web Store publishing or extension status
- Configuring `manifest.json` for a Chrome extension
- Debugging extension code or service workers
- Checking extension review status
- Troubleshooting "Item not available" errors

## Chrome Web Store Extension Lifecycle

Extensions progress through these states:

| State | Description |
|-------|-------------|
| **Draft** | Uploaded but never submitted for review |
| **Pending review** | Submitted, awaiting Google's approval (1-3 business days typical) |
| **Published** | Approved and publicly available in Chrome Web Store |
| **Rejected** | Review failed; check developer console for rejection reasons |

### State Transitions

```
Upload → Draft → Submit → Pending review → Published
                                        ↓
                                    Rejected
                                        ↓
                               Fix & Resubmit
```

## Chrome Web Store URLs

### Developer Console (always accessible to extension owner)

```
https://chrome.google.com/u/0/webstore/devconsole/{PUBLISHER_ID}
```

- Shows all your extensions and their statuses
- Works regardless of extension state

### Extension Edit Page (always accessible to extension owner)

```
https://chrome.google.com/u/0/webstore/devconsole/{PUBLISHER_ID}/{EXTENSION_ID}/edit
```

- Manage specific extension: update listing, upload new versions, view rejection reasons
- Works regardless of extension state

### Public Store Listing (ONLY works when published)

```
https://chromewebstore.google.com/detail/{EXTENSION_SLUG}/{EXTENSION_ID}
```

- What end users see when browsing the Chrome Web Store
- **CRITICAL**: This URL returns "Item not available" if:
  - Extension has never been published
  - Extension is pending review (not yet approved)
  - Extension was rejected or taken down

## Pre-flight Checks

### Before attempting to view public listing

**1. Get OAuth access token:**

```bash
ACCESS_TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "refresh_token={REFRESH_TOKEN}" \
  -d "grant_type=refresh_token" | jq -r '.access_token')
```

**2. Query extension status (V2 API):**

```bash
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://chromewebstore.googleapis.com/v2/publishers/{PUBLISHER_ID}/items/{EXTENSION_ID}:fetchStatus"
```

> **Note:** The V1.1 API is deprecated and will be removed October 2026. Use the V2 API shown above.
> V2 requires `PUBLISHER_ID` in the URL path. Service accounts are also supported.

**3. Check response fields:**

| Field | Meaning |
|-------|---------|
| `publishedItemRevisionStatus` | Status of the live/published version |
| `submittedItemRevisionStatus` | Status of pending submission (if any) |
| `uploadState` | FAILURE, IN_PROGRESS, NOT_FOUND, or SUCCESS |

**4. Decision logic:**

- If no `publishedItemRevisionStatus` → extension never published → public listing URL will not work
- If `submittedItemRevisionStatus` shows "Pending review" → no public listing exists yet → wait for approval
- Don't troubleshoot URL format until you confirm it's published

**Reference:** [Chrome Web Store API V2 docs](https://developer.chrome.com/docs/webstore/api)

## Common Gotchas

### "Public listing URL doesn't work"

**First check:** Is the extension actually published? Query the API for status.

If status is "Pending review" → no public listing exists yet. Wait for approval. Don't waste time debugging URL format.

### "Says published but listing still fails"

- **Propagation delay**: Wait 5-15 minutes after approval
- **URL format**: Chrome Web Store URLs require the extension slug (URL-friendly name) before the extension ID

### Version confusion

| Term | Meaning |
|------|---------|
| `crxVersion` | Live/published version users can install |
| Draft version | Uploaded but not submitted, or submitted but pending review |

These can differ if you uploaded a new version that hasn't been approved yet.

### Review rejection

- Check `itemError` array in API response for specific rejection reasons
- **Common causes:**
  - Policy violations
  - Missing privacy policy
  - Inadequate permissions justification
  - Single-purpose requirement not met

## Required Credentials for API Access

To programmatically check status or publish:

| Credential | Where to find |
|------------|---------------|
| `EXTENSION_ID` | Developer console URL or extension details |
| `PUBLISHER_ID` | Your developer account ID (UUID in developer console URL) |
| `CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `CLIENT_SECRET` | OAuth 2.0 client secret from Google Cloud Console |
| `REFRESH_TOKEN` | Generated via OAuth flow with `chrome_webstore` scope |

### OAuth Scope

The Chrome Web Store API requires the `https://www.googleapis.com/auth/chromewebstore` scope.

## Tools

| Tool | Purpose |
|------|---------|
| **chrome-webstore-upload-cli** | CLI for uploading and publishing (`npx chrome-webstore-upload`) |
| **Developer Console** | Web UI at `chrome.google.com/webstore/devconsole` |
| **Google Cloud Console** | Manage OAuth credentials |

## Manifest V3 Patterns

### Service Worker vs Background Page

Manifest V3 requires service workers instead of persistent background pages.

**Decision framework:**

| If you need... | Use... |
|----------------|--------|
| Persistent state | Service worker with chrome.storage |
| Event-driven logic | Service worker event listeners |
| Long-running operations | Offscreen documents or native messaging |
| DOM access in background | Offscreen documents |

**Service worker gotchas:**

- Service workers sleep after ~30 seconds of inactivity
- No `window` or `document` access
- Must re-register event listeners on wake
- Use `chrome.storage` not variables for persistent state

### Permissions Philosophy

**Request minimal permissions:**

1. Only request permissions you actually use
2. Use `activeTab` instead of broad `<all_urls>` when possible
3. Use `optional_permissions` for features not needed at install
4. Document why each permission is needed (required for review)

### Content Script Patterns

| Pattern | When to use |
|---------|-------------|
| **Static injection** (`content_scripts` in manifest) | Always need script on specific pages |
| **Programmatic injection** (`chrome.scripting.executeScript`) | Conditionally inject based on user action |
| **World: ISOLATED** (default) | Script needs protection from page |
| **World: MAIN** | Script needs to interact with page JavaScript |

### Message Passing

```
Popup ↔ Service Worker ↔ Content Script
         ↑
         ↓
      Storage
```

**Patterns:**

| From | To | Method |
|------|-----|--------|
| Popup → Service Worker | `chrome.runtime.sendMessage` |
| Service Worker → Content Script | `chrome.tabs.sendMessage` |
| Content Script → Service Worker | `chrome.runtime.sendMessage` |
| Any → Storage | `chrome.storage.local.set/get` |

## Local Development & Hot Reload

### CRITICAL: Report Reload Requirements After Changes

**After making changes to a Chrome extension project, you MUST tell the developer what reload action is needed.**

Use this template at the end of your response:

```
## To see your changes

[ACTION REQUIRED]: [specific action from matrix below]
```

Examples:
- `[ACTION REQUIRED]: Refresh the target page`
- `[ACTION REQUIRED]: Reload the extension at chrome://extensions, then refresh the page`
- `[ACTION REQUIRED]: Remove the extension and re-add it (manifest permissions changed)`

**Never leave the developer guessing.** They will waste time debugging code when the real issue is stale extension state.

### Reload Matrix

CRXJS/Vite hot reload has limitations. Use this matrix:

| What Changed | Required Action |
|--------------|-----------------|
| Content script CSS/JS (existing files) | Refresh the target page |
| Content script (new file added) | Reload extension, then refresh page |
| Popup HTML/CSS/JS | Close popup, reopen it |
| Service worker code | Reload extension |
| manifest.json (version only) | Reload extension |
| manifest.json (permissions) | **Remove extension, re-add** |
| manifest.json (content_scripts matches) | **Remove extension, re-add** |
| manifest.json (background service_worker) | **Remove extension, re-add** |
| New file referenced in manifest | **Remove extension, re-add** |

### Multiple Files Changed? Escalate to Highest Action

When you modify multiple files, report the **most severe** action required:

**Priority order (highest to lowest):**
1. Remove extension, re-add (manifest permissions/patterns/paths)
2. Reload extension + refresh page (service worker or new files)
3. Refresh the target page (content script logic)
4. Close/reopen popup (popup only)

Example: If you changed both a content script AND added a new permission to manifest.json → report "Remove extension, re-add" (not just "refresh page").

### Why Manifest Changes Require Full Reinstall

Chrome caches at install time:
- Permission grants
- Content script match patterns
- Service worker registration

Reloading the extension re-reads the manifest but **does not re-register** these cached properties. Only remove + re-add forces Chrome to re-process.

### Debugging Stale State

If changes aren't appearing:
1. Did you refresh the page? (for content scripts)
2. Did you reload the extension? (for service worker)
3. Did you remove/re-add? (for manifest changes)

**Nuclear option:** Stop dev server → `rm -rf dist/` → `npm run build` → remove extension → clear browser cache → load unpacked again.

### CRXJS: Content Script CSS Not Loading

**Symptom:** CSS referenced in manifest.json `content_scripts.css` doesn't apply.

**Cause:** CRXJS only bundles CSS from specific locations:

| Location | Works? |
|----------|--------|
| `public/styles/foo.css` | Yes - reference as `styles/foo.css` |
| `src/content/foo.css` | **No** - CRXJS ignores this |
| Imported in JS (`import './foo.css'`) | Yes - CRXJS bundles it |

**Fix:** Either move CSS to `public/` or import it in the JS file.

**Rule:** Static assets referenced directly in manifest.json → `public/`. Files processed by Vite → `src/` with imports.

## Testing & Debugging

### Load Unpacked Workflow

1. Navigate to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select extension directory
5. After changes: Click refresh icon on extension card (or remove/re-add for manifest changes)

### Service Worker Debugging

1. Go to `chrome://extensions`
2. Find your extension
3. Click "service worker" link under "Inspect views"
4. Opens DevTools for service worker context

**Key panels:**

- **Console**: Runtime errors and logs
- **Sources**: Set breakpoints in service worker code
- **Application > Service Workers**: Lifecycle state, wake/sleep events

### Common Runtime Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Extension context invalidated" | Service worker restarted | Re-establish connections, check for stale references |
| "Cannot access contents" | Missing host permissions | Add permission in manifest or use `activeTab` |
| "Receiving end does not exist" | No listener registered | Ensure content script is injected and listening |

### Testing Checklist

- [ ] Load unpacked works without errors
- [ ] Service worker starts and registers listeners
- [ ] Content scripts inject on target pages
- [ ] Popup opens and functions
- [ ] Message passing works between contexts
- [ ] Storage operations persist across restarts
- [ ] Permissions requested match actual usage

## What This Skill Does NOT Cover

- Firefox/Edge extension specifics (use their docs)
- Extension monetization strategies
- Chrome Web Store SEO optimization
- Automated testing frameworks (use Context7 for current options)

## Integration Points

This skill works alongside:
- **Context7**: Query for current Chrome extension API documentation
- **WebFetch**: Check Chrome Web Store API responses
- **Bash**: Run chrome-webstore-upload-cli commands
