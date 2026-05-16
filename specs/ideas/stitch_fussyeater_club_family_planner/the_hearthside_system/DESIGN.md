---
name: The Hearthside System
colors:
  surface: '#fff8f4'
  surface-dim: '#e1d8d2'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2eb'
  surface-container: '#f5ece6'
  surface-container-high: '#f0e6e0'
  surface-container-highest: '#eae1da'
  on-surface: '#1f1b17'
  on-surface-variant: '#53443a'
  inverse-surface: '#34302b'
  inverse-on-surface: '#f8efe8'
  outline: '#867369'
  outline-variant: '#d8c2b6'
  surface-tint: '#8e4e1c'
  primary: '#8e4e1c'
  on-primary: '#ffffff'
  primary-container: '#f9a66c'
  on-primary-container: '#743a07'
  inverse-primary: '#ffb786'
  secondary: '#48654f'
  on-secondary: '#ffffff'
  secondary-container: '#caebcf'
  on-secondary-container: '#4e6b55'
  tertiary: '#9c432f'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffa18c'
  on-tertiary-container: '#802f1d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc6'
  primary-fixed-dim: '#ffb786'
  on-primary-fixed: '#311400'
  on-primary-fixed-variant: '#713704'
  secondary-fixed: '#caebcf'
  secondary-fixed-dim: '#aeceb4'
  on-secondary-fixed: '#042110'
  on-secondary-fixed-variant: '#314d39'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a4'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#7d2c1b'
  background: '#fff8f4'
  on-background: '#1f1b17'
  surface-variant: '#eae1da'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Literata
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-gap-desktop: 80px
  section-gap-mobile: 40px
  card-padding: 24px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is built on the foundation of empathy and reassurance. Designed for parents navigating the high-stress environment of mealtime, the aesthetic rejects the clinical "perfection" often found in health apps in favor of a "helpful friend" vibe. The style is **Soft-Tactile Minimalism**: it uses generous whitespace and clean layouts but softens the edges with organic shapes, warm textures, and human-centric typography.

The goal is to lower the user's heart rate. Every interaction should feel low-pressure, encouraging, and grounded in the reality of family life. We avoid sharp corners, aggressive saturation, and high-density information clusters to ensure the experience feels manageable and supportive.

## Colors

The palette is anchored in earthy, sun-drenched tones that evoke the warmth of a kitchen. 

- **Primary (Soft Apricot):** Used for primary actions and optimistic highlights. It provides energy without the urgency of a standard yellow.
- **Secondary (Sage):** Used for success states, health-related information, and calming background sections.
- **Accent (Terracotta):** Reserved for moments of delight, appetite-stimulating accents, and secondary focus areas.
- **Neutrals:** We avoid pure black (#000) and pure white (#FFF). The backgrounds use a soft cream base to reduce glare and visual fatigue, while text uses a warm charcoal to maintain high readability without the harsh contrast of true black.
- **Semantics:** Success is handled by a deeper Sage, Warning by a muted Ochre, and Errors by a soft, desaturated Red to avoid triggering "emergency" responses.

## Typography

This design system uses a distinctive pairing of a literary serif and an optimistic sans-serif.

- **Literata** is used for headings. Its calligraphic roots and sturdy construction provide an authoritative yet warm voice, making advice feel like it's coming from a trusted expert or a well-loved cookbook.
- **Quicksand** is used for all UI elements and body text. Its rounded terminals mirror the "soft" philosophy of the brand and ensure that even dense information feels approachable and easy to digest, particularly on mobile devices where many "in-the-kitchen" interactions occur.

Line heights are intentionally generous to improve legibility for tired parents, and "Display" sizes are slightly tightened in letter spacing to maintain a sophisticated editorial feel.

## Layout & Spacing

The layout follows a **Fluid Grid** model with an emphasis on breathing room. 

- **Desktop:** A 12-column grid with 24px gutters and 80px margins. Content is often centered in a "prose-width" container (max-width 800px) to prevent eye strain during long reading sessions.
- **Mobile:** A 4-column grid with 16px gutters and 24px margins.
- **Rhythm:** We use an 8px base spacing unit. Spacing between unrelated components should be generous (32px or 48px) to keep the UI from feeling cluttered or overwhelming.

We prioritize vertical stacking on mobile to ensure large, easy-to-tap targets that accommodate one-handed use while cooking or holding a child.

## Elevation & Depth

To maintain the low-pressure vibe, the design system avoids heavy shadows or high-contrast stacking. Depth is conveyed through:

- **Tonal Layers:** Using the primary background (`#FFFBF5`) for the canvas and a slightly darker surface color (`#F7F1E9`) for card containers. This creates "soft wells" of information rather than floating elements.
- **Ambient Shadows:** When elevation is required (e.g., for buttons or active cards), use extremely diffused shadows with a slight tint of the Primary or Accent color. Avoid grey shadows; use `rgba(107, 101, 96, 0.08)` for a warm, natural lift.
- **Soft Outlines:** Form fields and secondary buttons use a 1.5px border in a slightly darker neutral tone rather than shadows to keep the interface feeling flat and modern.

## Shapes

The shape language is defined by the **Rounded (Value 2)** preset. 

- **Standard Components:** Inputs, cards, and image containers use a `0.5rem` (8px) radius.
- **High-Interaction Components:** Buttons and chips use `rounded-xl` or `1.5rem` (24px) to create a friendly, "pill-like" appearance that invites interaction.
- **Imagery:** Photos should always have rounded corners to match the UI elements. Hard 90-degree angles are strictly forbidden as they conflict with the brand's comforting tone.

## Components

- **Buttons:** Primary buttons use the Primary (Apricot) fill with a soft shadow. Secondary buttons use a thick border (2px) in the Neutral tone. All buttons feature high internal padding (12px vertical, 24px horizontal) to ensure accessibility.
- **Cards:** Cards should use the `background_surface_hex` with no border. For recipe cards, use a "top-heavy" layout with large imagery and `Headline-sm` for titles.
- **Input Fields:** Large tap targets (min-height 56px). Labels are always visible and set in `Label-md`. Use the Primary color for the focus state border to create a warm highlight.
- **Chips/Tags:** Used for dietary requirements (e.g., "Dairy Free"). These are pill-shaped with the Secondary (Sage) background and a low-opacity fill.
- **Iconography:** Use soft-edged, monoline icons with a 2px stroke weight. Avoid sharp points or technical-looking icons. A "hand-drawn" slight irregularity is encouraged for decorative icons.
- **Progress Bars:** Used for "Trying New Foods" trackers. These should be thick (12px) with fully rounded caps, using a Sage-to-Apricot gradient to signify growth and energy.