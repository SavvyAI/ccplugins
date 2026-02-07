---
description: "New Chrome extension? → Scaffolds production-ready project from proven template → Vite+CRXJS, TypeScript, CWS publishing"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

## Chrome Extension Scaffold

Scaffolds a Chrome extension project with production-proven tooling:
- **Build**: Vite + CRXJS (hot reload, TypeScript)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Publishing**: Chrome Web Store automation (Makefile, CI/CD, release scripts)

## Mode Detection

1. **Check for existing extension project**:
   - Look for `public/manifest.json` or `manifest.json` with `manifest_version`
   - Look for `package.json` with `@crxjs/vite-plugin` dependency

2. **If existing extension detected** → Delta Mode
3. **If empty/non-extension directory** → Greenfield Mode

---

## Greenfield Mode

When no existing extension is detected:

### Step 1: Gather Information

Use AskUserQuestion to collect:

```
Question 1: "What is the extension name?"
Header: "Name"
Options:
- Label: "Use directory name" / Description: "Derive from current directory: {dirname}"
- Label: "Custom name" / Description: "I'll provide a custom name"

Question 2: "What does your extension do?"
Header: "Description"
(Free text - use "Other" option)

Question 3: "What's your GitHub username?"
Header: "GitHub"
Options:
- Label: "Auto-detect" / Description: "Use git config: {detected-username}"
- Label: "Custom" / Description: "I'll provide a different username"
```

### Step 2: Template Variables

Compute these values from user input:
- `extensionName`: kebab-case (e.g., `my-cool-extension`)
- `extensionDisplayName`: Title Case (e.g., `My Cool Extension`)
- `extensionDescription`: One-line description
- `githubUsername`: For URLs and privacy policy links
- `extensionId`: Empty string (filled after first CWS upload)

### Step 3: Copy and Process Templates

Template location: `pro/commands/_templates/chrome-extension/`

For each file in the template directory:
1. If filename ends with `.hbs`:
   - Read the file
   - Replace all `{{variableName}}` with computed values using Handlebars
   - Write to destination without `.hbs` extension
2. Otherwise:
   - Copy file as-is

**Template files requiring Handlebars processing:**
- `package.json.hbs` → `package.json`
- `public/manifest.json.hbs` → `public/manifest.json`
- `Makefile.hbs` → `Makefile`
- `e2e/extension-loading.spec.ts.hbs` → `e2e/extension-loading.spec.ts`

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Initialize Git (if not already)

```bash
git init  # only if .git doesn't exist
git add .
git commit -m "chore: scaffold chrome extension"
```

### Step 6: Next Steps

Display:

```
## Extension scaffolded successfully!

### Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production

### Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests (requires headed Chrome)

### Important: Read docs/DEVELOPMENT.md
Hot reload has limitations. Some changes require extension reload or remove/re-add.
See docs/DEVELOPMENT.md for the reload matrix to avoid debugging frustration.

### Next Steps
1. Read docs/DEVELOPMENT.md (understand hot reload limitations)
2. Add your extension icons to public/icons/ (16x16, 48x48, 128x128 PNG)
3. Update public/manifest.json with your target URLs and permissions
4. Implement your content script in src/content/index.ts
5. See docs/PUBLISHING.md for Chrome Web Store setup

### Chrome Web Store Publishing
After manual first publish, set up automation:
1. cp .env.example .env
2. Fill in OAuth credentials (see docs/PUBLISHING.md)
3. make release  # Automated versioning and publishing
```

---

## Delta Mode

When an existing extension project is detected:

### Step 1: Identify Missing Files

Compare project against expected scaffold structure:

**Expected files:**
- `.env.example`
- `.gitignore` (check for extension-specific entries)
- `Makefile` (check for cws-* targets)
- `docs/PUBLISHING.md`
- `docs/RELEASING.md`
- `scripts/release.sh`
- `.github/workflows/publish.yml`
- `playwright.config.ts`
- `e2e/` directory

### Step 2: Show Delta Report

```
## Scaffold Delta Report

Your extension is missing these files from the standard scaffold:

| File | Purpose |
|------|---------|
| Makefile | CWS publishing automation (make release, make upload) |
| scripts/release.sh | One-command release with version bump |
| .github/workflows/publish.yml | CI/CD for automatic CWS publishing |
| docs/PUBLISHING.md | OAuth setup guide for CWS API |

Would you like to add these files?
```

### Step 3: Interactive Addition

For each missing file, ask:
- "[A]dd this file"
- "[S]kip"
- "[A]dd all remaining"
- "[Q]uit"

When adding:
1. If file requires templatization, gather required variables first
2. Process with Handlebars
3. Write to destination
4. Report: "Added {filename}"

### Step 4: Conflict Handling

If a file exists but differs from template:
- Show diff summary (not full diff)
- Ask: "File exists but differs. [O]verwrite / [S]kip / [M]erge manually?"
- For Makefile: offer to append missing targets instead of overwrite

---

## Template Processing

Use Node.js with Handlebars for template processing:

```javascript
const Handlebars = require('handlebars');
const template = Handlebars.compile(templateContent);
const result = template({
  extensionName,
  extensionDisplayName,
  extensionDescription,
  githubUsername,
  extensionId
});
```

**Note**: If Handlebars is not available, install it:
```bash
npm install --save-dev handlebars
```

Or use inline JavaScript string replacement as fallback:
```javascript
content
  .replace(/\{\{extensionName\}\}/g, extensionName)
  .replace(/\{\{extensionDisplayName\}\}/g, extensionDisplayName)
  // ... etc
```

---

## File Inventory

Files in `pro/commands/_templates/chrome-extension/`:

```
.env.example                    # CWS credential template
.gitignore                      # Extension-specific ignores
.github/workflows/publish.yml   # CI/CD workflow
docs/DEVELOPMENT.md             # Hot reload limitations and reload matrix
docs/PUBLISHING.md              # CWS setup guide
docs/RELEASING.md               # Release workflow docs
e2e/extension-loading.spec.ts.hbs  # E2E test template
e2e/fixtures/.gitkeep
Makefile.hbs                    # CWS automation (templatized)
package.json.hbs                # Dependencies (templatized)
playwright.config.ts            # E2E config
public/icons/icon{16,48,128}.png  # Placeholder icons (blue squares)
public/manifest.json.hbs        # Manifest V3 (templatized)
public/styles/content.css       # Injected styles (in public for Vite)
scripts/release.sh              # Release automation
src/content/index.ts            # Content script skeleton
tsconfig.json                   # TypeScript config
vite.config.ts                  # Vite + CRXJS setup
```
