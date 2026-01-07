# Implementation Checklist

## Phase 1: DX Improvements (Foundation)

- [x] Add domain slug derivation function
- [x] Change output directory default from `.` to `proof-{domain-slug}`
- [x] Add Vite base path configuration for GitHub Pages
- [x] Update package.json scripts (build, deploy, deploy:init, open)
- [x] Add git init + initial commit step
- [x] Add default .gitignore generation
- [x] Create `public/evidence/` in directory structure

## Phase 2: Interaction Audit (CHECK Extension)

- [x] Insert Phase 1.3: CHECK after screenshot capture plan
- [x] Implement navigation testing (all viewports)
- [x] Implement CTA testing (click, tap target, obstruction)
- [x] Implement scroll testing (sticky, overflow, shifts)
- [x] Implement form testing (focus, keyboard overlap)
- [x] Implement interactive UI testing (modals, accordions)
- [x] Implement dead-end detection
- [x] Implement trust signal detection
- [x] Add console error capture during interactions
- [x] Generate interaction-log.json artifact
- [x] Generate issues.json with operator translations
- [x] Add CHECK summary output

## Phase 3: Viewport Extension

- [x] Add tablet viewport (768×1024) to ACQUIRE
- [x] Add optional WebKit pass with graceful degradation
- [x] Update viewport list in CHECK phase

## Phase 4: Evidence Index

- [x] Create evidence index HTML template
- [x] Copy screenshots to public/evidence/
- [x] Generate screenshots.json manifest
- [x] Add quiet link in Footer component

## Phase 5: Documentation

- [x] Create ADR-039: Permissionless Proof CHECK Extension
- [x] Update completion summary format
- [x] Update Definition of Done checklist

## Phase 6: Testing

- [ ] Dry run on known problematic site
- [ ] Verify all artifact generation
- [ ] Deploy and verify /evidence/ works
- [ ] Verify npm run open copies URL + opens browser
- [ ] Verify WebKit graceful degradation
