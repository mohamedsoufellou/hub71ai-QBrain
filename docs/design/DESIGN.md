---
version: alpha
name: Halcyon
description: A serene, premium light system organized around a single painterly aurora that pools at the bottom-center of the stage and dissolves into near-white at the top, supporting a centered serif hero broken by inline frosted glass chips.

colors:
  primary: "#C5197C"
  primary-hover: "#A8155F"
  secondary: "#171729"
  tertiary: "#5A5C72"
  neutral: "#F2F3F5"
  surface: "#FFFFFF"
  surface-quiet: "#FAFAFC"
  on-surface: "#171729"
  on-surface-muted: "#5A5C72"
  border: "#E8E8EE"
  border-strong: "#D8D8E2"
  focus: "#C5197C"
  error: "#B4254C"
  aurora-peach: "#FFD5BD"
  aurora-rose: "#F8B0CC"
  aurora-violet: "#C193F5"
  aurora-sky: "#9FDFFB"

typography:
  display-family: "Instrument Serif, Georgia, serif"
  sans-family: "Inter, ui-sans-serif, system-ui, sans-serif"
  display-hero:
    family: "{typography.display-family}"
    size: 112px
    weight: 400
    lineHeight: 0.95
    tracking: -0.02em
  display-section:
    family: "{typography.display-family}"
    size: 56px
    weight: 400
    lineHeight: 1.1
    tracking: -0.02em
  headline-lg:
    family: "{typography.display-family}"
    size: 32px
    weight: 400
    lineHeight: 1.1
    tracking: -0.01em
  headline-md:
    family: "{typography.sans-family}"
    size: 24px
    weight: 600
    lineHeight: 1.2
    tracking: -0.01em
  body-lg:
    family: "{typography.sans-family}"
    size: 18px
    weight: 400
    lineHeight: 1.6
    tracking: 0
  body-md:
    family: "{typography.sans-family}"
    size: 17px
    weight: 400
    lineHeight: 1.6
    tracking: 0
  body-sm:
    family: "{typography.sans-family}"
    size: 15px
    weight: 400
    lineHeight: 1.5
    tracking: 0
  label-md:
    family: "{typography.sans-family}"
    size: 14px
    weight: 500
    lineHeight: 1
    tracking: 0
  label-sm:
    family: "{typography.sans-family}"
    size: 13px
    weight: 500
    lineHeight: 1.4
    tracking: 0

rounded:
  none: 0
  sm: 8px
  md: 14px
  lg: 20px
  xl: 24px
  "2xl": 32px
  full: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  "2xl": 72px
  "3xl": 96px
  frame-padding: 16px
  hero-padding-block: 120px
  content-max: 1180px

elevation:
  flat: "none"
  rest: "0 1px 0 0 rgba(255,255,255,0.7) inset, 0 1px 2px rgba(23,23,41,0.04), 0 8px 18px -8px rgba(23,23,41,0.08)"
  hover: "0 1px 0 0 rgba(255,255,255,0.7) inset, 0 1px 2px rgba(23,23,41,0.05), 0 18px 32px -16px rgba(23,23,41,0.12)"
  raised: "0 1px 0 0 rgba(255,255,255,0.7) inset, 0 1px 2px rgba(23,23,41,0.06), 0 28px 48px -20px rgba(23,23,41,0.16)"
  stage: "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 2px 4px rgba(23,23,41,0.03), 0 40px 60px -30px rgba(23,23,41,0.18)"
  glass-on-aurora: "0 1px 0 0 rgba(255,255,255,0.85) inset, 0 2px 4px rgba(108,60,140,0.08), 0 14px 28px -10px rgba(108,60,140,0.18)"

