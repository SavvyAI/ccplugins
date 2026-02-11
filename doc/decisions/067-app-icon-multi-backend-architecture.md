# 067. App Icon Multi-Backend Architecture

Date: 2026-02-10

## Status

Accepted

## Context

The app-icon skill was sourced from `code-with-beto/skills` which had a hard dependency on SnapAI CLI and OpenAI's image generation API. This created several issues:

1. **Cost barrier** - OpenAI charges ~$0.04+ per image generation
2. **Privacy concerns** - All prompts and images go through external APIs
3. **Single point of failure** - If OpenAI API is down or rate-limited, icon generation fails
4. **Limited experimentation** - Fixed to one model's aesthetic

## Decision

Implement a multi-backend architecture with priority-ordered fallback:

1. **ComfyUI (local)** - Free, private, best quality. Supports FLUX and SDXL models.
2. **Gemini Imagen** - Google's image generation via `GOOGLE_API_KEY`
3. **Grok Aurora** - xAI's image generation via `XAI_API_KEY`
4. **Prompt-only mode** - Outputs optimized prompt for manual generation when no backend available

The skill detects available backends and uses the first one that's configured.

## Consequences

### Positive

- **Zero cost option** - ComfyUI runs locally with no API costs
- **Privacy** - Local generation keeps prompts and images private
- **Redundancy** - Multiple backends provide fallback options
- **Flexibility** - Users can choose based on their preferences (speed, quality, cost)
- **Offline capability** - ComfyUI works without internet

### Negative

- **Setup complexity** - ComfyUI requires model downloads (6-22GB)
- **Hardware requirements** - Local generation needs GPU/Apple Silicon
- **Maintenance** - Multiple backends mean more code paths to maintain

## Alternatives Considered

### 1. Keep SnapAI/OpenAI dependency
Rejected because it creates cost and privacy barriers for users.

### 2. Single alternative backend (e.g., only ComfyUI)
Rejected because not all users have capable hardware for local generation.

### 3. Abstract backend behind a unified API
Considered but deemed over-engineering. The skill's workflow handles backend selection naturally through environment detection.

## Related

- Planning: `.plan/.done/feat-grab-app-icon-agent-skills/`
- ADR-014: Skills Directory for Bundled Agent Skills
- Source: https://github.com/code-with-beto/skills (MIT license)
