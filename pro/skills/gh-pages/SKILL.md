---
name: gh-pages
description: Fully automated GitHub Pages deployment. Use when any command needs to deploy a static site to GitHub Pages. Handles repo creation, Pages enablement via API, asset deployment, and returns live URL. Eliminates all manual steps.
---

# GitHub Pages Automation

Fully automated static site deployment to GitHub Pages.

## Core Principle

**Zero manual steps. Fully automated. Live URL returned.**

When this skill runs successfully, the site is live and accessible. No Settings > Pages clicks. No waiting for unclear build status. Just a working URL.

## When to Use This Skill

Invoke when:
- Deploying a proof from `/pro:permissionless-proof`
- Publishing any static site to GitHub Pages
- Setting up GitHub Pages for an existing repo
- Any command outputs "Manual Steps Required" for Pages

## Input Requirements

This skill operates on the **current directory**. Before invoking:

1. Must be in a directory with built assets (`dist/`, `build/`, or specified output dir)
2. Git repo must exist (or will be created)
3. `gh` CLI must be authenticated

## Execution Pipeline

### Phase 1: Pre-Flight Checks

```bash
# 1. Verify gh CLI authenticated
gh auth status 2>&1 | grep -q "Logged in" || {
  echo "ERROR: gh CLI not authenticated"
  echo "Run: gh auth login"
  exit 1
}

# 2. Verify git repository
git rev-parse --git-dir > /dev/null 2>&1 || {
  echo "ERROR: Not a git repository"
  echo "Run: git init"
  exit 1
}

# 3. Find build output directory
for dir in dist build out public; do
  if [ -d "$dir" ]; then
    BUILD_DIR="$dir"
    break
  fi
done

if [ -z "$BUILD_DIR" ]; then
  echo "ERROR: No build output directory found"
  echo "Expected: dist/, build/, out/, or public/"
  echo "Run your build command first (npm run build)"
  exit 1
fi

echo "[CHECK] Pre-flight passed"
echo "  Build directory: $BUILD_DIR"
```

### Phase 2: Repository Setup

```bash
# Check if remote exists
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
  echo "[SETUP] No remote found. Creating GitHub repository..."

  # Extract repo name from directory
  REPO_NAME=$(basename "$(pwd)")

  # Create public repo and push
  gh repo create "$REPO_NAME" --public --source=. --push

  if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create repository"
    exit 1
  fi

  echo "[SETUP] Repository created: $REPO_NAME"
else
  echo "[SETUP] Remote exists: $REMOTE_URL"

  # Ensure we have pushed
  git push -u origin HEAD 2>/dev/null || true
fi

# Extract owner and repo from remote
OWNER=$(gh repo view --json owner -q ".owner.login")
REPO=$(gh repo view --json name -q ".name")
echo "[SETUP] Target: $OWNER/$REPO"
```

### Phase 3: Deploy Assets

```bash
# Check if gh-pages package is available
if ! npm list gh-pages > /dev/null 2>&1; then
  echo "[DEPLOY] Installing gh-pages package..."
  npm install --save-dev gh-pages
fi

# Deploy to gh-pages branch
echo "[DEPLOY] Pushing assets to gh-pages branch..."
npx gh-pages -d "$BUILD_DIR" -m "Deploy to GitHub Pages"

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to deploy assets"
  exit 1
fi

echo "[DEPLOY] Assets pushed to gh-pages branch"
```

### Phase 4: Enable GitHub Pages

