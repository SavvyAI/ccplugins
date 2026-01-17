# Product Brief: audit-site CLI

> Zero-token website analysis for cold outreach reconnaissance

## Problem Statement

Sales professionals and agencies need quick intelligence on prospect websites to identify:
- Technical issues (SSL, security headers, performance)
- UX failures (broken navigation, mobile issues)
- Trust signal gaps (outdated copyright, missing credibility markers)

Current solutions require either:
- Manual inspection (slow, inconsistent)
- Expensive SaaS tools (Ahrefs, SEMrush, etc.)
- AI-powered analysis (token costs at scale)

**audit-site** provides comprehensive website analysis with ZERO API costs, enabling reconnaissance at any scale.

## Target User

1. **Agency owners** prospecting for web design/development clients
2. **Freelance developers** identifying quick-win fixes to pitch
3. **Sales teams** needing pre-call intelligence on prospects
4. **QA engineers** running automated site health checks

## Value Proposition

> Know everything wrong with any website in 60 seconds, for free.

- **Zero tokens** - No AI API costs, runs entirely locally
- **Comprehensive** - 40+ checks across security, performance, UX, accessibility
- **Actionable** - Issues ranked by severity with clear remediation paths
- **Evidence-based** - Screenshots and metrics, not opinions
- **Portable** - Single command, JSON output, CI/CD friendly

## Core Features

### 1. Infrastructure Audit

| Check | Tool | Output |
|-------|------|--------|
| SSL/TLS | OpenSSL or native | Certificate chain, expiry, cipher strength, protocol versions |
| Security Headers | HTTP parsing | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc. |
| DNS | Native resolver | A/AAAA/MX/TXT records, DNSSEC status |
| Mail Auth | DNS parsing | SPF, DKIM, DMARC configuration |

### 2. Performance Audit

| Check | Tool | Output |
|-------|------|--------|
| Core Web Vitals | Lighthouse | LCP, FID, CLS scores |
| Page Speed | Lighthouse | Performance score, load times |
| Resource Analysis | HTTP | Total weight, request count, largest assets |

### 3. Accessibility Audit

| Check | Tool | Output |
|-------|------|--------|
| WCAG Violations | axe-core | Critical/serious/moderate/minor issues |
| Color Contrast | axe-core | Failing elements with ratios |
| Semantic HTML | axe-core | Missing landmarks, headings hierarchy |

### 4. UX/Interaction Audit

| Check | Tool | Output |
|-------|------|--------|
| Mobile Menu | Playwright | Toggle functionality verification |
| Navigation Links | Playwright | Dead links, no-op clicks |
| CTA Reachability | Playwright | Obstructed/hidden elements by viewport |
| Touch Targets | Playwright | Elements < 44x44px on mobile |
| Horizontal Scroll | Playwright | Overflow detection at mobile widths |
| Form Fields | Playwright | Focus states, label presence |

### 5. Trust Signal Audit

| Check | Tool | Output |
|-------|------|--------|
| Copyright Year | HTML parsing | Outdated footer year |
| Privacy/Terms | HTTP | Link presence and validity |
| Social Proof | HTML parsing | Testimonials, reviews above fold |
| Contact Visibility | HTML parsing | Phone number without scrolling |

### 6. Tech Stack Detection

| Check | Tool | Output |
|-------|------|--------|
| Frameworks | Wappalyzer patterns | React, Vue, Next.js, WordPress, etc. |
| Analytics | HTTP/HTML | Google Analytics, Hotjar, etc. |
| CDN | HTTP headers | Cloudflare, Fastly, etc. |
| Hosting | DNS/headers | AWS, Vercel, Netlify, etc. |

## CLI Interface

### Basic Usage

```bash
# Install globally
npm install -g audit-site

# Run audit
npx audit-site https://example.com

# Or with global install
audit-site https://example.com
```

### Output Formats

```bash
# Default: Pretty-printed terminal output
audit-site https://example.com

# JSON for programmatic use
audit-site https://example.com --format json

# Markdown report
audit-site https://example.com --format markdown

# HTML report (opens in browser)
audit-site https://example.com --format html --open
```

### Options

```bash
audit-site <url> [options]

Options:
  --format, -f     Output format: terminal|json|markdown|html (default: terminal)
  --output, -o     Write to file instead of stdout
  --open           Open HTML report in browser (requires --format html)
  --skip           Skip specific checks: ssl,dns,perf,a11y,ux,trust,tech
  --only           Run only specific checks
  --viewport       Mobile viewport width (default: 375)
  --timeout        Request timeout in seconds (default: 30)
  --screenshot     Capture screenshots (stored in ./audit-screenshots/)
  --verbose, -v    Show detailed progress
  --quiet, -q      Only show errors and final score
  --version        Show version
  --help           Show help
```

