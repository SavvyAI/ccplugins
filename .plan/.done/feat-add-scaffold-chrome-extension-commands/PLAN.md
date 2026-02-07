# /pro:scaffold.chrome-extension Implementation Plan

## Overview

Create a `/pro:scaffold.*` namespace of commands, starting with `/pro:scaffold.chrome-extension` that extracts reusable, non-app-specific scaffolding from an exemplar Chrome extension project.

## Related ADRs

- **ADR-014**: Skills Directory for Bundled Agent Skills - establishes `skills/` pattern
- **ADR-044**: Chrome Extension Developer Skill - existing skill for extension expertise (not scaffolding)
- **ADR-010**: Bundled Bin Assets for Setup Commands - pattern for bundled scripts/templates

## Related Backlog

- **#90** (open): "Pattern-aware scaffold command" - different focus (pattern detection for existing projects vs. greenfield scaffolding)

## Exemplar Analysis: browser-extension-conversation-titles-chatgpt

### Files Identified as Scaffoldable (Non-App-Specific)

| File | Purpose | Templatization Needed |
|------|---------|----------------------|
| `package.json` | Build tooling, CWS CLI scripts | Yes - name, description, version |
| `Makefile` | CWS publishing, development | Minimal - privacy URL only |
| `.gitignore` | Standard Chrome extension ignores | None |
| `tsconfig.json` | TypeScript config for extensions | None |
| `vite.config.ts` | Vite + CRXJS plugin setup | None |
| `playwright.config.ts` | E2E testing config | None |
| `.env.example` | CWS credential template | None |
| `docs/PUBLISHING.md` | CWS publishing guide | None |
| `docs/RELEASING.md` | Release workflow documentation | None |
| `scripts/release.sh` | Automated release script | None |
| `.github/workflows/publish.yml` | CI/CD for CWS publishing | None |
| `public/manifest.json` | Manifest V3 skeleton | Yes - name, description, permissions |
| `e2e/` directory structure | Test structure with fixtures | Yes - spec file content |

### Files Explicitly App-Specific (NOT scaffoldable)

- `src/` - All source code (content scripts, background, options)
- `public/icons/` - Extension icons
- `public/_locales/` - i18n messages (content, not structure)
- `store/` - Chrome Web Store assets (screenshots, etc.)
- `README.md` - Project-specific documentation
- `.plan/` - Project-specific planning artifacts

## Requirements Clarification

### Greenfield Mode (New Extension)
When run in an empty/new directory:
1. Interactive prompts for extension name, description, permissions
2. Copy all scaffoldable files
3. Create minimal `src/content/index.ts` skeleton
4. Create minimal `public/manifest.json` with user inputs
5. Run `npm install`
6. Provide next steps guidance

### Delta Mode (Existing Extension)
When run in an existing extension project:
1. Detect existing `manifest.json` or `package.json` with `@crxjs/vite-plugin`
2. Compare project structure against scaffold template
3. Show delta: "You're missing these files/configs: ..."
4. Interactive: "Add [file]? (Y/n)" for each missing item
5. Never overwrite existing files without explicit confirmation

## Decisions Made

1. **Template storage**: Bundled in `pro/commands/_templates/chrome-extension/` (follows ADR-006)
2. **Relationship to backlog #90**: Deferred - build chrome-extension first, revisit unification later
3. **Template format**: Handlebars with `{{VAR}}` syntax
   - Battle-tested library, no custom bugs to debug
   - Supports conditionals if needed later
   - Well-documented, familiar to most developers

## Implementation Steps

### Phase 1: Template Extraction
1. Create `pro/commands/_templates/chrome-extension/` directory structure
2. Copy all scaffoldable files from exemplar
3. Templatize variable content with Handlebars `{{VAR}}` syntax:
   - `{{extensionName}}` - kebab-case name (e.g., `my-extension`)
   - `{{extensionDisplayName}}` - human-readable (e.g., `My Extension`)
   - `{{extensionDescription}}` - one-line description
   - `{{githubUsername}}` - for homepage_url, privacy policy URLs
   - `{{extensionId}}` - placeholder for CWS ID (empty initially)

### Phase 2: Command Implementation
4. Create `pro/commands/scaffold.chrome-extension.md` with:
   - Greenfield mode: detect empty/non-extension directory
   - Delta mode: detect existing manifest.json or @crxjs/vite-plugin
   - Interactive prompts for required values
   - File copy with template substitution
   - npm install invocation
   - Next steps guidance

### Phase 3: Delta Logic
5. Implement delta detection:
   - Compare against expected file list
   - Show what's missing with brief descriptions
   - Interactive per-file "Add this? (Y/n/all)"
   - Conflict resolution for modified templates

### Phase 4: Documentation
6. Create ADR documenting `/pro:scaffold.*` namespace pattern
7. Update plugin README with new command

## Template Files List

```
_templates/chrome-extension/
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── publish.yml
├── docs/
│   ├── PUBLISHING.md
│   └── RELEASING.md
├── e2e/
│   ├── extension-loading.spec.ts.hbs  (templatized)
│   └── fixtures/
│       └── .gitkeep
├── Makefile.hbs                       (templatized)
├── package.json.hbs                   (templatized)
├── playwright.config.ts
├── public/
│   ├── manifest.json.hbs              (templatized)
│   ├── icons/
│   │   ├── icon16.png                 (placeholder)
│   │   ├── icon48.png                 (placeholder)
│   │   └── icon128.png                (placeholder)
│   └── styles/
│       └── content.css
├── scripts/
│   └── release.sh
├── src/
│   └── content/
│       └── index.ts                   (minimal skeleton)
├── tsconfig.json
└── vite.config.ts
```

## Definition of Done

- [x] `/pro:scaffold.chrome-extension` creates functional extension skeleton
- [x] Running on existing extension shows meaningful delta
- [x] All CWS publishing tooling included (Makefile, scripts, CI/CD)
- [x] `npm install && npm run build` succeeds on fresh scaffold
- [x] Extension structure valid for Chrome developer mode loading
- [x] Documentation explains both modes

## Implementation Status

**Phase 1: Template Extraction** - COMPLETE
- Created `pro/commands/_templates/chrome-extension/` with 19 files
- Templatized: package.json.hbs, manifest.json.hbs, Makefile.hbs, extension-loading.spec.ts.hbs
- Added placeholder icons (blue 16x16, 48x48, 128x128 PNGs)
- Fixed: styles/ moved to public/styles/ for Vite to copy to dist

**Phase 2: Command Implementation** - COMPLETE
- Created `pro/commands/scaffold.chrome-extension.md`
- Greenfield mode: interactive prompts, template processing, npm install, git init
- Delta mode: file comparison, interactive addition

**Phase 3: Testing** - COMPLETE
- Tested in /tmp/test-chrome-extension
- `npm install` succeeds (59 packages)
- `npm run build` succeeds, produces valid dist/ with manifest.json
- dist/ contains: manifest.json, icons/, styles/, assets/

**Phase 4: Documentation** - DEFERRED
- ADR for scaffold namespace pattern can be added when more scaffolds exist
