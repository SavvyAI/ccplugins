# 057. Random High Port Allocation and Tight Inclusion Rules

Date: 2026-01-19

## Status

Accepted (supersedes ADR-012 port ranges)

## Context

The `/pro:dev.setup` command had three issues causing poor developer experience:

1. **Port conflicts**: Sequential allocation from commonly-used ranges (4000-4099, 6000-6099, 7000-7099) caused frequent conflicts for users running 20-40+ projects simultaneously.

2. **Confusing server naming**: The fallback template used `"dev"` as the server name, resulting in `npx dev dev` commands.

3. **Over-broad script detection**: Broad inclusion rules (anything containing `dev`, `start`, etc.) required a growing exclusion list for utilities like `db:studio`, `prisma:studio`, etc.

## Decision

### 1. Random High Port Allocation

Replace sequential scanning with random selection from high port ranges:

| Range | Purpose |
|-------|---------|
| 50000-58999 | Primary - ephemeral-adjacent, rarely used by dev tools |
| 9000-9899 | Secondary - above common dev ports |

Use `/dev/urandom` for randomness. Verify that base, base+10, and base+20 are all free before allocating.

**Explicitly avoid** commonly-conflicting ranges:
- 3000-3999 (React, Next.js, Express, Rails)
- 4000-4999 (many dev tools)
- 5000-5999 (Flask, Docker)
- 8000-8099 (Django, web servers)
- 8080 (common proxy port)

### 2. Smart Server Naming

Detect server type from script content instead of using script names:

| Content Pattern | Server Name |
|-----------------|-------------|
| next, react, vue, nuxt, vite | `web` |
| api, express, fastify, hono | `api` |
| worker, job, queue, bull | `worker` |
| admin, dashboard | `admin` |
| docs, docusaurus, vitepress | `docs` |
| storybook | `storybook` |
| Fallback | `app` (never `dev`) |

### 3. Tight Inclusion Rules

Replace broad inclusion + exclusion list with tight inclusion only:

**Include ONLY:**
- `dev` (exact match)
- `start` (only if it's a dev server command)
- `serve`, `preview` (exact match)
- Monorepo dev scripts (`dev:web`, `dev:api` with filters)

**Everything else is simply not matched.** No exclusion list needed.

This eliminates the need to enumerate utilities like `db:studio`, `prisma:studio`, `build`, `test`, etc.

## Consequences

### Positive

- Near-zero port conflicts across 20-40+ simultaneous projects
- No more `npx dev dev` confusion
- Simpler, more maintainable inclusion logic
- No exclusion list to maintain as new utilities emerge

### Negative

- Ports are less memorable (52847 vs 4000)
- Random allocation means different ports per-project (mitigated by reading from `.dev/servers.json`)

## Related

- Supersedes: ADR-012 (Dynamic Port Allocation at Setup Time)
- Planning: `.plan/.done/fix-dev-setup-port-defaults-and-naming/`
