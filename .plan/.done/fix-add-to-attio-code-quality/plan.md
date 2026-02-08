# Fix Plan: Scaffold chrome-extension missing production code patterns

## Phase 1: Remove debug logging

**File:** `pro/commands/_templates/chrome-extension/src/content/index.ts`

**Change:** Remove `console.log('[Extension] Content script loaded');`

**Replace with:** Nothing - production code shouldn't have debug logging.

## Phase 2: Add centralized selectors template

**New file:** `pro/commands/_templates/chrome-extension/src/content/selectors.ts`

**Content:** Generic, reusable selectors pattern with:
- Example constants for extension element IDs
- Timing constants (debounce delays, intervals)
- Type exports for selector keys
- Comments explaining the pattern

## Phase 3: Add unit test template

**New file:** `pro/commands/_templates/chrome-extension/src/content/index.test.ts`

**Content:** Example test file with:
- Chrome API mocking pattern (`vi.stubGlobal('chrome', ...)`)
- jsdom DOM mocking pattern
- Test structure (describe/it/expect)
- beforeEach/afterEach cleanup pattern

## Phase 4: Verify package.json has test dependencies

**File:** `pro/commands/_templates/chrome-extension/package.json.hbs`

**Verify:** Already has vitest, jsdom, @vitest/coverage-v8 - CONFIRMED

## Definition of Done

- [x] No console.log in scaffold template
- [x] selectors.ts template exists with generic pattern
- [x] index.test.ts template exists with Chrome API mocking
- [x] vitest.config.ts added with jsdom environment
- [x] `npm run test` works on fresh scaffold (3 tests pass)
- [x] `npm run build` works on fresh scaffold
- [x] Pattern matches reference extension quality
