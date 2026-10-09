# Principles

The system exists to make design and development uniform, fast and light. Communication with people and with AI should take as little effort as possible, and every action should spend as little human energy and as few tokens as it can.

Six rules put that into practice. When a choice is unclear, pick the option that follows more of them.

## 1. One source, many outputs

Values are edited only in `tokens/`. Everything in `dist/` and every design tool receives generated copies. A value changed directly in Webflow, Figma, Penpot or Elyx is drift, not a change.

## 2. One name everywhere

A token has the same name in the JSON, the CSS variable, Webflow, Figma, Penpot and Elyx. No translation tables, no per-tool aliases. If a tool forces a different syntax, the generator handles it mechanically.

## 3. Generate, don't transcribe

Token tables, swatches, parity reports and changelogs are produced from the data. Hand-written documentation explains *why*; it never restates values.

## 4. Load only what the task needs

Agents start from one short file (`AGENTS.md`) and open other files only when the task calls for them. Documents stay short enough to read in one sitting. If a document needs a table of contents, split it.

## 5. Add on second use

A token, class or component is added when a second real use exists — not in anticipation. Removing something unused is as routine as adding something new.

## 6. Small, reversible steps

One concern per pull request. A change can be understood from its title and undone by reverting one commit.
