# Design contract - Фігулярня

## Subject

Hand-painted 3D-printed anime figurines. Materials: primed resin, wet acrylic paint, workbench light, soft-matte plastic. Audience: collectors in Ukraine ordering custom work.

## Brand

| | |
| --- | --- |
| Name | **Фігулярня** |
| Tagline | 3D-друк і ручне фарбування |
| 18+ | Option on custom figurine order form (checkbox). Quiet notice on `/figurky` if needed. No separate route/catalog. |
| Mock catalog images | `public/mock/figurky/*.png` + `manifest.json` (transparent cutouts) |

Full `/figurky` IA: `.cursor/rules/page-figurky.mdc` (ready-made product cards + hero + custom-order banner; separate SEO page from parts).
| Mark | Silhouette of a desktop 3D printer (`/brand/logo-mark.png`, transparent, tight crop); magenta bead on the bed = printed part. Wordmark stays text. |

Display name is the hero-level signal. Tagline supports; it does not replace the name. Logo/wordmark in the header is not an interactive control: no press, no underline.

## Color

Palette A - смола + акрил (cool primed resin + wet acrylic).

| Token | Hex | Role |
| --- | --- | --- |
| `--surface` | `#e6ebf0` | Page ground: cool primed-resin grey |
| `--surface-raised` | `#f5f8fa` | Raised panels, forms |
| `--surface-input` | `#ffffff` | Form fields |
| `--surface-hero-a/b` | `#dde4eb` / `#c5d0db` | Hero material wash |
| `--ink` | `#16191f` | Primary text |
| `--ink-muted` | `#4a5563` | Secondary text |
| `--filament` | `#243746` | Headers, nav, structure |
| `--paint` / `--paint-deep` | `#c43b6e` / `#9e2f58` | Primary action / brand accent |
| `--resin` | `#5f8f82` | Quiet secondary accent |
| `--line` | `#c2ccd6` | Borders, rules |

No purple gradients. No warm cream + terracotta. No acid green on black. No glassmorphism blur. No pill (`999px`) badges.

## Type

- Display: **Unbounded** (Cyrillic): geometric, workshop brand voice. Only headings and brand name.
- Body / UI: **Onest** (Cyrillic): paragraphs, nav, forms, buttons, brand tagline.
- Two faces max. Sizes in `rem`; fluid `clamp` only on h1/h2.
- Scale tokens in `app/assets/css/main.css` (`--text-h1` … `--text-caption`).
- Prose left-aligned, measure `40rem`. Body >= `1rem`.
- Verify Ukrainian glyphs: Ґ Є І Ї, apostrophe, long words.
- Full rules: `.cursor/rules/typography.mdc`

## Layout

Left-aligned content. Max readable measure ~40rem for prose. Service pages (`/figurky`, `/detali`): hero + gallery + CTA to separate order form. Landing is a short brand hub linking to those pages. No floating labels on the hero panel.

## Whitespace

- Scale: `--space-1` … `--space-8` in `app/assets/css/main.css` (4px base, 8px rhythm).
- Prefer `gap` in stacks/rows; padding inside components; no arbitrary rem/px for spacing.
- Full rules: `.cursor/rules/whitespace.mdc`

## Signature

Horizontal "measure tape" hairline under section titles. Phosphor icons mark key CTAs and section labels. Motion only on user actions. Cards only where they hold a form or interactive admin content, not for every marketing block.

## Interactive

Every clickable control has hover, active, and tap feedback: slight raise on hover, press-in on active (analog button). Tokens `--press-*` in CSS. Full rules: `.cursor/rules/interactive.mdc`

## Icons

Phosphor only (`ph:` via `@nuxt/icon`). Full rules: `.cursor/rules/icons.mdc`