### Example Output (Terminal)

```
audit-site v1.0.0

Auditing: https://example-dentist.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INFRASTRUCTURE                                    B+
────────────────────────────────────────────────────
  ✓ SSL Certificate valid (expires in 87 days)
  ✓ TLS 1.3 supported
  ✗ Missing HSTS header                      [HIGH]
  ✗ Missing CSP header                       [MEDIUM]
  ✓ DNSSEC enabled

PERFORMANCE                                       C
────────────────────────────────────────────────────
  ✗ LCP: 4.2s (should be < 2.5s)            [HIGH]
  ✓ FID: 45ms (good)
  ✗ CLS: 0.18 (should be < 0.1)             [MEDIUM]
  ✗ Page weight: 4.8MB                       [MEDIUM]

ACCESSIBILITY                                     D
────────────────────────────────────────────────────
  ✗ 12 color contrast failures               [HIGH]
  ✗ Images missing alt text: 8               [HIGH]
  ✗ Form inputs missing labels: 3            [MEDIUM]
  ✓ Landmarks present

UX / INTERACTION                                  C-
────────────────────────────────────────────────────
  ✗ Mobile menu toggle non-functional        [CRITICAL]
  ✗ Horizontal scroll at 375px               [HIGH]
  ✗ CTA obstructed on tablet viewport        [MEDIUM]
  ✓ Navigation links functional

TRUST SIGNALS                                     D
────────────────────────────────────────────────────
  ✗ Copyright year: 2022 (outdated)          [LOW]
  ✗ No testimonials above fold               [MEDIUM]
  ✓ Phone number visible
  ✗ Privacy policy returns 404               [HIGH]

TECH STACK
────────────────────────────────────────────────────
  Framework: WordPress 6.1
  Theme: Divi
  Analytics: Google Analytics 4
  CDN: Cloudflare
  Hosting: SiteGround

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL SCORE: C- (62/100)

CRITICAL ISSUES: 1
HIGH ISSUES: 6
MEDIUM ISSUES: 5
LOW ISSUES: 1

Top 3 Issues for Outreach:
────────────────────────────────────────────────────
1. Mobile visitors cannot open the navigation menu
2. Page takes 4.2 seconds to load - visitors leave after 3s
3. Privacy policy page is broken (404 error)

Full report: ./audit-example-dentist.json
```

## Architecture

### Dependencies

```
audit-site/
├── package.json
├── src/
│   ├── index.ts              # CLI entry point
│   ├── auditors/
│   │   ├── ssl.ts            # OpenSSL wrapper
│   │   ├── headers.ts        # HTTP security headers
│   │   ├── dns.ts            # DNS record checks
│   │   ├── performance.ts    # Lighthouse wrapper
│   │   ├── accessibility.ts  # axe-core integration
│   │   ├── interaction.ts    # Playwright UX checks
│   │   ├── trust.ts          # Trust signal detection
│   │   └── techstack.ts      # Wappalyzer patterns
│   ├── reporters/
│   │   ├── terminal.ts       # Pretty console output
│   │   ├── json.ts           # Machine-readable
│   │   ├── markdown.ts       # Documentation format
│   │   └── html.ts           # Visual report
│   ├── scoring.ts            # Grade calculation
│   └── types.ts              # Shared type definitions
└── bin/
    └── audit-site            # CLI binary
```

### Core Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| playwright | Browser automation for UX checks | ~150MB (browsers downloaded on demand) |
| lighthouse | Performance auditing | ~20MB |
| axe-core | Accessibility testing | ~1MB |
| commander | CLI parsing | ~50KB |
| chalk | Terminal colors | ~20KB |

**Note:** Playwright browsers are downloaded on first run, not bundled.

### Optional Integrations

| Integration | Purpose | How |
|-------------|---------|-----|
| web-check API | Additional infrastructure checks | HTTP calls to hosted or self-hosted API |
| Wappalyzer | Tech stack detection | Local fingerprint matching |

## Scoring System

Each category receives a letter grade (A-F) based on weighted issue severity:

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Excellent, minor issues only |
| B | 80-89 | Good, few issues |
| C | 70-79 | Average, noticeable issues |
| D | 60-69 | Below average, significant issues |
| F | <60 | Poor, critical issues |

**Severity Weights:**
- Critical: 15 points
- High: 10 points
- Medium: 5 points
- Low: 2 points

**Overall Score:** Weighted average of category scores.