components:
  stage:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    elevation: "{elevation.stage}"
    overlay: "Four overlapping radial blooms in aurora hues at the lower half, dissolved to near-white at the top via a vertical white veil."
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.body-sm}"
    weight: 500
    rounded: "{rounded.full}"
    padding: "0 22px"
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "0 28px"
    height: 56px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.full}"
    padding: "0 22px"
    height: 44px
    elevation: "{elevation.rest}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: 36px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    placeholderColor: "{colors.on-surface-muted}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: 56px
    elevation: "{elevation.rest}"
  search-composer:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.full}"
    padding: "6px 6px 6px 0"
    elevation: "{elevation.raised}"
    divider: "1px hairline in {colors.border}"
  card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.xl}"
    padding: "24px"
    elevation: "{elevation.hover}"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    border: "1px solid {colors.border}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: 36px
    elevation: "{elevation.rest}"
  chip-glass-inline:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    elevation: "{elevation.glass-on-aurora}"
    alignment: "Aligns to the cap-height of the surrounding display serif and floats over the aurora wash."
  checkbox:
    size: 18px
    rounded: "{rounded.sm}"
    border: "1.5px solid {colors.on-surface}"
    backgroundColor: "{colors.surface}"
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    border: "1.5px solid {colors.primary}"
    iconColor: "#FFFFFF"
  tabs-active:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
  tabs-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-muted}"
    rounded: "{rounded.full}"
  focus-ring:
    color: "{colors.focus}"
    width: 4px
    opacity: 0.28
---

## Overview

Halcyon is a calm, premium, light-mode system organized around one painterly aurora. The aurora pools at the bottom-center of every page and dissolves into near-white at the top. The aurora is the system, not a decoration.

The vibe is editorial-meets-product: serene like a glossy magazine spread, precise like a high-end SaaS console. Halcyon should feel slow, expensive, and deliberate. It should never feel busy, technical, or template-driven.

What the system feels like in use:

- One single quiet stage, framed by a thin pale margin, that fills the viewport.
- A centered serif headline that reads like a sentence broken by small white objects.
- One magenta CTA in the entire view. The eye lands on it instantly.

What Halcyon must never feel like:

- A purple-blue SaaS dashboard with a corner gradient blob.
- A "glassmorphism" UI with heavy blur and chrome.
- A dense editorial layout cluttered with all-caps labels, coordinates, or volume tags.
- A generic marketing page with multiple competing CTAs and feature grids stacked under the hero.

Essential traits to preserve from the visual direction:

- The four-color aurora mesh (peach, rose, violet, sky) always appears together.
- The mesh is anchored to the lower half of the stage and fades to white above it.
- The hero is centered. The headline is the page.
- Inline glass chips are the signature element. They live inside the heading.

## Colors

Halcyon has three color families: ink, surface, and aurora. Plus one accent: magenta.

Roles:

- **Frame `#F2F3F5`** is the page background outside the stage. It exists so the stage reads as a lifted card. Never put content directly on the frame.
- **Surface `#FFFFFF`** is the top of the aurora wash and every component that floats over it: nav pills, search composer, chips, cards, glass chips.
- **Ink `#171729`** is the only text color on light surfaces. Use it for headings, body, navigation labels, and icons. Never substitute pure black.
- **Ink Muted `#5A5C72`** is the only secondary text tone. Use it for placeholders, inactive tabs, microcopy. Never use it for primary copy.
- **Aurora Peach, Rose, Violet, Sky** are the four mesh stops. They must always appear together in a single bloom; never use one in isolation as a fill, tint, or shadow tone.
- **Magenta `#C5197C`** is reserved for one and only one primary CTA per view, plus the focus ring. It is the single loud color in the system.

Contrast rules:

- Ink on Surface is the contract for body text.
- Ink Muted is permitted only for genuinely secondary microcopy. Placeholders count as secondary; sub-headings do not.
- White on Magenta is the only inversion allowed.

The aurora itself is generated, not painted. Use four radial gradients positioned roughly at 18%/95% (peach), 38%/88% (rose), 55%/82% (violet), and 82%/78% (sky), each fading to transparent by 70-72% radius. A separate vertical white veil dissolves the top half to near-white. Together they form one believable mesh; do not swap them, recolor them, or layer them onto colored surfaces.