```bash
# Check if Pages is already enabled
PAGES_STATUS=$(gh api "/repos/$OWNER/$REPO/pages" 2>&1)

if echo "$PAGES_STATUS" | grep -q '"status"'; then
  echo "[PAGES] GitHub Pages already enabled"
  PAGES_URL=$(echo "$PAGES_STATUS" | jq -r '.html_url')
else
  echo "[PAGES] Enabling GitHub Pages via API..."

  # Enable Pages with gh-pages branch
  ENABLE_RESULT=$(gh api --method POST "/repos/$OWNER/$REPO/pages" \
    -f source[branch]="gh-pages" \
    -f source[path]="/" 2>&1)

  if echo "$ENABLE_RESULT" | grep -q '"html_url"'; then
    PAGES_URL=$(echo "$ENABLE_RESULT" | jq -r '.html_url')
    echo "[PAGES] GitHub Pages enabled successfully"
  elif echo "$ENABLE_RESULT" | grep -q "409"; then
    # Already exists - fetch URL
    PAGES_STATUS=$(gh api "/repos/$OWNER/$REPO/pages" 2>&1)
    PAGES_URL=$(echo "$PAGES_STATUS" | jq -r '.html_url')
    echo "[PAGES] GitHub Pages was already enabled"
  elif echo "$ENABLE_RESULT" | grep -q "403"; then
    echo "ERROR: Insufficient permissions to enable GitHub Pages"
    echo "You need admin access to this repository."
    echo ""
    echo "Manual step required:"
    echo "  1. Go to: https://github.com/$OWNER/$REPO/settings/pages"
    echo "  2. Under 'Build and deployment', select 'Deploy from a branch'"
    echo "  3. Select 'gh-pages' branch, '/ (root)' folder"
    echo "  4. Click Save"
    exit 1
  elif echo "$ENABLE_RESULT" | grep -q "private"; then
    echo "ERROR: GitHub Pages requires a public repository (or GitHub Pro/Team)"
    echo ""
    echo "Options:"
    echo "  1. Make the repository public: gh repo edit --visibility public"
    echo "  2. Upgrade to GitHub Pro for private Pages"
    exit 1
  else
    echo "ERROR: Failed to enable GitHub Pages"
    echo "$ENABLE_RESULT"
    exit 1
  fi
fi
```

### Phase 5: Wait for Propagation

```bash
echo "[WAIT] Waiting for site to build..."

MAX_ATTEMPTS=12  # 60 seconds total
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  PAGES_STATUS=$(gh api "/repos/$OWNER/$REPO/pages" 2>&1)
  BUILD_STATUS=$(echo "$PAGES_STATUS" | jq -r '.status // "unknown"')

  case "$BUILD_STATUS" in
    "built")
      echo "[WAIT] Site is live!"
      break
      ;;
    "building")
      echo "[WAIT] Building... (attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS)"
      ;;
    "errored")
      echo "WARNING: Build reported errors. Site may still be accessible."
      break
      ;;
    *)
      echo "[WAIT] Status: $BUILD_STATUS (attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS)"
      ;;
  esac

  ATTEMPT=$((ATTEMPT + 1))
  sleep 5
done

if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
  echo "WARNING: Build timeout. Site may still be deploying in background."
  echo "Check status at: https://github.com/$OWNER/$REPO/actions"
fi
```

### Phase 6: Return URL

```bash
# Construct final URL
if [ -z "$PAGES_URL" ]; then
  PAGES_URL="https://$OWNER.github.io/$REPO/"
fi

echo ""
echo "════════════════════════════════════════"
echo "DEPLOYMENT COMPLETE"
echo "════════════════════════════════════════"
echo ""
echo "Live URL: $PAGES_URL"
echo ""
echo "Copy to clipboard: echo '$PAGES_URL' | pbcopy"
echo ""

# Copy to clipboard if pbcopy available (macOS)
if command -v pbcopy > /dev/null 2>&1; then
  echo "$PAGES_URL" | pbcopy
  echo "(URL copied to clipboard)"
fi
```

## Complete Execution Script

When this skill is invoked, execute the following bash sequence:

