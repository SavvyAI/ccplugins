# Permissionless Proof CHECK + DX Improvements

## Branch

`feat/permissionless-proof-check-dx`

## Summary

Evolve `/pro:permissionless-proof` from a static visual parity generator into an observable, reproducible customer-experience evidence engine while removing operator friction during deployment and review.

---

## Scope

### In Scope

1. **Interaction Audit (CHECK extension)** - Read-only interaction simulation on source site
2. **Viewport Extension** - Add tablet (768×1024), optional WebKit pass
3. **Dead-End Detection** - Identify states with no clear next action
4. **Trust/Credibility Signals** - Lightweight detection of obvious issues
5. **Operator Translation Layer** - Plain-language translations for technical issues
6. **Web-Accessible Evidence Index** - Screenshots exposed at `/evidence/` on deployed proof
7. **Domain-Scoped Output Directory** - `proof-{domain-slug}` naming
8. **Git Init by Default** - Auto-initialize repo with initial commit
9. **Vite Base Path Fix** - Programmatic base path for GitHub Pages subpath
10. **Enhanced Package Scripts** - build, deploy, deploy:init, open
11. **Default .gitignore** - Generated automatically

### Out of Scope

- Replacing or redesigning parity engine
- Full-site crawling
- Lighthouse/SEO/scoring systems
- New frameworks or hosting providers
- Refactoring unrelated code

---

## Design Decisions

### D1: Interaction Audit Timing

**Decision:** Run interaction audit BEFORE screenshot capture

**Rationale:**
- Issues visible in screenshots (broken mobile menu captured)
- Evidence is undeniable when visual
- Non-destructive audit has low crash risk
- 30-60s additional time is acceptable for proof density

### D2: Output Directory Naming

**Decision:** `proof-{domain-slug}`

**Algorithm:**
```
Input:  https://www.ramanidentistryfl.com
Step 1: Extract domain → ramanidentistryfl.com
Step 2: Remove TLD → ramanidentistryfl
Step 3: Insert hyphens at word boundaries → ramani-dentistry-fl
Step 4: Apply prefix → proof-ramani-dentistry-fl
```

**Rationale:**
- Explicit intent
- GitHub Pages URLs read cleanly
- Directory listings group naturally
- Zero operator input required

### D3: npm open Script

**Decision:** Open browser + copy URL to clipboard

**Rationale:**
- URL available for immediate paste into email/message
- No need to remember GitHub Pages URL format

### D4: WebKit Pass

**Decision:** Graceful degradation (skip if unavailable, log warning)

**Rationale:**
- Don't block proof generation on browser availability
- Log warning so operator knows coverage was partial

---

## Implementation Phases

### Phase 1: DX Improvements (Foundation)

Files to modify:
- `pro/commands/permissionless-proof.md`

Changes:
1. **Domain slug derivation function** (new section after Pre-Execution Validation)
2. **Output directory default** - Change from `.` to `proof-{domain-slug}`
3. **Vite base path configuration** - Add to Phase 2.1 scaffold
4. **Package scripts enhancement** - Update Phase 2.2
5. **Git init + initial commit** - Add to end of Phase 2
6. **Default .gitignore generation** - Add to Phase 2.4

### Phase 2: Interaction Audit (CHECK Extension)

Files to modify:
- `pro/commands/permissionless-proof.md`

Changes:
1. **New Phase 1.5: CHECK** - Insert between ACQUIRE and screenshot capture
2. **Interaction coverage definitions**
   - Navigation click testing
   - CTA click testing
   - Scroll behavior testing
   - Form focus testing (non-destructive)
   - Modal/accordion testing
3. **Failure condition logging**
4. **Console error capture**
5. **Artifact generation** (interaction-log.json, before/after screenshots)

### Phase 3: Viewport Extension

Files to modify:
- `pro/commands/permissionless-proof.md`

Changes:
1. **Tablet viewport** - Add 768×1024 to ACQUIRE phase
2. **WebKit pass** - Optional second browser pass
3. **Viewport-specific issue logging**

### Phase 4: Detection Capabilities

Files to modify:
- `pro/commands/permissionless-proof.md`

Changes:
1. **Dead-end detection** - After interaction audit
2. **Trust signal detection** - Lightweight checks
3. **Operator translation layer** - Dual output format

### Phase 5: Evidence Index

Files to modify:
- `pro/commands/permissionless-proof.md`

Changes:
1. **Evidence directory structure** - `public/evidence/`
2. **Evidence index generation** - Static HTML index
3. **Quiet link injection** - Small link in generated site

### Phase 6: ADR Documentation

