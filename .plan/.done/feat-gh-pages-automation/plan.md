# Plan: GitHub Pages Automation Skill

## Context

The `/pro:permissionless-proof` command (and potentially others) currently outputs "Manual Steps Required" for enabling GitHub Pages:

```
Manual Steps Required After Merge

1. Enable GitHub Pages
   - Repo Settings > Pages
   - Source: main branch, /docs folder
   - Result: https://wilmoore.github.io/browser-extension-conversation-titles-chatgpt/privacy.html
```

This breaks the autonomous workflow and requires human intervention for what should be a simple API call.

## Related ADRs

**ADR-037: GitHub Pages Deployment for Permissionless Proofs** (Accepted)
- Established the `gh-pages` branch convention
- Added `npm run deploy` and `npm run deploy:init` scripts
- Uses `gh-pages` npm package
- **Gap**: Does not automate the repo Settings > Pages enablement step

The current approach assumes the `gh-pages` branch auto-detection works, but:
1. New repos may need explicit Pages enablement
2. The `/docs` folder approach (different from ADR-037) definitely requires manual settings

## Problem Statement

When Claude needs to deploy a static site to GitHub Pages, there is no automated way to:
1. Create a GitHub repo (if needed)
2. Enable GitHub Pages in repo settings
3. Deploy built assets
4. Return the live URL

## Solution

Create a `/pro:gh-pages` skill that provides full GitHub Pages automation.

## Design

### Skill: `/pro:gh-pages`

**Location:** `pro/skills/gh-pages/SKILL.md`

**Capabilities:**

1. **Detect repo state** - Is this a git repo? Does remote exist? Is Pages enabled?
2. **Create repo if needed** - `gh repo create` with public visibility
3. **Enable Pages via API** - `POST /repos/{owner}/{repo}/pages` with `gh-pages` branch source
4. **Deploy assets** - Use `gh-pages` npm package to push to `gh-pages` branch
5. **Wait for propagation** - Poll until site is live (up to 60s)
6. **Return live URL** - `https://{username}.github.io/{repo}/`

### API Details

**Enable Pages endpoint:**
```bash
gh api --method POST /repos/{owner}/{repo}/pages \
  -f source[branch]="gh-pages" \
  -f source[path]="/"
```

**Check Pages status:**
```bash
gh api /repos/{owner}/{repo}/pages
```

**Response includes:**
```json
{
  "url": "https://api.github.com/repos/owner/repo/pages",
  "html_url": "https://owner.github.io/repo/",
  "status": "built" | "building" | "errored"
}
```

### Execution Flow

```
1. PRE-FLIGHT CHECKS
   ├─ Verify gh CLI authenticated
   ├─ Verify git repository exists
   └─ Check for dist/ or build/ directory

2. REPO SETUP (if needed)
   ├─ If no remote: gh repo create --public
   └─ Push current branch

3. DEPLOY ASSETS
   ├─ npm run build (if build script exists)
   └─ npx gh-pages -d {dist_dir}

4. ENABLE PAGES (if not already enabled)
   ├─ gh api POST /repos/{owner}/{repo}/pages
   └─ Handle 409 Conflict (already enabled) gracefully

5. WAIT FOR PROPAGATION
   ├─ Poll gh api /repos/{owner}/{repo}/pages
   ├─ Wait for status: "built"
   └─ Timeout after 60s with warning

6. RETURN URL
   └─ https://{username}.github.io/{repo}/
```

### Error Handling

| Error | Handling |
|-------|----------|
| gh not authenticated | "Run `gh auth login` first" |
| Private repo (free tier) | "GitHub Pages requires a public repo or paid plan" |
| No dist directory | "No build output found. Run build first." |
| API 403 (no permission) | "Insufficient permissions. Need admin access." |
| API 422 (validation failed) | "GitHub Pages validation failed: {message}" |
| Build timeout | "Site building in background. Check in 1-2 minutes." |

### Integration with permissionless-proof

After this skill is implemented, update `pro/commands/permissionless-proof.md`:

1. Remove the "Manual Steps Required" section
2. After `npm run deploy:init`, call this skill's logic to verify Pages is enabled
3. Output the live URL at the end

**Example output after integration:**

```
/pro:permissionless-proof Complete
════════════════════════════════════════

...

Deployment:
  ✓ GitHub repo created: proof-gardens-dentistry-pb
  ✓ GitHub Pages enabled
  ✓ Site deployed and live

Live URL: https://wilmoore.github.io/proof-gardens-dentistry-pb/

════════════════════════════════════════
```

## Implementation Steps

1. **Create skill directory structure**
   ```
   pro/skills/gh-pages/
   └── SKILL.md
   ```

2. **Write SKILL.md with full automation logic**
   - Detection phase
   - Repo creation (optional)
   - Asset deployment
   - Pages enablement via API
   - Propagation waiting
   - URL return

3. **Update permissionless-proof.md**
   - Remove "Manual Steps Required" section
   - Add call to gh-pages skill after deployment
   - Show live URL in completion summary

4. **Create ADR documenting this enhancement**
   - Reference ADR-037
   - Document the API approach
   - Note the skill-first architecture

5. **Test with real deployment**
   - Create a test proof
   - Verify automation works end-to-end
   - Confirm live URL is accessible

## ADR Required

**ADR-045: GitHub Pages Full Automation via API**

Status: Proposed

Enhances ADR-037 by adding API-based Pages enablement to eliminate all manual steps.

Key decisions:
1. Use `gh api` for Pages enablement (not browser automation)
2. Skill architecture allows reuse across commands
3. Graceful fallback to guidance when API fails
4. 60-second propagation timeout with clear messaging

## Definition of Done

- [ ] Skill file created at `pro/skills/gh-pages/SKILL.md`
- [ ] Skill enables Pages via gh CLI API
- [ ] Skill deploys assets via gh-pages npm package
- [ ] Skill waits for propagation and returns live URL
- [ ] permissionless-proof.md updated to use skill
- [ ] "Manual Steps Required" section removed
- [ ] ADR-045 written and committed
- [ ] End-to-end test: create proof, deploy, access live URL

## Out of Scope

- Netlify/Vercel deployment (future `/pro:deploy` command)
- Custom domain configuration
- HTTPS certificate management (GitHub handles this)
- Jekyll/Hugo build integration (just static asset deployment)

---

## Related ADRs (Post-Implementation)

- **ADR-045: GitHub Pages Full Automation via API** - Documents this implementation
- **ADR-037: GitHub Pages Deployment for Permissionless Proofs** - Predecessor establishing gh-pages branch convention
