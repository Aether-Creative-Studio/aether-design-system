# Navigation / Primary

The top bar on every standard page of aethercreative.studio. Each page carries one instance, inside the sticky header (`nav_fixed`). Links and menus live in the component rather than on each page, so a change reaches every page at once.

## Where it lives

| Tool | Location |
| --- | --- |
| Webflow | Component `Navigation / Primary`, group Navigation. Shown on the Style Guide page under *Primary navigation*. |
| Figma | Aether — Design System, Components page: component set `Navigation / Primary` and the frame `Docs / Navigation / Primary`. |

Webflow is the reference for behavior. Figma mirrors it. If either tool disagrees with this file, this file wins.

## Property

`Variant`: `Base` or `Dark`, with the same name in both tools.

Labels and links are not props. The navigation is the same on every page, and fixed content keeps instances from drifting apart.

- **Base:** an opaque bar for ordinary pages.
- **Dark:** a transparent bar meant for placement over an image. It changes only the background, not the text color (see open items).

## Anatomy

```
navbar_component (Navbar)
└── navbar_content
    ├── navbar_logo-link       logomark (inline SVG) + logotype (image)
    ├── navbar_menu-button     shown at tablet and below
    └── navbar_menu > navbar_menu-right > nav_wrapper
        ├── Services           Dropdown: dropdown-toggle + services-menu_panel
        ├── Work               navbar_link + underline-trail
        ├── Government         navbar_link + underline-trail
        ├── Studio             Dropdown: dropdown-toggle + studio-menu_panel
        └── Start a project    navbar_link + underline-trail
```

Each menu panel holds two labelled columns of `services-menu_link` items, then a footer link (*All services* or *Contact*).

## Tokens

| Part | Token |
| --- | --- |
| Bar background, Base | `base.background-color.background-primary` |
| Bar background, Dark | `base.background-color.background-transparent` |
| Labels | `base.text-color.text-primary` |
| Side padding | `spacing.spacing.9` |
| Hover, intended | `base.background-color.background-brand` |
| Hover, current | `base.background-color.background-alternate` with `base.text-color.text-alternate` |
| Font | `base.font-family.figtree` |

The bar height and link padding match `spacing.spacing.20` and `spacing.spacing.3`, but Webflow sets them as fixed values rather than binding the tokens.

## Behavior

- **Below the tablet breakpoint:** the links collapse behind the menu button into a full-height panel that scrolls on its own.
- **Logo hover:** the logo inverts.
- **Menu links:** they underline on hover.

## Accessibility

- **Navbar and Dropdown elements:** these Webflow elements provide the menu button, the expanded state and keyboard toggling.
- **Touch targets:** menu links meet the 44px minimum target size.
- **Logo:** the logotype carries the alt text. The logomark is decorative and should be `aria-hidden`.

## Open items

1. **Hover color:** hover fills black, which breaks the rule of no black backgrounds in the navigation. Switch it to `background-brand`.
2. **Dark variant contrast:** Dark sits over the 75% black `nav_fixed` backdrop with dark text, which is unreadable. Decide where Dark is used, or give it `text-alternate`.
3. **Focus style:** there is no custom focus style; focus falls back to the browser outline. Use `base.border-color.border-focus`.
4. **Label size:** the label size has no token. It sits outside the type scale, like `text-size-xsmall` in the [inventory](../inventory-2026-10.md).
5. **Hidden legacy elements:** remove them from the Webflow component. They are an old Studio dropdown, the Capabilities, Certifications and About links, and an empty `dropdown_nav-layout` in each panel.
6. **Figma copy:**
   - **Wordmark:** the wordmark is set in type until `acs-logo.svg` is placed.
   - **Variable names:** the file uses its own names (`color/text/primary`, `space/9`) rather than the names here. `space/9` was added by hand on 2026-10-12, which is drift under Principle 1, and the token sync replaces it.