Files to create:
- `doc/decisions/039-permissionless-proof-check-extension.md`

---

## Detailed Implementation Steps

### Step 1: Domain Slug Derivation

Add after Pre-Execution Validation in `permissionless-proof.md`:

```markdown
### Derive Domain Slug

Generate a URL-safe, human-readable directory name:

\`\`\`bash
# Extract domain, remove www and TLD
DOMAIN_RAW=$(echo "$URL" | sed -E 's|https?://||' | sed 's|/.*||' | sed 's/^www\.//')
DOMAIN_NO_TLD=$(echo "$DOMAIN_RAW" | sed -E 's/\.[a-z]{2,}$//')

# Convert camelCase and concatenated words to hyphenated
# Insert hyphens at word boundaries (lowercase-uppercase, letter-number)
DOMAIN_SLUG=$(echo "$DOMAIN_NO_TLD" | sed -E 's/([a-z])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Apply prefix
OUTPUT_DIR_DEFAULT="proof-${DOMAIN_SLUG}"

# Use user-specified or default
if [ -z "$OUTPUT_DIR" ] || [ "$OUTPUT_DIR" = "." ]; then
  OUTPUT_DIR="$OUTPUT_DIR_DEFAULT"
fi
\`\`\`
```

### Step 2: Vite Base Path Fix

Update Phase 2.1 scaffold:

```markdown
### 2.1 Create Project Scaffold

After `npm create vite@latest`:

Write `vite.config.ts`:

\`\`\`typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/${OUTPUT_DIR}/',  // GitHub Pages subpath
})
\`\`\`
```

### Step 3: Enhanced Package Scripts

Update Phase 2.2:

```markdown
### 2.2 Add Package Scripts

Update `package.json`:

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && npx gh-pages -d dist",
    "deploy:init": "gh repo create ${OUTPUT_DIR} --public --source=. --push && npm run deploy",
    "open": "REPO_URL=$(gh repo view --json url -q '.url' 2>/dev/null || echo '') && PAGES_URL=$(echo $REPO_URL | sed 's|github.com/\\([^/]*\\)/|\\1.github.io/|') && echo $PAGES_URL | pbcopy && open $PAGES_URL"
  }
}
\`\`\`

**Note:** The `open` script:
1. Gets repo URL via `gh repo view`
2. Converts to GitHub Pages URL format
3. Copies URL to clipboard (pbcopy on macOS)
4. Opens in default browser
```

### Step 4: Git Init + Initial Commit

Add after Phase 2.11 (Build and Verify):

```markdown
### 2.12 Initialize Git Repository

\`\`\`bash
cd "$OUTPUT_DIR"

# Check if git is available
if command -v git &> /dev/null; then
  # Initialize if not already a git repo
  if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: proof scaffold for ${DOMAIN}

Generated by /pro:permissionless-proof
Source: ${URL}"
  fi
else
  echo "Warning: git not available, skipping repository initialization"
fi
\`\`\`
```

### Step 5: Default .gitignore

Add to Phase 2.4:

```markdown
### 2.4 Create Directory Structure and Config Files

\`\`\`bash
mkdir -p src/components
mkdir -p src/assets/images
mkdir -p public/evidence
\`\`\`

Write `.gitignore` (if not exists):

\`\`\`
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vite/
\`\`\`
```

### Step 6: Interaction Audit (Phase 1.5)

Insert new section after Phase 1.5 (Auth Wall Detection):

