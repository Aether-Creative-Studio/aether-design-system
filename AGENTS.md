# Working in this repo

Short on purpose. Open other files only when the task needs them.

## Rules

- Follow [PRINCIPLES.md](PRINCIPLES.md).
- Edit values only in `tokens/`. Never edit `dist/` by hand; run `npm run build` and commit the result.
- Never rename a token without a decision record — names are shared by every tool.
- Agent output is a proposal until John accepts it. All changes arrive as pull requests; nothing is merged or synced to a live tool without his approval.
- Never commit credentials. Sync keys live in connectors or CI secrets.

## Where things are

| Need | Open |
| --- | --- |
| Tiers, naming, outputs | `docs/architecture.md` |
| Why a past choice was made | `docs/decisions/` |
| Token values | `tokens/` |
| Known issues from the import | `docs/inventory-2026-10.md` |
| Pushing changes to Figma or Webflow | `docs/sync.md` |

## Pull requests

- Title: what changed, in sentence case (`Add status color tokens`).
- Body: why, in one to three sentences, plus anything the reviewer must check.
- Update `CHANGELOG.md` under *Unreleased*.
- No generation notes, session links or co-author lines in commits or pull requests.

## Decision records

Add one when a change affects names, tiers, sources of truth or which tools are supported. File: `docs/decisions/NNNN-short-title.md`, using the shape of 0001: context, decision, consequences. Status starts as *Proposed* and becomes *Accepted* only when John merges it.