## Typography

Halcyon pairs one high-contrast display serif with one neutral grotesque.

- **Instrument Serif** owns the hero headline and only the hero headline. Section headings may use it sparingly. Anywhere else is wrong.
- **Inter** owns navigation, body, buttons, chips, microcopy, labels, and forms.

Rules:

- Set the display serif large. Hero target is `clamp(56px, 9vw, 112px)` with `0.95` line-height and `-0.02em` tracking. Never set the serif below 32px.
- Italics inside the display serif are allowed for one or two emphasis words. Never italicize an entire headline.
- Body text is `17px` Inter Regular on `1.6` line-height. Lead paragraphs may go to `18px`.
- Use weight 500 for navigation, chips, and buttons. Weight 600 only for in-product headlines that are not the hero.
- Numbers in chips and counts use Inter at 13-14px, weight 500-600.
- Never set sans body in muted ink unless the line is genuinely secondary. Sub-headings are not secondary.

Hierarchy is carried by size and serif/sans contrast, not by color, weight, or all-caps. There are no all-caps labels in Halcyon.

## Layout

Halcyon is a stage, not a wall of sections.

**Page structure (one screen, one stage):**

- The viewport background is the frame color.
- A `16px` margin of frame is visible on all sides.
- Inside the margin sits a single rounded card, the **stage**, with `28px` corner radius and the aurora wash inside.
- All content lives inside the stage. The stage has minimum height `720px` on desktop.

**Stage internal rhythm:**

1. Top navigation at `28px` top padding. Three columns: brand on the left, links centered, end action on the right.
2. Centered hero, vertically pushed slightly above optical center. The hero is the only required region.
3. Optional bottom-right microcopy block, no larger than `320px` wide, paired with the brand mark at `14px`.

**Hero composition:**

- Center-aligned text. Maximum content width `1180px`, but the headline should wrap into 2-3 visual lines.
- The headline is a single sentence broken by 1-3 inline glass chips. Treat the chips as inline punctuation, not decoration.
- A primary action region sits below the headline. Either a single CTA, or a rounded **search composer** that joins 2-3 inputs and ends with the magenta CTA.
- Optional filter chip row below the action, center-justified, with one ghost "Clear all" affordance at the end.

**Whitespace contract:**

- Hero vertical padding is generous: `clamp(64px, 9vw, 120px)` top and `clamp(80px, 12vw, 140px)` bottom.
- Gap between headline, action, and filter row is `32-40px`. Do not tighten this to look denser.
- The aurora's lower half should remain visually open below the action region. Do not fill it with cards, badges, or feature tiles.

**Grid behavior:**

- The hero is single-column and centered. There is no multi-column grid in the canonical layout.
- If a downstream layout needs cards or a feature list, place them in a fresh stage below the hero with its own aurora, never as a row glued under the hero search bar.

**Responsive behavior:**

- Below `860px`, drop the centered nav links into the brand row. Keep the brand and end action.
- The search composer wraps: each field becomes a full-width pill on a light quiet surface, and the magenta CTA spans the row width.
- Inline glass chips shrink one step and tuck closer to surrounding serif text.

**Off-canonical pages:**

- Use the stage frame for every page. Inside, use left alignment for content-heavy pages (forms, dashboards), but keep the aurora in place.
- Never replace the aurora with a flat colored block.

## Elevation & Depth

Halcyon depth is built from layered micro-shadows, never from a single drop shadow. Every lifted surface combines three things:

1. A 1px inner highlight in `rgba(255,255,255,0.7)` at the top edge.
2. A tight `rgba(23,23,41,0.04-0.06)` shadow at 1-2px blur to seat the element on the surface beneath.
3. A softer `rgba(23,23,41,0.08-0.18)` shadow at 24-40px blur with 12-20px y-offset to lift it.

