# Spike: Web-Check Integration & Claude-Free CLI for Permissionless Proof

## Uncertainty We're Reducing

1. **Can web-check.xyz provide "walk-in" ammunition for cold outreach?**
   - Does it reliably find issues on real websites?
   - Are the issues compelling enough for sales conversations?

2. **Can we build permissionless proof WITHOUT Claude/LLM tokens?**
   - What checks are pure computation vs require LLM reasoning?
   - Is there a viable architecture for a standalone CLI?

## What Success Looks Like

- Clear understanding of web-check's capabilities and API
- Decision on whether to integrate vs build our own
- Architecture sketch for a Claude-free CLI (if viable)
- Identification of what MUST use LLM vs what CAN be deterministic

## Time-Box

2 hours exploratory research + documentation

## Related ADRs

- **ADR-035**: Permissionless Proof Pipeline Architecture
  - Defines the ACQUIRE → PARITY → VERIFY → ELEVATE pipeline
  - Currently requires Claude for vision-based parity scoring

- **ADR-039**: Permissionless Proof CHECK Extension
  - Adds interaction audit (broken menus, dead CTAs, trust signals)
  - Many of these checks are deterministic (no LLM needed)

## Research Questions

1. What does web-check.xyz's API actually expose?
2. Can we self-host web-check-api (Go) or use the hosted API?
3. What's the overlap with our CHECK phase?
4. What would a standalone CLI architecture look like?