## Output Schema (JSON)

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-15T12:00:00Z",
  "duration": 45.2,
  "score": {
    "overall": 62,
    "grade": "C-",
    "categories": {
      "infrastructure": { "score": 85, "grade": "B+" },
      "performance": { "score": 55, "grade": "C" },
      "accessibility": { "score": 48, "grade": "D" },
      "interaction": { "score": 65, "grade": "C-" },
      "trust": { "score": 52, "grade": "D" }
    }
  },
  "issues": [
    {
      "id": "ssl-hsts-missing",
      "category": "infrastructure",
      "severity": "high",
      "title": "Missing HSTS header",
      "description": "HTTP Strict Transport Security header not set",
      "remediation": "Add Strict-Transport-Security header with max-age",
      "evidence": null
    },
    {
      "id": "ux-mobile-menu-broken",
      "category": "interaction",
      "severity": "critical",
      "title": "Mobile menu toggle non-functional",
      "description": "Clicking hamburger menu produces no state change",
      "remediation": "Fix JavaScript event handler for mobile menu toggle",
      "evidence": {
        "screenshot": "./audit-screenshots/mobile-menu-001.png",
        "viewport": "375x812"
      }
    }
  ],
  "techStack": {
    "framework": "WordPress 6.1",
    "theme": "Divi",
    "analytics": ["Google Analytics 4"],
    "cdn": "Cloudflare",
    "hosting": "SiteGround"
  },
  "meta": {
    "version": "1.0.0",
    "checksRun": 42,
    "checksSkipped": 0
  }
}
```

## Non-Goals (v1)

- **No AI/LLM integration** - Pure deterministic analysis
- **No historical tracking** - Single-point-in-time audit
- **No scheduled monitoring** - Run on-demand only
- **No SaaS component** - Fully local execution
- **No content analysis** - We check structure, not copy quality
- **No competitor comparison** - Single-site focus

## Future Considerations (v2+)

1. **Batch mode** - Audit multiple URLs from file
2. **CI/CD integration** - GitHub Actions, GitLab CI templates
3. **Baseline comparison** - Diff against previous audit
4. **Custom rules** - User-defined check patterns
5. **Plugin system** - Third-party auditor modules
6. **Web UI** - Local web interface for non-CLI users

## Success Metrics

| Metric | Target |
|--------|--------|
| Audit completion time | < 60 seconds |
| Install size | < 50MB (excluding browsers) |
| Check coverage | 40+ distinct checks |
| False positive rate | < 5% |
| npm weekly downloads | 1,000+ (3 months post-launch) |

## Development Milestones

### Milestone 1: Core Infrastructure (Week 1-2)
- [ ] CLI scaffolding with commander
- [ ] SSL/TLS auditor
- [ ] Security headers auditor
- [ ] DNS auditor
- [ ] Terminal reporter (basic)

### Milestone 2: Performance & Accessibility (Week 3-4)
- [ ] Lighthouse integration
- [ ] axe-core integration
- [ ] Performance scoring
- [ ] Accessibility scoring

### Milestone 3: UX/Interaction (Week 5-6)
- [ ] Playwright integration
- [ ] Mobile menu testing
- [ ] Navigation link testing
- [ ] Viewport-specific checks
- [ ] Screenshot capture

### Milestone 4: Reporting & Polish (Week 7-8)
- [ ] JSON reporter
- [ ] Markdown reporter
- [ ] HTML reporter
- [ ] Overall scoring algorithm
- [ ] Trust signal checks
- [ ] Tech stack detection
- [ ] npm publish

## Appendix: Check Reference

### Infrastructure Checks (12)
1. SSL certificate validity
2. SSL certificate expiry
3. TLS version support
4. Cipher suite strength
5. HSTS header presence
6. CSP header presence
7. X-Frame-Options header
8. X-Content-Type-Options header
9. Referrer-Policy header
10. DNS record resolution
11. DNSSEC validation
12. IPv6 support

### Performance Checks (8)
1. Largest Contentful Paint
2. First Input Delay
3. Cumulative Layout Shift
4. Time to First Byte
5. Total page weight
6. Request count
7. Largest resource
8. Render-blocking resources

### Accessibility Checks (8)
1. Color contrast ratios
2. Image alt text
3. Form input labels
4. Heading hierarchy
5. Landmark regions
6. Focus indicators
7. Link text clarity
8. Language attribute

### Interaction Checks (8)
1. Mobile menu toggle
2. Navigation link functionality
3. CTA visibility (desktop)
4. CTA visibility (tablet)
5. CTA visibility (mobile)
6. Touch target sizing
7. Horizontal scroll
8. Form field focus states

### Trust Checks (6)
1. Copyright year currency
2. Privacy policy accessibility
3. Terms of service accessibility
4. Phone number visibility
5. Testimonial presence
6. Business address visibility

---

*Generated from spike/web-check-permissionless-cli*
*See ADR-053 for architectural context*