Components that float directly over the aurora (search composer, inline glass chips) gain a fourth nuance: the diffuse shadow shifts into the rose/violet range, `rgba(108,60,140,0.12-0.18)`. This is what makes white on aurora feel grounded instead of pasted on.

The stage itself uses the heaviest shadow in the system. Inside the stage, components step down: search composer (raised), filter chips (rest), inline glass chips (glass-on-aurora). The hero text uses no shadow.

Never use backdrop-filter blur. Never use single-layer drop shadows. Never colorize shadows outside the rose/violet range.

## Shapes

Halcyon is fully rounded geometry. No sharp 90-degree corners exist except at the viewport edge.

- Stage: `28-32px` radius.
- Cards: `24px` radius.
- Inputs, buttons, chips, glass chips, tabs: pill, `999px`.
- Avatars: circle, `999px`, with a `2px` white ring.
- Checkboxes: square, `6px` radius. This is the one almost-square shape in the system.

The pill is the default. When in doubt, use a pill.

## Components

**Top navigation.** Three-column grid. Brand wordmark (Instrument Serif, 26px) with the four-point sparkle mark to its left in ink. Center links in Inter 500, 14px, with hover shifting to magenta. End slot holds a single white secondary "Get started" pill.

**Primary button.** Magenta fill, white text, Inter 500, fully rounded, 44px height (or 56px when paired with the search composer), 22-28px horizontal padding. Hover deepens to magenta hover. The button carries its own warm shadow: `0 12px 20px -10px rgba(197,25,124,0.6)`. There is one primary button per view.

**Secondary button.** White surface, ink text, 1px border in the border token, fully rounded, same height as primary. Use for "Get started" in the nav, secondary actions in cards, and anywhere a calmer affordance is needed.

**Ghost button / link.** Transparent, ink text, hover shifts to magenta. Use for "Clear all" or tertiary navigation.

**Input.** White surface, fully rounded, 56px tall, 20px horizontal padding, leading Lucide icon in ink (or muted ink for prompts), 17px Inter placeholder in ink muted. Focus state: 1px magenta border plus the magenta focus ring. Inputs almost always live inside a search composer rather than standing alone.

**Search composer.** A larger pill wrapping 2-3 inputs separated by 1px vertical hairlines in the border color, ending with the primary magenta CTA. The composer has the system's raised elevation. Inputs inside the composer drop their own borders and rely on the wrapper.

**Card.** White surface, 24px radius, 1px hairline border, hover elevation, 24-28px padding. Cards sit on the aurora, not on the frame.

**Filter chip.** 36px tall pill, 16px horizontal padding, Inter 500 at 14px, 1px hairline border, rest elevation. Active state darkens the border to ink.

**Inline glass chip (signature).** A small fully rounded white capsule that slots in between serif words and carries an illustrative payload: an overlapping avatar cluster with a count tag, a tiny shape silhouette, the four-point sparkle, or a country/region mark. Padding `8px 16px`. Uses the glass-on-aurora shadow. Vertically nudged `-0.08em` so it aligns to the cap-height of the surrounding display serif. Avatars inside it are 28px circles with `2px` white rings, overlapping by 10px.

**Studio card.** A white 24px-radius card with 10px inner padding wrapping a 4:3 miniature aurora plate. The plate carries all four hues together, dissolved to white at its top, with the bloom anchors shifted per card so a grid never repeats. One inline glass chip sits bottom-left on the plate and carries real data (team size). Below the plate: name in Instrument Serif at 32px, a muted Lucide meta line (city and starting price), and a two-line Inter description. Cards live in a three-column grid inside their own stage, never under the hero composer. Hover lifts 2px to raised elevation.

**Pull quote.** The hero's serif-sentence pattern reused at section scale, `clamp(40px, 5.2vw, 72px)`, broken by exactly one inline glass chip, with at most two italic words. Below it: a 36px avatar with name in ink and role in ink muted, then the stage's single magenta CTA.

