import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TIMING, EXTENSION_ELEMENT_ID } from './selectors.js';

/**
 * Unit tests for content script.
 *
 * Pattern: Mock Chrome APIs and DOM before importing the module under test.
 * Use vi.resetModules() in beforeEach to ensure fresh module state.
 */
describe('content script', () => {
  // Mock Chrome API
  const mockChrome = {
    storage: {
      sync: {
        get: vi.fn().mockResolvedValue({}),
        set: vi.fn().mockResolvedValue(undefined),
      },
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    runtime: {
      id: 'test-extension-id',
    },
  };

  beforeEach(() => {
    vi.resetModules();

    // Mock chrome global
    vi.stubGlobal('chrome', mockChrome);

    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('selectors', () => {
    it('exports expected timing constants', () => {
      expect(TIMING.DEBOUNCE_DELAY).toBe(100);
      expect(TIMING.URL_POLL_INTERVAL).toBe(500);
      expect(TIMING.DOM_WAIT_TIMEOUT).toBe(3000);
    });

    it('exports extension element ID', () => {
      expect(EXTENSION_ELEMENT_ID).toBe('extension-element');
    });
  });

  describe('initialization', () => {
    it('should initialize without errors', async () => {
      // Dynamically import to trigger init()
      // This pattern ensures mocks are set up before module execution
      await expect(import('./index.js')).resolves.not.toThrow();
    });
  });

  // TODO: Add more tests for your content script logic
  // Example patterns:
  //
  // describe('DOM manipulation', () => {
  //   it('should inject element into page', () => {
  //     // Setup DOM
  //     document.body.innerHTML = '<div id="target"></div>';
  //
  //     // Trigger your logic
  //     // ...
  //
  //     // Assert element was injected
  //     const element = document.getElementById(EXTENSION_ELEMENT_ID);
  //     expect(element).not.toBeNull();
  //   });
  // });
  //
  // describe('Chrome storage', () => {
  //   it('should load preferences on init', async () => {
  //     mockChrome.storage.sync.get.mockResolvedValue({ setting: 'value' });
  //
  //     await import('./index.js');
  //
  //     expect(mockChrome.storage.sync.get).toHaveBeenCalled();
  //   });
  // });
});