```markdown
---

## Phase 1.5: CHECK (Interaction Audit)

> Purpose: Surface real user-facing failures on the source site through read-only interaction simulation.

**ultrathink:** This phase requires careful interaction analysis. Attempt clicks, scrolls, and focus events systematically across viewports. Log failures with precise technical details and operator-friendly translations.

### 1.5.1 Viewport Preparation

Set up viewports for testing:

\`\`\`
VIEWPORTS=[
  {name: "desktop", width: 1440, height: 900},
  {name: "tablet", width: 768, height: 1024},
  {name: "mobile", width: 375, height: 812}
]
\`\`\`

### 1.5.2 Navigation Testing

For each viewport:

1. Identify all visible top-level navigation links
2. Attempt click on each link:
   - Record if navigation occurs
   - Record if no-op (click produces no change)
   - Capture console errors immediately after click
3. If mobile menu toggle visible:
   - Attempt toggle click
   - Record if menu opens/closes
   - Capture screenshot of open state

**Failure conditions:**
- Link click produces no navigation and no UI feedback
- Mobile menu toggle does not open menu
- Navigation link unreachable on mobile but works on desktop

### 1.5.3 CTA Testing

For each viewport:

1. Identify all visible CTAs (buttons with action intent)
2. For each CTA:
   - Check if element is clickable (not obstructed)
   - Check tap target size (minimum 44×44px for mobile)
   - Attempt hover (desktop) to verify state change
   - Capture before/after screenshots if failure detected

**Failure conditions:**
- CTA unreachable due to z-index overlap
- CTA hidden or clipped at viewport
- CTA tap target below minimum size on mobile
- CTA click produces no feedback

### 1.5.4 Scroll Testing

For each viewport:

1. Scroll full page height
2. During scroll, detect:
   - Sticky elements blocking content
   - Horizontal overflow (horizontal scrollbar on mobile)
   - Layout shifts during scroll
3. Record scroll position of issues

**Failure conditions:**
- Sticky header covers content when scrolled
- Horizontal scroll required on mobile
- Visible layout shift during scroll

### 1.5.5 Form Testing (Non-Destructive)

For visible forms:

1. Focus first available input
2. On mobile: check for keyboard overlap
3. Check for placeholder text and labels
4. Do NOT submit or enter data

**Failure conditions:**
- Input focus triggers no visual feedback
- Mobile keyboard overlaps form submit button
- Form lacks visible labels or placeholders

### 1.5.6 Interactive UI Testing

For menus, modals, accordions:

1. Attempt open trigger (click/tap)
2. Record if UI element appears
3. Capture before/after screenshots

**Failure conditions:**
- Menu/modal/accordion fails to open
- Open state clips outside viewport

### 1.5.7 Dead-End Detection

After interaction testing:

1. Identify pages/states with no visible CTA, form, or onward link
2. Log as: "User reaches this state with no clear next step"

### 1.5.8 Trust Signal Detection

Lightweight checks only:

1. Footer copyright year (compare to current year)
2. Privacy/Terms links (check if present and not broken)
3. SSL indicator (should be HTTPS)
4. Forms without confirmation feedback pattern

**Detection only when obvious.** Do not over-index.

### 1.5.9 Console Error Capture

Throughout interaction testing:

\`\`\`
mcp__plugin_pro_playwright__browser_console_messages: {level: "error"}
\`\`\`

Log errors that occur immediately following interactions.

### 1.5.10 Generate Interaction Artifacts

Save to `{OUTPUT_DIR}/screenshots/check/`:

\`\`\`
check/
├── interaction-log.json       # Timestamped log of all interactions
├── issues.json                # Detected issues with translations
├── desktop/
│   ├── nav-{index}-before.png
│   ├── nav-{index}-after.png
│   └── ...
├── tablet/
│   └── ...
└── mobile/
    └── ...
\`\`\`

**interaction-log.json structure:**

\`\`\`json
{
  "timestamp": "ISO-8601",
  "source": "{url}",
  "viewports": ["desktop", "tablet", "mobile"],
  "interactions": [
    {
      "id": "nav-001",
      "viewport": "mobile",
      "action": "click",
      "target": "Mobile menu toggle",
      "result": "no_change",
      "consoleErrors": [],
      "screenshots": {
        "before": "mobile/nav-001-before.png",
        "after": "mobile/nav-001-after.png"
      }
    }
  ]
}
\`\`\`

**issues.json structure:**

\`\`\`json
{
  "issues": [
    {
      "id": "issue-001",
      "area": "Navigation",
      "viewport": "mobile",
      "technical": "Mobile menu toggle click produces no state change",
      "operator": "Mobile visitors cannot open the navigation menu",
      "severity": "high",
      "evidence": {
        "screenshot": "mobile/nav-001-after.png",
        "consoleError": null
      }
    }
  ]
}
\`\`\`

### 1.5.11 CHECK Summary

Present findings:

\`\`\`
CHECK Phase Complete
────────────────────────────────────────

Source: {url}

Issues Detected: {count}

Desktop:
  • {issue description} [{severity}]

Tablet:
  • {issue description} [{severity}]

Mobile:
  • {issue description} [{severity}]

Dead Ends: {count}
Trust Signals: {count} issues

Evidence saved to: screenshots/check/

────────────────────────────────────────
\`\`\`

**Note:** CHECK phase is informational. Proceed to screenshot capture regardless of findings.
```

### Step 7: Evidence Index Generation

Add new section after Phase 5 (OUTPUT):

