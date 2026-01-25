#!/bin/bash
# Capture tool failures to .plan/{branch}/errors.json
# Triggered by PostToolUseFailure hook on Bash|Write|Edit calls

BRANCH=$(git branch --show-current 2>/dev/null | tr '/' '-')
[ -z "$BRANCH" ] && exit 0

DIR=".plan/$BRANCH"
[ -d "$DIR" ] || exit 0  # Only capture if plan dir exists

ERRORS_FILE="$DIR/errors.json"

# Initialize if doesn't exist
if [ ! -f "$ERRORS_FILE" ]; then
  echo '{"attempts":[],"strikeCount":0,"lastErrorHash":""}' > "$ERRORS_FILE"
fi

# Read hook input
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
ERROR=$(echo "$INPUT" | jq -r '.tool_input.command // .tool_input // "unknown"' | head -c 200)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Hash for dedup (use shasum for broader compatibility)
ERROR_HASH=$(echo "$TOOL|$ERROR" | shasum | head -c 8)

# Get current state
LAST_HASH=$(jq -r '.lastErrorHash // ""' "$ERRORS_FILE" 2>/dev/null || echo "")
STRIKE_COUNT=$(jq -r '.strikeCount // 0' "$ERRORS_FILE" 2>/dev/null || echo "0")

# Increment strike if same error
if [ "$ERROR_HASH" = "$LAST_HASH" ]; then
  STRIKE_COUNT=$((STRIKE_COUNT + 1))
else
  STRIKE_COUNT=1
fi

# Append attempt
jq --arg ts "$TIMESTAMP" --arg tool "$TOOL" --arg err "$ERROR" \
   --arg hash "$ERROR_HASH" --argjson strikes "$STRIKE_COUNT" \
   '.attempts += [{"timestamp":$ts,"tool":$tool,"error":$err,"status":"unresolved"}] |
    .strikeCount = $strikes | .lastErrorHash = $hash' \
   "$ERRORS_FILE" > "$ERRORS_FILE.tmp" && mv "$ERRORS_FILE.tmp" "$ERRORS_FILE"

# Output warnings based on strike count
if [ "$STRIKE_COUNT" -ge 3 ]; then
  echo "[STRIKE 3] Same error 3+ times. STOP. Escalate to user or try fundamentally different approach."
elif [ "$STRIKE_COUNT" -eq 2 ]; then
  echo "[Strike 2] Same error twice. MUST use different approach - do NOT repeat previous action."
fi

exit 0
