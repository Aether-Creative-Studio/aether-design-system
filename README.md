# Aether design system

The single source of truth for design decisions across Aether projects. Values live here as design tokens; every design tool and codebase receives generated copies.

**Status:** tokens imported and outputs generated. Syncing to Webflow and Figma comes next.

## Use it

- **Web projects:** include `dist/css/variables.css` and `dist/css/typography.css`.
- **Change a value:** edit `tokens/`, run `npm run build`, open a pull request.

## How it works

```
tokens/  (edited by hand, reviewed in pull requests)
   │
   ▼  build
dist/    (generated, never edited)
   ├── CSS variables       → traditional development
   ├── Webflow variables   → Webflow sites
   ├── Figma variables     → Figma
   ├── Penpot tokens       → Penpot
   └── Elyx                → Elyx (format to be confirmed)
```

Every Aether project consumes the same core and semantic tokens and adds only its own theme. See [docs/architecture.md](docs/architecture.md).

## Start here

- [PRINCIPLES.md](PRINCIPLES.md) — the six rules every change follows
- [docs/architecture.md](docs/architecture.md) — tiers, naming and outputs
- [AGENTS.md](AGENTS.md) — working instructions for AI agents and people alike
- [docs/decisions/](docs/decisions/) — why things are the way they are
- [CHANGELOG.md](CHANGELOG.md) — what changed

## Projects using this system

| Project | Theme | Platforms |
| --- | --- | --- |
| Aether Creative Studio (aethercreative.studio) | `aether-creative-studio` | Webflow, Figma |
