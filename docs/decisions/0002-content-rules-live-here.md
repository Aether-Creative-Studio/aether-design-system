# 0002 — Content rules live here

**Status:** Proposed
**Date:** 2026-11-01

## Context

Decision 0001 made this repository the source of truth for design tokens. Writing rules that every Aether project shares, starting with how headings are capitalized and punctuated, are currently scattered across project notes and chat history. A November 2026 audit of aethercreative.studio found headings drifting between title case, sentence case and inconsistent periods because those rules weren't written down in one place.

## Decision

Shared content rules live in `docs/content/`, one short file per topic, starting with `headings.md`. Project-specific terms go in a clearly marked section of the relevant file rather than in a separate copy.

## Consequences

- Agents and people find writing rules in the same place as design values, through `AGENTS.md`.
- A rule changes in one pull request instead of being re-explained per project.
- Project notes elsewhere (such as the claude.ai project) should point here rather than restate the rules, or they will drift.
