# 0001 — Git is the source of truth

**Status:** Accepted
**Date:** 2026-10-08

## Context

Aether's design values currently live in two places, Webflow (aethercreative.studio) and Figma ("Aether — Main"), kept in step by hand. Neither can be reviewed line by line, both are tied to one tool, and AI agents can reach them only through slow, tool-specific connectors. More projects and more tools (Penpot, Elyx) are coming, and each additional copy multiplies the work of keeping them aligned.

## Decision

This repository is the single source of truth for design tokens and design-system rules across all Aether projects. Values are edited here and generated into every tool. Webflow and Figma become consumers. Until the inventory is complete, Webflow's current values are the reference for what gets brought in.

The repository is public; it contains no confidential material and must never contain credentials.

## Consequences

- One place to change a value; every tool updates from it.
- Changes are reviewable, reversible and readable by people and agents without special access.
- Edits made directly in a design tool will be overwritten by the next sync, so habits need to shift to the repo.
- A sync step and a parity check have to be built and maintained for each tool.
