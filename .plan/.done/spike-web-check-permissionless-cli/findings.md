# Spike Findings: Web-Check Integration & Claude-Free CLI

## Executive Summary

**Key insight:** Yes, a Claude-free CLI is viable for the CHECK phase of permissionless proof. Many website analysis checks are purely computational and don't require LLM reasoning. However, the PARITY and ELEVATE phases fundamentally require vision + reasoning capabilities.

## What Was Explored

### 1. Web-Check.xyz Deep Dive

[Web-Check](https://github.com/Lissy93/web-check) is a comprehensive open-source OSINT tool under MIT license.

**30+ checks performed:**
- IP info, SSL chain, DNS records, cookies, headers
- Domain registration, robots.txt, sitemap
- Server location, redirect chains, open ports, traceroute
- DNSSEC, TLS configuration, security headers
- Tech stack detection (via Wappalyzer-style fingerprinting)
- Performance metrics (via Lighthouse integration)
- Archive history, global ranking, malware detection
- Social tags, email config (SPF/DKIM/DMARC), WAF detection

**Architecture:**
- Frontend: TypeScript (65%), JavaScript (18%), Astro (12%), SCSS
- Backend API: Go-based ([xray-web/web-check-api](https://github.com/xray-web/web-check-api))
- Self-hostable via Docker: `docker run -p 3000:3000 lissy93/web-check`

**API Access:**
- OpenAPI spec: `https://web-check.xyz/resources/openapi-spec.yml`
- API docs: `https://web-check.xyz/web-check-api/spec`
- Self-hosted API: `docker run -p 8080:8080 lissy93/web-check-api`

### 2. Overlap Analysis with Current CHECK Phase

Current `/pro:permissionless-proof` CHECK phase (from ADR-039):

| Our CHECK | Web-Check Equivalent | Notes |
|-----------|---------------------|-------|
| Navigation testing | ❌ Not covered | We do interaction audit |
| CTA reachability | ❌ Not covered | We do click testing |
| Mobile menu toggle | ❌ Not covered | We do viewport-specific testing |
| Horizontal scroll | ❌ Not covered | Requires visual inspection |
| Trust signals (copyright year) | ✅ Partially | They detect outdated content |
| SSL/TLS | ✅ Comprehensive | Much deeper than ours |
| Security headers | ✅ Comprehensive | HSTS, CSP, X-Frame-Options |
| DNS/DNSSEC | ✅ Comprehensive | We don't check this |
| Tech stack | ✅ Comprehensive | Wappalyzer-style detection |
| Open ports | ✅ Comprehensive | Security implications |
| Performance (Lighthouse) | ✅ Comprehensive | We don't run Lighthouse |

**Conclusion:** Web-check and our CHECK phase are **complementary, not redundant**.
- Web-check: Infrastructure/security/performance (machine-readable data)
- Our CHECK: UX/interaction/conversion issues (requires browser automation)

### 3. Claude-Free CLI Architecture Analysis

**What CAN be purely computational (no LLM needed):**

| Check Category | Tool/Approach | Token Cost |
|----------------|---------------|------------|
| SSL certificate | OpenSSL CLI or `sslyze` | $0 |
| Security headers | cURL + parsing | $0 |
| DNS records | `dig` or DNS libraries | $0 |
| DNSSEC | `drill` or `delv` | $0 |
| Open ports | `nmap` | $0 |
| Tech stack | Wappalyzer/web-check-api | $0 |
| Performance | Lighthouse CLI | $0 |
| Accessibility | axe-core CLI | $0 |
| robots.txt/sitemap | HTTP fetch + parse | $0 |
| Copyright year | Regex on footer content | $0 |
| Meta tags/OG | HTML parsing | $0 |
| Broken links | HTTP HEAD requests | $0 |
| Mobile viewport issues | Playwright + viewport testing | $0 |
| Response times | HTTP timing | $0 |

**What REQUIRES Claude/LLM reasoning:**

| Task | Why LLM Required |
|------|------------------|
| Visual parity scoring | Comparing screenshots requires vision |
| Content quality assessment | "Is headline compelling?" is subjective |
| CTA effectiveness | "Is this CTA clear?" requires reasoning |
| Layout interpretation | "Does this feel cramped?" needs judgment |
| Color harmony | Aesthetic evaluation |
| Operator-friendly translations | "Mobile menu broken" → sales language |

### 4. Proposed Architecture: Hybrid CLI

```
┌─────────────────────────────────────────────────────────┐
│                    web-audit CLI                         │
│           (Zero-token infrastructure checks)             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ SSL/TLS     │  │ Security    │  │ Performance │     │
│  │ (OpenSSL)   │  │ Headers     │  │ (Lighthouse)│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ DNS/DNSSEC  │  │ Tech Stack  │  │ Accessibility│    │
│  │ (dig/drill) │  │ (wappalyzer)│  │ (axe-core)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Playwright Viewport Testing            │   │
│  │     (Mobile menu, horizontal scroll, CTAs)       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                        OUTPUT                            │
│  • JSON report (machine-readable)                        │
│  • Markdown summary (human-readable)                     │
│  • Scored categories (A-F grades like SSL Labs)          │
│  • Screenshot evidence                                   │
└─────────────────────────────────────────────────────────┘

            │
            ▼ (Optional: feed to Claude for)

┌─────────────────────────────────────────────────────────┐
│              Claude Enhancement Layer                    │
│           (When tokens are available)                    │
├─────────────────────────────────────────────────────────┤
│  • Operator-friendly translations                        │
│  • Visual parity scoring                                 │
│  • Content quality insights                              │
│  • Prioritization recommendations                        │
└─────────────────────────────────────────────────────────┘
```

### 5. Implementation Options

**Option A: Integrate Web-Check API**
- Pros: Already built, comprehensive, maintained
- Cons: External dependency, rate limits, may go away
- Effort: Low (API calls)

**Option B: Self-Host web-check-api (Go)**
- Pros: Full control, no rate limits
- Cons: Docker dependency, maintenance burden
- Effort: Medium (Docker setup + health monitoring)

**Option C: Build Native CLI**
- Pros: Zero dependencies, fully integrated with ccplugins
- Cons: Significant development effort
- Effort: High (but reusable across commands)

**Option D: Hybrid (Recommended)**
- Use web-check-api for infrastructure checks (Docker or hosted)
- Keep our Playwright-based interaction audit
- Build a thin wrapper CLI that orchestrates both
- Output combined report in single format

### 6. Quick Win: `/pro:audit.site` Command

Before building a full CLI, we could add a simple command that:

1. Calls web-check API for infrastructure analysis
2. Runs our existing CHECK phase for interaction audit
3. Combines into a single "Site Health Report"
4. No Claude tokens for deterministic checks
5. Optional Claude layer for operator translations

**Benefits:**
- Fast "walk-in" ammunition for cold outreach
- Works standalone (not just as part of permissionless-proof)
- Surfaces issues without rebuilding the site
- Could be run on ANY URL, not just outreach targets

### 7. Decision Matrix

| Approach | Token Cost | Dev Effort | Value | Recommendation |
|----------|------------|------------|-------|----------------|
| Add web-check to CHECK phase | Low | Low | Medium | ✅ Do Now |
| Build `/pro:audit.site` command | Zero | Medium | High | ✅ Do Next |
| Build full CLI (no Claude) | Zero | High | High | ⏸ Defer |
| Replace Claude in PARITY | N/A | Impossible | N/A | ❌ Not viable |

## Recommendations

### Immediate (This Spike)
1. **Add web-check integration to CHECK phase** - Call the API for SSL, security headers, DNS, tech stack. Merge with our interaction audit.

### Near-Term
2. **Create `/pro:audit.site <url>` command** - Standalone site health check without proof generation. Pure reconnaissance for cold outreach.

### Future
3. **Build `npx audit-site` CLI** - Fully standalone, zero-token CLI for website analysis. Could be published separately from ccplugins.

## What We Learned

1. **Web-check is solid** - MIT licensed, actively maintained, comprehensive coverage
2. **Complementary tools** - We cover UX/interaction, they cover infrastructure/security
3. **Claude-free CHECK is viable** - Most checks are deterministic
4. **Claude-free PARITY is NOT viable** - Vision + reasoning are core requirements
5. **Quick win available** - Integrating web-check API is low-effort, high-value

## Next Steps

- [ ] Document decision in ADR (if we proceed)
- [ ] Prototype web-check API integration in CHECK phase
- [ ] Design `/pro:audit.site` command specification
- [ ] Consider separate `audit-site` npm package for distribution

---

## Sources

- [Lissy93/web-check](https://github.com/Lissy93/web-check) - Main repository
- [xray-web/web-check-api](https://github.com/xray-web/web-check-api) - Go-based API
- [Web-Check API Docs](https://web-check.xyz/web-check-api/spec) - OpenAPI specification
- [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) - Performance auditing
- [SecureScope](https://github.com/manjiridoshi/SecureScope) - Python security scanner
