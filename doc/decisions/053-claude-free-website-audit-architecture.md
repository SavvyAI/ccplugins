# ADR-053: Claude-Free Website Audit Architecture

## Status

Accepted

## Context

The `/pro:permissionless-proof` command provides valuable "walk-in" ammunition for cold outreach by identifying issues on prospect websites. However, running the full pipeline is:

1. **Token-expensive** - Vision analysis for parity scoring consumes significant Claude API credits
2. **Time-intensive** - Full rebuild pipeline takes 15-30 minutes
3. **Overkill for reconnaissance** - Sometimes you just need the issues list, not a rebuilt site

We investigated whether website auditing could be performed WITHOUT Claude tokens, enabling:
- Faster reconnaissance cycles
- Lower-cost prospecting at scale
- Standalone CLI distribution outside Claude Code

### Research Findings

We analyzed [web-check.xyz](https://github.com/Lissy93/web-check), an open-source OSINT tool providing 30+ website checks:

| Category | Checks | Approach |
|----------|--------|----------|
| SSL/TLS | Certificate chain, cipher strength, protocol versions | OpenSSL, sslyze |
| Security Headers | HSTS, CSP, X-Frame-Options, etc. | HTTP parsing |
| DNS | Records, DNSSEC, mail config (SPF/DKIM/DMARC) | dig, drill, DNS libraries |
| Performance | Core Web Vitals, Lighthouse scores | Lighthouse CLI |
| Accessibility | WCAG violations | axe-core |
| Tech Stack | Framework/library detection | Wappalyzer fingerprinting |
| Infrastructure | Open ports, server location, WAF detection | nmap, GeoIP |

**Key insight:** These checks are purely computational—no LLM reasoning required.

### Complementary Coverage

Our existing CHECK phase in `/pro:permissionless-proof` covers UX/interaction issues that web-check does NOT:

| Our CHECK Phase | Web-Check |
|-----------------|-----------|
| Navigation click testing | ❌ |
| Mobile menu functionality | ❌ |
| CTA reachability by viewport | ❌ |
| Horizontal scroll detection | ❌ |
| Touch target sizing | ❌ |
| Form field focus states | ❌ |

**Conclusion:** Web-check and our CHECK phase are complementary, not redundant.

## Decision

We will adopt a **layered architecture** for website auditing:

### Layer 1: Deterministic Checks (Zero Tokens)

All infrastructure, security, performance, and accessibility checks run without Claude:

```
┌─────────────────────────────────────────────────────────┐
│              Deterministic Audit Layer                   │
├─────────────────────────────────────────────────────────┤
│  SSL/TLS     │  Security Headers  │  DNS/DNSSEC         │
│  (OpenSSL)   │  (HTTP parsing)    │  (dig/drill)        │
├──────────────┴───────────────────┴─────────────────────┤
│  Performance  │  Accessibility  │  Tech Stack           │
│  (Lighthouse) │  (axe-core)     │  (Wappalyzer)         │
├─────────────────────────────────────────────────────────┤
│            Playwright Viewport Testing                   │
│     (Mobile menu, horizontal scroll, CTAs, forms)        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              JSON Report + Screenshot Evidence
```

### Layer 2: Claude Enhancement (Optional)

When tokens are available, Claude adds:
- Operator-friendly translations ("Mobile menu broken" → sales language)
- Content quality insights
- Prioritization recommendations
- Visual parity scoring (for full permissionless-proof)

### Implementation Phases

**Phase 1: Integrate web-check into CHECK phase**
- Call web-check API for infrastructure checks
- Merge with existing interaction audit
- Combined output in issues.json

**Phase 2: Create `/pro:audit.site` command**
- Standalone reconnaissance command
- No site rebuild, just issue detection
- Fast execution (<60 seconds)

**Phase 3: Extract to `npx audit-site` CLI**
- Standalone npm package
- Zero Claude dependency
- Distributable outside ccplugins ecosystem

## Consequences

### Positive

1. **Cost reduction** - Reconnaissance at scale without token burn
2. **Speed improvement** - Quick checks for prospecting workflows
3. **Broader distribution** - CLI usable by non-Claude-Code users
4. **Clear separation** - Deterministic vs. reasoning-required tasks
5. **Complementary coverage** - Infrastructure + UX in single report

### Negative

1. **External dependency** - Web-check API may have rate limits or availability issues
2. **Self-hosting option** - Docker requirement for web-check-api adds complexity
3. **Maintenance burden** - Keeping multiple tools in sync

### Neutral

1. **PARITY phase unchanged** - Visual matching still requires Claude vision
2. **ELEVATE phase unchanged** - Design polish requires Claude reasoning

## Alternatives Considered

### A: Build everything from scratch
- Pros: Full control, no dependencies
- Cons: Massive development effort, duplicating existing tools
- **Rejected:** web-check already exists and is well-maintained

### B: Use only web-check, drop our CHECK phase
- Pros: Simplicity
- Cons: Loses UX/interaction audit which is our differentiator
- **Rejected:** Both are needed for complete coverage

### C: Keep everything in Claude, don't optimize tokens
- Pros: No new architecture
- Cons: Expensive at scale, can't distribute standalone CLI
- **Rejected:** Doesn't meet cost/distribution goals

## References

- [Lissy93/web-check](https://github.com/Lissy93/web-check) - MIT licensed OSINT tool
- [xray-web/web-check-api](https://github.com/xray-web/web-check-api) - Go-based API backend
- [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) - Performance auditing
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- ADR-035: Permissionless Proof Pipeline Architecture
- ADR-039: Permissionless Proof CHECK Extension
