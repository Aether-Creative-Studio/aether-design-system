# Syncing tools

Tools receive changes only after they're merged to `main`. Each sync ends with a parity check: the tool, read back, must match `dist/` in every mode.

## Figma

1. `node build/sync-figma.mjs --dry` prints a plugin script. Run it in the target file with Figma's `use_figma` tool; it lists what would change and changes nothing.
2. If the list looks right, run `node build/sync-figma.mjs` the same way to apply it.
3. Run the dry script again. Zero changes means Figma matches.

Variables are matched by their code syntax (the CSS name) and text styles by the Webflow class in their description, so renames keep every existing binding. The script never deletes anything.

Files synced: Aether — Main (`ZzQC6paGhmlJTnxh1244CK`).

## Webflow

There's no script for Webflow; an agent applies `dist/webflow/variables.json` through the Webflow connector.

1. Read the Base, Spacing and Status collections with every mode.
2. Compare each variable to the file by CSS name, resolving references in both. Create what's missing and update what differs. Never delete.
3. Read the collections again and compare. No differences means Webflow matches.

Webflow doesn't let you choose a CSS name directly; it derives it from the display name. A display name of `Group Name/name` produces `--group-name--name`, so name new variables that way.

Sites synced: aethercreative.studio (`665919478e958a8aecd5db06`).

## Not synced yet

- **Type classes.** They're in `dist/webflow/variables.json` but aren't applied until the class contract (chunk 5) settles the fixes listed in `docs/inventory-2026-10.md`.
- **Penpot and Elyx.** Penpot imports `dist/penpot/tokens.json` by hand; Elyx is to be confirmed.
