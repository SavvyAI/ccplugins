/**
 * Centralized DOM selector definitions and constants.
 *
 * Best practice: Keep all selectors and magic values in one file.
 * This makes maintenance easier when target sites change their DOM structure.
 */

/**
 * Extension element identifiers
 * Use these for any elements your extension injects into the page
 */
export const EXTENSION_ELEMENT_ID = 'extension-element';
export const EXTENSION_CLASS = 'extension-injected';

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = {
  /** Debounce delay for MutationObserver updates */
  DEBOUNCE_DELAY: 100,
  /** Interval for URL polling (SPA navigation detection) */
  URL_POLL_INTERVAL: 500,
  /** Maximum time to wait for DOM updates after navigation */
  DOM_WAIT_TIMEOUT: 3000,
};

/**
 * Example: DOM selectors for target site elements
 * Order selectors by stability (most stable first).
 * The extension can try each selector in order until one succeeds.
 *
 * Uncomment and customize for your target site:
 *
 * export const TARGET_SELECTORS = [
 *   // data-testid attributes (most stable if present)
 *   '[data-testid="target-element"]',
 *   // ARIA attributes (semantic, usually stable)
 *   '[aria-label="Target"]',
 *   // Class-based selectors (may change with CSS updates)
 *   '.target-class',
 * ];
 */

/**
 * URL pattern matching
 *
 * Example: Extract IDs from URL paths
 *
 * export const URL_PATTERN = /^https:\/\/example\.com\/items\/([a-zA-Z0-9-]+)/;
 */