```bash
#!/bin/bash
set -e

echo "GitHub Pages Deployment"
echo "════════════════════════════════════════"
echo ""

# Phase 1: Pre-flight
gh auth status 2>&1 | grep -q "Logged in" || {
  echo "ERROR: Run 'gh auth login' first"
  exit 1
}

git rev-parse --git-dir > /dev/null 2>&1 || {
  echo "ERROR: Not a git repository"
  exit 1
}

BUILD_DIR=""
for dir in dist build out public; do
  [ -d "$dir" ] && BUILD_DIR="$dir" && break
done

[ -z "$BUILD_DIR" ] && {
  echo "ERROR: No build directory found (dist/, build/, out/, public/)"
  exit 1
}

echo "[1/6] Pre-flight checks passed"
echo "      Build directory: $BUILD_DIR"

# Phase 2: Repository setup
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  REPO_NAME=$(basename "$(pwd)")
  echo "[2/6] Creating repository: $REPO_NAME"
  gh repo create "$REPO_NAME" --public --source=. --push
else
  echo "[2/6] Repository exists"
  git push -u origin HEAD 2>/dev/null || true
fi

OWNER=$(gh repo view --json owner -q ".owner.login")
REPO=$(gh repo view --json name -q ".name")

# Phase 3: Deploy assets
echo "[3/6] Deploying assets to gh-pages branch"
npm list gh-pages > /dev/null 2>&1 || npm install --save-dev gh-pages
npx gh-pages -d "$BUILD_DIR" -m "Deploy to GitHub Pages"

# Phase 4: Enable Pages
echo "[4/6] Enabling GitHub Pages"
PAGES_STATUS=$(gh api "/repos/$OWNER/$REPO/pages" 2>&1 || echo "")

if echo "$PAGES_STATUS" | grep -q '"html_url"'; then
  PAGES_URL=$(echo "$PAGES_STATUS" | jq -r '.html_url')
else
  ENABLE_RESULT=$(gh api --method POST "/repos/$OWNER/$REPO/pages" \
    -f source[branch]="gh-pages" \
    -f source[path]="/" 2>&1 || echo "")

  if echo "$ENABLE_RESULT" | grep -q '"html_url"'; then
    PAGES_URL=$(echo "$ENABLE_RESULT" | jq -r '.html_url')
  elif echo "$ENABLE_RESULT" | grep -q "409"; then
    PAGES_URL=$(gh api "/repos/$OWNER/$REPO/pages" --jq '.html_url')
  else
    echo "WARNING: Could not enable Pages via API"
    PAGES_URL="https://$OWNER.github.io/$REPO/"
  fi
fi

# Phase 5: Wait for propagation
echo "[5/6] Waiting for build (up to 60s)"
for i in $(seq 1 12); do
  STATUS=$(gh api "/repos/$OWNER/$REPO/pages" --jq '.status' 2>/dev/null || echo "unknown")
  [ "$STATUS" = "built" ] && break
  [ "$STATUS" = "errored" ] && break
  sleep 5
done

# Phase 6: Return URL
echo "[6/6] Deployment complete"
echo ""
echo "════════════════════════════════════════"
echo "Live URL: $PAGES_URL"
echo "════════════════════════════════════════"

command -v pbcopy > /dev/null 2>&1 && echo "$PAGES_URL" | pbcopy && echo "(Copied to clipboard)"
```

## Error Recovery

| Error | Cause | Recovery |
|-------|-------|----------|
| `gh auth status` fails | Not logged in | Run `gh auth login` |
| No build directory | Build not run | Run `npm run build` first |
| 403 on Pages API | No admin access | Provide manual steps for Settings > Pages |
| 422 validation failed | Unusual repo config | Fall back to manual guidance |
| Private repo error | Free tier limitation | Suggest making repo public |
| Build timeout | Slow GitHub infrastructure | Provide Actions URL to check status |

## Fallback Guidance

When API-based enablement fails, provide clear manual steps:

```
GitHub Pages could not be enabled automatically.

Manual Setup Required:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to: https://github.com/{owner}/{repo}/settings/pages

2. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

3. Click Save

4. Wait 1-2 minutes for deployment

5. Access your site at: https://{owner}.github.io/{repo}/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Integration Points

This skill is called by:
- `/pro:permissionless-proof` - Deploy proof sites
- Any future command needing static site deployment

To invoke from another command:

```markdown
## Deployment

After build completes, deploy to GitHub Pages:

1. Ensure build output exists in `dist/` or `build/`
2. Execute the gh-pages skill deployment script (see Phase 3-6 above)
3. Report the live URL to the user
```

## What This Skill Does NOT Do

- Configure custom domains
- Set up HTTPS certificates (GitHub handles this)
- Build the project (expects pre-built assets)
- Deploy to Netlify, Vercel, or other platforms
- Handle Jekyll/Hugo builds (just static assets)