```markdown
### 5.2 Generate Evidence Index

Create a static evidence viewer at `public/evidence/index.html`:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evidence - {DOMAIN}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #111; color: #fff; padding: 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    .section { margin-bottom: 2rem; }
    .section-title { font-size: 0.875rem; color: #888; margin-bottom: 0.5rem; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem; }
    .thumb { aspect-ratio: 16/9; overflow: hidden; border-radius: 4px; cursor: pointer; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
    .thumb:hover img { transform: scale(1.05); }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; }
    .modal.active { display: flex; align-items: center; justify-content: center; }
    .modal img { max-width: 95vw; max-height: 95vh; }
    .close { position: absolute; top: 1rem; right: 1rem; color: #fff; font-size: 2rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Evidence: {DOMAIN}</h1>

  <div class="section">
    <div class="section-title">Source Screenshots</div>
    <div class="grid" id="source-grid"></div>
  </div>

  <div class="section">
    <div class="section-title">Interaction Audit</div>
    <div class="grid" id="check-grid"></div>
  </div>

  <div class="section">
    <div class="section-title">Parity Iterations</div>
    <div class="grid" id="parity-grid"></div>
  </div>

  <div class="modal" id="modal">
    <span class="close" onclick="closeModal()">&times;</span>
    <img id="modal-img" src="" alt="">
  </div>

  <script>
    const screenshots = {SCREENSHOTS_JSON};

    function render(containerId, images) {
      const grid = document.getElementById(containerId);
      images.forEach(img => {
        const div = document.createElement('div');
        div.className = 'thumb';
        div.innerHTML = \`<img src="\${img.path}" alt="\${img.name}" onclick="openModal('\${img.path}')">\`;
        grid.appendChild(div);
      });
    }

    function openModal(src) {
      document.getElementById('modal-img').src = src;
      document.getElementById('modal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('active');
    }

    document.getElementById('modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
    document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };

    render('source-grid', screenshots.source || []);
    render('check-grid', screenshots.check || []);
    render('parity-grid', screenshots.parity || []);
  </script>
</body>
</html>
\`\`\`

Copy screenshots to public/evidence/:

\`\`\`bash
cp -r screenshots/source public/evidence/source
cp -r screenshots/check public/evidence/check
cp -r screenshots/verify-iterations public/evidence/parity
\`\`\`

Generate screenshots manifest:

\`\`\`bash
# Generate JSON manifest of all screenshots
find public/evidence -name "*.png" -o -name "*.jpg" | while read f; do
  echo "{\"path\": \"${f#public/evidence/}\", \"name\": \"$(basename $f)\"}"
done | jq -s '{source: [.[] | select(.path | startswith("source"))], check: [.[] | select(.path | startswith("check"))], parity: [.[] | select(.path | startswith("parity"))]}' > public/evidence/screenshots.json
\`\`\`

Inject manifest into index.html (replace `{SCREENSHOTS_JSON}` placeholder).
```

### Step 8: Quiet Link in Generated Site

Add to Phase 4.9 or create new section:

```markdown
### 4.10 Add Evidence Link

In `src/components/Footer.tsx`, add a small, unobtrusive link:

\`\`\`tsx
<a
  href="/evidence/"
  className="text-xs text-gray-400 hover:text-gray-300"
>
  View evidence
</a>
\`\`\`

Place at the bottom of the footer, after copyright.
```

---

## Files Modified

| File | Change Type |
|------|-------------|
| `pro/commands/permissionless-proof.md` | Major update |
| `doc/decisions/039-permissionless-proof-check-extension.md` | New |

---

## Testing Strategy

1. **Dry run on known problematic site** - Use a site with known mobile issues
2. **Verify artifact generation** - Check all JSON and screenshot outputs
3. **Deploy and verify /evidence/** - Confirm evidence index works on GitHub Pages
4. **Verify npm run open** - Check URL opens and copies to clipboard
5. **Cross-browser check** - Verify WebKit graceful degradation

---

## Success Criteria

- [ ] System consistently produces 3-7 indisputable user-observable issues
- [ ] At least one issue is mobile-specific
- [ ] At least one issue is interaction-based
- [ ] User can deploy and open the proof site with a single command
- [ ] Operator never needs to recall GitHub Pages conventions manually
- [ ] Evidence accessible from phone mid-conversation

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Interaction audit causes page state changes | Low | Read-only operations only, no form submissions |
| WebKit unavailable on most systems | Medium | Graceful degradation, logged warning |
| Domain slug derivation edge cases | Low | Robust regex, fallback to sanitized raw domain |
| Evidence index too large for mobile | Low | Thumbnail grid, lazy loading |

---

## Related ADRs

- ADR-035: Permissionless Proof Pipeline Architecture (parent)
- ADR-036: Auto Visual Parity Verification (unchanged)
- ADR-037: GitHub Pages Deployment (enhanced)
- ADR-039: Permissionless Proof CHECK Extension (new)
