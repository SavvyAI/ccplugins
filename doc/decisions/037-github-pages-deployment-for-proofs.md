# 037. GitHub Pages Deployment for Permissionless Proofs

Date: 2026-01-05

## Status

Accepted

## Context

The `/pro:permissionless-proof` command generates static Vite+React websites as "proofs" for cold outreach. These need to be deployed somewhere accessible for prospects to view. Previous workflow involved manual Vercel deployment which required:
- Multiple clicks in the Vercel UI
- GitHub App permission management
- Unnecessary overhead for simple static demos

Additionally, proofs are one-off demonstrations, not production deployments. They don't need Vercel's serverless features.

## Decision

Use GitHub Pages with the `gh-pages` branch convention for proof deployment:

1. **Template deploy scripts into package.json** during scaffold (Phase 2.2):
   ```json
   {
     "scripts": {
       "deploy": "npm run build && npx gh-pages -d dist",
       "deploy:init": "gh repo create proof-{domain} --public --source=. --push && npm run deploy"
     }
   }
   ```

2. **Use `gh-pages` branch convention** - GitHub automatically serves any branch named `gh-pages` as a static site

3. **Template, don't automate** - Scripts are added but not executed automatically. User controls when to deploy.

## Consequences

### Positive

- **Zero-config deployment** - `gh-pages` branch is auto-recognized by GitHub
- **Free hosting** - GitHub Pages is free for public repos
- **Self-contained proofs** - Each proof directory is fully deployable with `npm run deploy`
- **User control** - Deployment is explicit, not automatic
- **Pure bash workflow** - Uses `gh` CLI and `npx gh-pages`, no Claude tokens needed for deployment
- **Source preservation** - Main branch keeps source code, `gh-pages` branch has only built output

### Negative

- **Public repos only** - GitHub Pages requires public repos for free tier (acceptable for proofs)
- **Additional npm dependency** - Uses `gh-pages` package (but only at deploy time, not bundled)
- **GitHub-specific** - Tied to GitHub ecosystem (but that's where the source lives anyway)

## Alternatives Considered

### Vercel (Rejected)
- Too heavyweight for static demos
- Permission management overhead
- Overkill for one-off proofs

### Netlify Drop (Rejected)
- No git integration
- Manual drag-and-drop each time
- No redeployment workflow

### Automatic deployment in pipeline (Rejected)
- User should review before deploying
- Don't want to auto-create GitHub repos without consent
- Template approach gives user control

## Related

- ADR 035: Permissionless Proof Pipeline Architecture
- Command: `pro/commands/permissionless-proof.md`
