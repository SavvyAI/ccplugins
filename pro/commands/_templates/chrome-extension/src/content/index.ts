/**
 * Content script entry point.
 *
 * This script runs in the context of web pages matching the patterns
 * defined in manifest.json content_scripts.matches.
 */

import { TIMING } from './selectors.js';

/**
 * Debounce timer for DOM changes
 */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * MutationObserver instance
 */
let observer: MutationObserver | null = null;

/**
 * Main update cycle
 */
function update(): void {
  // TODO: Implement your content script logic here
}

/**
 * Debounced update for DOM changes
 */
function debouncedUpdate(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    update();
  }, TIMING.DEBOUNCE_DELAY);
}

/**
 * Initialize the MutationObserver
 */
function initObserver(): void {
  observer = new MutationObserver(debouncedUpdate);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Cleanup on unload
 */
function cleanup(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/**
 * Main initialization
 */
function init(): void {
  initObserver();
  update();
  window.addEventListener('unload', cleanup);
}

// Start the extension
init();
