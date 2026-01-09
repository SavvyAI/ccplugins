# 045. GitHub Pages Full Automation via API

Date: 2026-01-08

## Status

Accepted

## Context

ADR-037 established GitHub Pages deployment for permissionless proofs using the `gh-pages` npm package and templated scripts (`npm run deploy:init`). However, this approach still requires manual intervention:

1. The `gh-pages` branch approach works for auto-detection, but some scenarios (like `/docs` folder on main) require manual Settings > Pages configuration
2. Commands were outputting "Manual Steps Required" sections that broke the autonomous workflow
3. Users reported friction when deploying proofs from other projects using the pro plugin

The gap: While assets could be pushed to `gh-pages` branch, **enabling GitHub Pages in repository settings** was not automated.

## Decision

Create a `/pro:gh-pages` skill that provides **full GitHub Pages automation** via the GitHub API:

### API-Based Enablement

Use `gh api` to enable Pages programmatically:

```bash
gh api --method POST "/repos/{owner}/{repo}/pages" \
  -f source[branch]="gh-pages" \
  -f source[path]="/"
```

This eliminates the need for users to visit Settings > Pages.

### Skill Architecture

Create `pro/skills/gh-pages/SKILL.md` as a reusable skill that any command can invoke:

1. **Detection** - Check if gh authenticated, repo exists, build output present
2. **Repo Creation** - `gh repo create` if no remote
3. **Asset Deployment** - `npx gh-pages -d dist`
4. **Pages Enablement** - POST to Pages API
5. **Propagation Wait** - Poll until `status: "built"` (60s timeout)
6. **URL Return** - Copy to clipboard, display to user

### Integration with permissionless-proof

Add Phase 6: DEPLOY to `/pro:permissionless-proof` that:
- Attempts full automation via the skill
- Falls back to clear manual guidance if API fails
- Updates completion summary to show live URL

### Error Handling

| Error | Recovery |
|-------|----------|
| gh not authenticated | Skip auto-deploy, show `gh auth login` + manual steps |
| 403 (no permission) | Provide Settings > Pages guidance |
| Private repo | Suggest making repo public or upgrading to Pro |
| API 422 | Fall back to manual guidance |
| Build timeout | Provide Actions URL to check status |

## Consequences

### Positive

- **Zero manual steps** for authenticated users
- **Reusable skill** available to any command needing static deployment
- **Graceful degradation** when API unavailable
- **Faster workflow** - no context switching to browser for Settings
- **Clipboard integration** - URL ready to paste in cold outreach

### Negative

- **Requires gh CLI authentication** - users must run `gh auth login` once
- **API rate limits** - very unlikely to hit for typical usage
- **Public repos only** for free tier - existing limitation, not new

### Neutral

- Maintains compatibility with ADR-037's templated scripts as fallback
- `npm run deploy` still works for redeploys

## Alternatives Considered

### Browser automation for Settings > Pages (Rejected)

Using Playwright to click through Settings UI would be fragile:
- UI changes break automation
- Requires browser context
- Slower than API call
- No benefit over API

### GitHub Actions workflow (Rejected)

Adding `.github/workflows/pages.yml` would work but:
- More complex setup
- Requires workflow permissions
- Overkill for static asset deployment
- `gh-pages` package already handles branch deployment

### Only improve documentation (Rejected)

Better docs don't eliminate manual steps. Users still have to click through Settings. The API approach is strictly superior when available.

## References

- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages) - POST /repos/{owner}/{repo}/pages endpoint
- ADR-037: GitHub Pages Deployment for Permissionless Proofs - establishes gh-pages branch convention
- [gh-pages npm package](https://github.com/tschaub/gh-pages) - handles branch deployment