**Footer.** Lives inside the final stage, below a hairline in `rgba(23,23,41,0.08)`. Brand wordmark left, three Inter 500 links, one muted line of microcopy. Never a separate dark block.

**Microcopy block.** A 320px-wide pairing of the four-point sparkle mark at 14px with a 2-4 line note in ink muted, 14px Inter. Lives only in the bottom-right of the stage and only when it carries real information.

**Checkbox.** Square 18px, 6px radius, 1.5px ink border. Checked state fills magenta with a white Lucide check.

**Tabs.** Inline pill group on white surface with 4px padding. Active tab fills with the frame color and switches to ink; inactive tabs use ink muted.

**Iconography.** Lucide, ISC license, https://lucide.dev/. One library only. Outline weight `1.75`. Sized at 16-20px inside controls, 14-16px inside chips and microcopy. Always render in `currentColor`. Never scale icons above 32px. Do not invent custom SVG paths.

**Imagery.** Halcyon does not require photographic imagery. When images appear, they live inside a 24px-radius card on the aurora or as a 28px avatar inside a glass chip. Avatars may use any of the four aurora hues as a placeholder backdrop. Never apply a gradient filter to an avatar.

## Do's and Don'ts

**Do** keep one and only one stage per page, with one aurora, framed by the pale margin. The frame is structural, not decorative.

**Do** center the hero. Halcyon's identity is the centered serif sentence broken by inline glass chips. Treat this as a rule, not a suggestion.

**Do** use the four aurora hues as a single mesh, with peach and rose at the bottom-left, violet in the lower-center, and sky on the right. The mesh must dissolve to near-white in the upper half.

**Do** keep exactly one magenta element in the visible view: the primary CTA. Focus rings are exempt because they appear only on user intent.

**Do** anchor every floating element with the three-layer shadow. Inner highlight, tight near-shadow, soft far-shadow.

**Do** break the headline with 1-3 inline glass chips, vertically tuned to the cap-height of the serif. They are the signature.

**Do** prefer fewer, larger components over many small ones. A single oversized headline, a single search composer, a single CTA, a tight row of filter chips.

**Don't** add an eyebrow or kicker above the hero or any section heading. Lead with the heading itself.

**Don't** place a section heading and its description side by side on the same line. Stack heading and supporting text vertically.

**Don't** use any of the aurora hues in isolation as a fill, button color, or text color. They exist only as a mesh.

**Don't** introduce a purple-to-blue linear gradient. Halcyon's color motion is a radial mesh, not a sweep.

**Don't** apply `backdrop-filter: blur()` to chips, the search composer, or cards. They are opaque white over a soft mesh, not glass.

**Don't** use single-layer drop shadows. Every elevation is composed of at least three layers.

**Don't** scatter all-caps monospace micro-labels, coordinates, volume tags, reading times, or "PLATE 01" decoration. The system has no such surfaces.

**Don't** decorate with pills or badges that carry no real data. Filter chips and inline glass chips are the only allowed pill patterns, and they always carry a real label, action, or payload.

**Don't** number cards (01, 02, 03) unless the content is genuinely a sequential process.

**Don't** scale Lucide icons above 32px to act as illustrations. If a graphic is needed, use the four-point sparkle mark, an avatar cluster, or a card with a real image.

**Don't** use em dashes in headings or body text. Rewrite with commas, periods, or parentheses.

**Don't** use the words *unleash*, *unlock*, *supercharge*, *elevate*, *seamless*, *leverage*, *dive in*, *tapestry*, *next-generation*, or *next-level* anywhere in product copy.

**Don't** stack a feature grid, testimonial row, or pricing block directly under the hero search composer. If those exist, give them their own stage below the hero stage with its own aurora.

**Don't** swap Instrument Serif or Inter for a similar-looking alternative. The contrast between the two is the typography.
