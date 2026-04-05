# Design System Master File

> LOGIC: When building a specific page, check `design-system/fussyeater-club/pages/[page-name].md` first.
> If that file exists, its rules override this file.
> If not, follow this master file.

---

**Project:** FussyEater Club  
**Generated:** 2026-04-03  
**Category:** Family Recipe + Meal Planning

---

## Brand Direction

**Voice:** warm, practical, and reassuring.  
**Experience Goal:** reduce stress for families with picky eaters and help them decide what to cook fast.  
**Pattern:** Conversion-Optimized + Trust (Hero > Features > CTA).

## Implementation Priority

1. Prefer Tailwind utility classes over custom CSS classes for page-level styling.
2. Before building new UX components, check existing Flowbite packages in this order:
    - `flowbite-svelte` components
    - `flowbite-svelte-icons` icons
    - `flowbite-svelte-blocks` page blocks
3. Use `flowbite-svelte-icons` **Outline** variants by default for product UI (for example `BookOpenOutline` instead of `BookOpenSolid`). Use Solid variants only with explicit design approval.
4. Create custom CSS classes only when utilities and existing Flowbite building blocks do not satisfy reuse or accessibility needs.

## Tokens

### Color Palette

| Role         | Hex       | CSS Variable            |
| ------------ | --------- | ----------------------- |
| Primary      | `#DC2626` | `--fe-color-primary`    |
| Secondary    | `#F87171` | `--fe-color-secondary`  |
| Accent / CTA | `#CA8A04` | `--fe-color-accent`     |
| Success      | `#16A34A` | `--fe-color-success`    |
| Surface      | `#FEF2F2` | `--fe-color-surface`    |
| Text         | `#450A0A` | `--fe-color-text`       |
| Muted Text   | `#7F1D1D` | `--fe-color-text-muted` |

**Color Notes:** Appetizing red + warm gold, with green only for positive states.

### Typography

- **Heading Font:** Varela Round
- **Body Font:** Nunito Sans
- **Mood:** friendly, warm, approachable, readable
- **Google Fonts:** https://fonts.google.com/share?selection.family=Nunito+Sans:wght@300;400;500;600;700|Varela+Round

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700&family=Varela+Round&display=swap');
```

### Spacing Scale

| Token            | Value  |
| ---------------- | ------ |
| `--fe-space-xs`  | `4px`  |
| `--fe-space-sm`  | `8px`  |
| `--fe-space-md`  | `16px` |
| `--fe-space-lg`  | `24px` |
| `--fe-space-xl`  | `32px` |
| `--fe-space-2xl` | `48px` |

### Elevation

| Token            | Value                             |
| ---------------- | --------------------------------- |
| `--fe-shadow-sm` | `0 1px 2px rgba(69,10,10,0.08)`   |
| `--fe-shadow-md` | `0 6px 18px rgba(69,10,10,0.12)`  |
| `--fe-shadow-lg` | `0 12px 30px rgba(69,10,10,0.16)` |

## Component Guidance

### Buttons

- **Primary:** `--fe-color-accent` background, white text, medium shadow.
- **Secondary:** white background, `--fe-color-primary` border + text.
- **Hover motion:** opacity/translate only, 150-250ms.
- **Touch target:** min `44px` height.

### Cards

- Use `--fe-color-surface` or white.
- Radius: `12px`.
- Default with `--fe-shadow-sm`, hover to `--fe-shadow-md`.

### Form Inputs

- Min font size `16px` on mobile.
- Focus ring must be visible (`2px`+ outline/ring).
- Inline errors near the related field.

## UX Guardrails

- Maintain text contrast at or above `4.5:1`.
- Always show visible focus states.
- Respect `prefers-reduced-motion`.
- Prefer click/tap interactions over hover-only logic.
- Avoid horizontal overflow at `375px` width.

## Anti-Patterns

- Do not use generic template hero copy.
- Do not rely on color-only error/success signals.
- Do not hide key actions below the fold.
- Do not use decorative continuous animation.

## Implementation Checklist

- [ ] Hero has one clear above-fold CTA.
- [ ] Buttons and controls meet 44x44 touch target minimum.
- [ ] Focus states are visible on all interactive elements.
- [ ] Mobile body text is 16px or larger.
- [ ] Motion reduced for users requesting reduced motion.
