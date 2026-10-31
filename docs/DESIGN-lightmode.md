---
name: Rosy Minimal
colors:
  surface: '#fff8f7'
  surface-dim: '#fad0d4'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f1'
  surface-container: '#ffe9ea'
  surface-container-high: '#ffe1e4'
  surface-container-highest: '#ffd9dd'
  on-surface: '#2c1519'
  on-surface-variant: '#5c3f40'
  inverse-surface: '#44292d'
  inverse-on-surface: '#ffecee'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0037'
  primary: '#b80035'
  on-primary: '#ffffff'
  primary-container: '#e11d48'
  on-primary-container: '#fffaf9'
  inverse-primary: '#ffb3b6'
  secondary: '#8f4953'
  on-secondary: '#ffffff'
  secondary-container: '#ffa6b1'
  on-secondary-container: '#7a3842'
  tertiary: '#735166'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d697f'
  on-tertiary-container: '#fffafa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#ffd9dc'
  secondary-fixed-dim: '#ffb2bb'
  on-secondary-fixed: '#3b0613'
  on-secondary-fixed-variant: '#73323d'
  tertiary-fixed: '#ffd8ed'
  tertiary-fixed-dim: '#e5bad3'
  on-tertiary-fixed: '#2c1325'
  on-tertiary-fixed-variant: '#5c3d51'
  background: '#fff8f7'
  on-background: '#2c1519'
  surface-variant: '#ffd9dd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system expresses quiet luxury, refined wellbeing, and contemporary editorial sensibility. It departs from sterile, clinical minimalism by introducing delicate warmth through cosmetic petal undertones and deep, grounding berry neutrals. Designed for an aspirational lifestyle, beauty, and modern wellness portal, the interface conveys poise, composure, and deliberate curation.

The aesthetic fuses editorial minimalism with subtle tactile lightness:
- **Atmospheric Palette:** Generous expanses of soft-tinted canvas replace stark whites, allowing pure white content containers to float with quiet tactility.
- **Editorial Poise:** High-contrast serif headlines evoke independent fashion journals and architectural monographs, anchored by structural geometric sans-serif utility text.
- **Micro-Delicacy:** Structural definition relies on hairline rose borders, restrained blush tinting, and gossamer-soft tinted ambient shadows rather than structural heaviness.

## Colors

The palette is tuned around the interaction of soft floral undertones and deep, grounded pigment:

- **Canvas Background (`#FFF1F2`):** Ultra-soft petal pink. Serves as the global backdrop, establishing immediate warmth and reducing ocular fatigue compared to pure white.
- **Surface / Card Background (`#FFFFFF`):** Crisp pure white. Used selectively for interactive cards, sheets, drop-downs, and focal containers to lift content off the petal canvas.
- **Primary / Accent (`#E11D48`):** Deep raspberry rose. Reserved for primary calls-to-action, key interactive indicators, active selection tabs, and critical focus triggers.
- **Secondary Accent (`#FDA4AF`):** Light blush. Applied to interactive hover states, active pill fills, soft badge surfaces, and decorative progress indicators.
- **Border / Hairline (`#FBCFE8`):** Delicate soft rose. Used across all dividers, card outlines, and component frames to establish structure without visual noise.
- **Text & Neutral Master (`#291216`):** Deep rose-brown. Replaces standard carbon black with high-density warm contrast. Used at full opacity for headings and key copy, scaled to 70% opacity for secondary body, and 45% for tertiary metadata.

## Typography

Typography establishes an editorial atmosphere:

- **Playfair Display:** Used exclusively for editorial narrative anchors, collection titles, article leads, and section headers. Headings favor italic variants sparingly for evocative accent words within lifestyle feature leads.
- **Plus Jakarta Sans:** Balances the expressive serif with geometric discipline and high optical clarity across dense UI screens, metadata, reading feeds, and transaction controls.
- **Tracking & Proportion:** Display headers use tighter tracking (`-0.01em` to `-0.02em`) to maintain editorial density. Eyebrows and small functional labels (`label-sm`, `label-md`) use extended tracking with uppercase casing to create crisp, architectural captions.

## Layout & Spacing

The layout is built around a controlled 12-column grid that shifts into focused reading containers and asymmetrical editorial spreads:

