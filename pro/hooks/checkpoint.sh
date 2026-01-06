#!/bin/bash
# Persist TodoWrite state to .plan/{branch}/checkpoint.json
# Triggered by PostToolUse hook on TodoWrite calls

BRANCH=$(git branch --show-current 2>/dev/null | tr '/' '-')
[ -z "$BRANCH" ] && exit 0

DIR=".plan/$BRANCH"
[ -d "$DIR" ] || exit 0  # Only checkpoint if plan dir exists

# Write the todos array directly from tool_input
jq -c '.tool_input' > "$DIR/checkpoint.json" 2>/dev/null

exit 0
