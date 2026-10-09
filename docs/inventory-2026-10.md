# Inventory, October 2026

A read-only snapshot taken on 2026-10-08 while bringing today's values into `tokens/`. Nothing in Webflow or Figma was changed. This file records what was found; the values themselves live only in `tokens/`.

## What was imported

| Source | Imported | Where |
| --- | --- | --- |
| Webflow Base collection (57 variables, Base and Dark modes) | All | `core/color.json`, `semantic/color.json`, dark values in `themes/aether-creative-studio/dark.json` |
| Webflow Spacing collection, Spacing group (35) | All | `core/spacing.json` |
| Webflow Status collection (4) | All | `semantic/status.json` |
| Webflow heading and text-size classes, Figma text styles (12) | All | `core/typography.json` |

**Parity:** all 96 variables match between Webflow and Figma in every mode, by name and value. Figma spacing is in pixels and Webflow's in rem at 16px; they agree.

## Not imported

- **Padding, Margin and Gap groups** (105 Webflow variables). Each only points at a Spacing value, and Figma doesn't have them. Webflow keeps them; the repo doesn't manage them.
- **Apps collection** (66 Webflow variables: charts, sidebar, a shadcn-style color set, fonts, radius). Out of scope until there's a second use.

## Findings that need a decision

1. **Dark mode flips the core ramps.** In Webflow's Dark mode, `brand 50` becomes the darkest green and `neutral 950` the lightest grey. That breaks the tier rule that core values stay fixed. The usual fix is to keep core fixed and let semantic tokens switch between modes. Until that's decided, the theme file mirrors today's behavior exactly.
2. **Brand 900 doesn't flip in Dark mode.** Every other brand step swaps with its partner; 900 keeps its light-mode value instead of taking 100's. It looks like a slip.
3. **Two CSS name patterns.** Base collection variables are `--group--name`; other collections add a prefix, as in `--_spacing---spacing--4`. Both are recorded in `docs/architecture.md` so names can be generated exactly. Shortening the prefixed ones is possible later, but every rename touches the live site.

## Findings to fix later (chunk 5)

- **Typography lives in classes, not variables.** Webflow has no type variables, so the type tokens were read from the `heading-style-*` and `text-size-*` classes.
- **`heading-style-hero` no longer exists in Webflow.** Its values come from Figma.
- **Several classes fall back to the body tag,** which is still Arial, `#333`, 14px on a 20px line. `heading-style-h3` sets no weight or family, `text-size-large` no family, and `text-size-small` and `text-size-tiny` no line height.
- **The font has two names:** "Figtree Variablefont Wght" in Webflow and "Figtree" in Figma. The token uses Figtree and records the Webflow name.
- **Hard-coded colors.** `text-size-regular 7`, `text-size-small 5` and `acs-text-size-small 2` use `#4f4f4f` directly instead of the text secondary token.
- **Stray classes.** `text-size-reg` is empty. `text-size-xsmall` exists only as a combo class, at a size (0.625rem) outside the scale.
- **Display name.** Webflow shows `- Base Color - Brand / 50` with extra spaces. Its CSS name is already correct, so only the label needs tidying.
