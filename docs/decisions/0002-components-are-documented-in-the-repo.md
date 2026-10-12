# 0002 — Components are documented in the repo

**Status:** Proposed
**Date:** 2026-10-12

## Context

Component guidance is written separately in each tool: the Webflow Style Guide page, and documentation frames in Figma. The copies drift, and agents can read them only through tool-specific connectors. Decision 0001 made this repository the source of truth for tokens; components have no equivalent home.

## Decision

Each shared component gets one short file at `docs/components/<component-name>.md`. The file covers:

- purpose
- where the component lives in each tool
- its properties
- its anatomy
- the tokens it uses, by name
- behavior and accessibility
- open items

It refers to values by token name and does not restate them (Principle 3).

A component is documented once more than one page uses it (Principle 5). Its name matches the component name in Webflow and Figma.

The Webflow Style Guide and Figma documentation frames show the live component and summarize this file. When they disagree, this file wins.

## Consequences

- Component behavior can be reviewed, linked and read by agents without access to Webflow or Figma.
- The tool copies are still written by hand and can fall behind until they are generated.
- Renaming a component means renaming it here, in Webflow and in Figma together.
