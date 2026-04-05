# Token Reference

This file is the quick implementation companion to the master design system.
For full rules and rationale, see:

- `design-system/fussyeater-club/MASTER.md`
- `design-system/fussyeater-club/pages/home.md` (home-specific overrides)

## Build Order (Required)

1. Use Tailwind utility classes first.
2. Search Flowbite before writing new custom UI:

- `flowbite-svelte` for components
- `flowbite-svelte-icons` for icons
- `flowbite-svelte-blocks` for layout blocks

3. Add custom CSS classes only when reusable behavior cannot be expressed with utilities and existing Flowbite pieces.

## Color Tokens

| Token                   | Value     | Typical Usage                         |
| ----------------------- | --------- | ------------------------------------- |
| `--fe-color-primary`    | `#dc2626` | Primary brand accents, links, borders |
| `--fe-color-secondary`  | `#f87171` | Supporting accents, hover surfaces    |
| `--fe-color-accent`     | `#ca8a04` | Primary CTA background                |
| `--fe-color-success`    | `#16a34a` | Success badges and confirmations      |
| `--fe-color-surface`    | `#fef2f2` | Page/background surface               |
| `--fe-color-text`       | `#450a0a` | Main body text                        |
| `--fe-color-text-muted` | `#7f1d1d` | Secondary/help text                   |

## Spacing Tokens

| Token            | Value  |
| ---------------- | ------ |
| `--fe-space-xs`  | `4px`  |
| `--fe-space-sm`  | `8px`  |
| `--fe-space-md`  | `16px` |
| `--fe-space-lg`  | `24px` |
| `--fe-space-xl`  | `32px` |
| `--fe-space-2xl` | `48px` |

## Elevation Tokens

| Token            | Value                                |
| ---------------- | ------------------------------------ |
| `--fe-shadow-sm` | `0 1px 2px rgba(69, 10, 10, 0.08)`   |
| `--fe-shadow-md` | `0 6px 18px rgba(69, 10, 10, 0.12)`  |
| `--fe-shadow-lg` | `0 12px 30px rgba(69, 10, 10, 0.16)` |

## Typography

- Heading font: `Varela Round`
- Body font: `Nunito Sans`
- Mobile body text minimum: `16px`

## Copy-Paste Recipes

### Primary CTA Button

```css
.fe-btn-primary {
    min-height: 44px;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    background: var(--fe-color-accent);
    color: #fff;
    font-weight: 700;
    box-shadow: var(--fe-shadow-sm);
    transition:
        transform 180ms ease,
        opacity 180ms ease,
        box-shadow 180ms ease;
}

.fe-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: var(--fe-shadow-md);
}

.fe-btn-primary:focus-visible {
    outline: 2px solid var(--fe-color-primary);
    outline-offset: 2px;
}
```

### Secondary Button

```css
.fe-btn-secondary {
    min-height: 44px;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--fe-color-primary);
    background: #fff;
    color: var(--fe-color-primary);
    font-weight: 700;
}
```

### Card

```css
.fe-card {
    border-radius: 0.75rem;
    padding: var(--fe-space-lg);
    background: #fff;
    box-shadow: var(--fe-shadow-sm);
    transition:
        box-shadow 180ms ease,
        transform 180ms ease;
}

.fe-card:hover {
    box-shadow: var(--fe-shadow-md);
    transform: translateY(-2px);
}
```

### Input

```css
.fe-input {
    min-height: 44px;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    padding: 0.625rem 0.75rem;
    font-size: 16px;
    color: var(--fe-color-text);
    background: #fff;
}

.fe-input:focus-visible {
    outline: 2px solid var(--fe-color-primary);
    outline-offset: 1px;
}
```

## Accessibility Quick Checks

- Contrast ratio 4.5:1 or better for text.
- Touch target 44x44 minimum.
- Visible keyboard focus for all interactive controls.
- Respect reduced motion preferences.
