# Architecture

## Tiers

Tokens sit in three tiers. Each tier may reference only the tier above it.

| Tier | Holds | Example | Shared by |
| --- | --- | --- | --- |
| Core | Raw values: color ramps, spacing scale, type scale | brand 500 = a hex value | All projects |
| Semantic | Roles that pages and components use | text primary → a core color | All projects |
| Theme | One project's mapping of roles to core values, including its modes (for example light and dark) | Aether Creative Studio | One project |

Pages, components and classes use **semantic** tokens only. Core tokens are never used directly outside the token files. A new project is a new theme file; it does not copy or fork anything else.

## Format

Tokens are stored as JSON in the W3C Design Tokens Community Group (DTCG) format, the interchange format most token tools read. One file per group keeps each file small enough to read whole.

## Naming

- One name, used verbatim in every tool (see Principle 2).
- The existing Webflow variable names are the starting point, so the live site needs no renaming on day one. Renames happen only through a decision record.
- A token's path is `collection.group.name`, all lowercase and hyphenated, for example `base.text-color.text-primary`. The CSS name is generated from the path:

| Collection | CSS name | Example |
| --- | --- | --- |
| `base` | `--{group}--{name}` | `--text-color--text-primary` |
| any other | `--_{collection}---{group}--{name}` | `--_spacing---spacing--4` |

## Files

```
tokens/
├── core/          color.json, spacing.json, typography.json
├── semantic/      color.json, status.json
└── themes/
    └── aether-creative-studio/
        └── dark.json   only the tokens whose value differs in dark mode
```

Dimensions are stored in rem (16px = 1rem).

## Outputs

A build step (Style Dictionary, an open-source token build tool) turns `tokens/` into `dist/`:

| Output | Consumer |
| --- | --- |
| CSS custom properties | Traditional development, any web project |
| Webflow variable map | Webflow sites, synced through the Webflow connector |
| Figma variables | Figma |
| DTCG tokens file | Penpot |
| To be confirmed | Elyx |

`dist/` is committed so that tools and people can use it without running a build. A check on each pull request fails if `dist/` is out of date.

## Flow of a change

1. Edit `tokens/` in a pull request.
2. The build regenerates `dist/`.
3. John reviews and merges.
4. Sync pushes the outputs to each tool; a parity report confirms every tool matches.
