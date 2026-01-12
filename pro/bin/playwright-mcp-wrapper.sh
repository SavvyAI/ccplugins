#!/bin/bash
# Playwright MCP wrapper - conditionally uses playwriter or standard Playwright
#
# Environment variables:
#   USE_PLAYWRITER=1  - Switch to playwriter (Chrome extension-based)
#   (default)         - Use standard @playwright/mcp
#
# When playwriter is enabled, PLAYWRITER_AUTO_ENABLE=1 is also set to
# automatically create an initial tab for automation.

if [ "$USE_PLAYWRITER" = "1" ]; then
  # Use playwriter with auto-enable for automatic tab creation
  export PLAYWRITER_AUTO_ENABLE=1
  exec npx playwriter@latest
else
  # Default: standard Playwright MCP with headless mode
  # Use PLAYWRIGHT_HEADED=1 to show browser window for debugging
  if [ "$PLAYWRIGHT_HEADED" = "1" ]; then
    exec npx -y @playwright/mcp@latest
  else
    exec npx -y @playwright/mcp@latest --headless
  fi
fi