- **Grid Rhythms:**
  - **Desktop (1280px+):** 12 columns, `gutter` at `1.5rem`, outer `margin` at `3rem` (clamped to max content width of `1360px`).
  - **Tablet (768px – 1279px):** 8 columns, `gutter` at `1.25rem`, outer `margin` at `2rem`.
  - **Mobile (< 768px):** 4 columns, `gutter-mobile` at `1rem`, outer `margin-mobile` at `1.25rem`.

- **Negative Space Strategy:** White space is treated as an active visual boundary. Major editorial modules utilize `space-2xl` (`4rem`) vertical spacing to enforce deliberate rhythm and prevent visual crowding. Component internals preserve breathing room with minimum `space-lg` (`1.5rem`) padding for standard cards.

## Elevation & Depth

Depth is established through high-key tonal layering and gossamer-tinted shadows:

- **Base Elevation (Flat/Resting):** Surfaces rest flush with the `#FFF1F2` canvas or contrast as pure white `#FFFFFF` planes framed by a `1px` solid `#FBCFE8` border.
- **Elevated Surfaces (Cards, Modules):** White cards utilize subtle, petal-tinted ambient diffusion:
  `box-shadow: 0 8px 30px -4px rgba(225, 29, 72, 0.04), 0 2px 8px -2px rgba(41, 18, 22, 0.02)`.
- **Hover & Floating Panels (Flyouts, Menus, Active Cards):** Elevated layers scale shadow diffusion while retaining rose saturation:
  `box-shadow: 0 16px 40px -6px rgba(225, 29, 72, 0.08), 0 4px 12px -2px rgba(41, 18, 22, 0.04)`.
- **Frosted Translucency:** Floating navigation strips and glass badges use `background: rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(16px)` and a `1px` bottom border of `#FBCFE8`.

## Shapes

The interface balances soft geometry with structured refinement:

- **Containers & Cards:** Utilize `rounded-lg` (`1rem` / `16px`) to soften visual boundaries while retaining architectural integrity.
- **Interactive Controls (Inputs, Base Buttons):** Follow `rounded` (`0.5rem` / `8px`) for compact precision.
- **Editorial Badges, Chips & Pills:** Apply full pill radius (`9999px`) to create distinction between navigational structural cards and dynamic topical tags.
- **Dividers:** Maintain hairlines of `1px` width using `#FBCFE8`.

## Components

### Buttons
- **Primary:** Filled `#E11D48` background with `#FFFFFF` text. Hover transitions smoothly to `#BE123C`. Active state scales slightly to `0.98`. Focus ring: `2px solid #FDA4AF` with `2px` offset.
- **Secondary / Ghost:** `#FFFFFF` background with `1px` border of `#FBCFE8`, text in `#291216`. Hover triggers background `#FFF1F2` with border shifting to `#FDA4AF`.
- **Text Link:** `#291216` with deliberate `1px` underline offset by `4px` in `#FDA4AF`. Hover transitions underline to `#E11D48`.

### Chips & Badges
- **Editorial Category Chips:** `#FFFFFF` background, `1px solid #FBCFE8`, `label-sm` uppercase text in `#291216`. Pill-shaped (`rounded-full`).
- **Accent Badges:** Tinted `#FFF1F2` fill, text in `#E11D48`, no border, used for curated highlights and curated status tags.

### Form Inputs
- **Text Fields:** `#FFFFFF` background, `1px solid #FBCFE8`, `rounded` (`8px`) corners. Body text in `#291216`, placeholder in `#291216` at 40% opacity. 
- **Focus State:** Border shifts directly to `#E11D48` with a soft `0 0 0 3px rgba(225, 29, 72, 0.12)` halo.

### Selection Controls
- **Checkboxes & Radios:** `18px` boundary with `1px solid #FBCFE8`. Selected state fills with `#E11D48` displaying crisp white iconography.

### Cards
- **Editorial Showcase Card:** `#FFFFFF` surface, `1px solid #FBCFE8`, `rounded-lg` (`16px`) corners, ambient rose shadow. Imagery framed inside with seamless corner matching and a gentle `scale(1.02)` transform on container hover.
- **Curated Quote / Minimal Callout:** Borderless `#FFF1F2` surface nested inside `#FFFFFF` cards, framed by an asymmetrical left accent rule of `3px solid #E11D48`.

### Navigation & Tab Bars
- **Pill Tabs:** Contained within a `#FFFFFF` bar bordered by `#FBCFE8`. The active tab takes `#E11D48` background with `#FFFFFF` typography; inactive tabs display `#291216` text at 70% opacity with transparent background.