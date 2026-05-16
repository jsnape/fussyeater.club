# Shopping List — Empty State

> Route: `/shopping` (when no meals are planned)

## Purpose

Guide users to the meal planner when their shopping list is empty. Provides a friendly, non-punitive empty state with clear call-to-action.

---

## Layout

- Standard app header with navigation (filter + account buttons)
- Full-height centred content area
- Bottom nav bar (mobile)

---

## Empty State Content (centred)

### Illustration

- Decorative background: soft gradient blobs (non-functional)
- Central rounded container with illustration image (e.g. cooking pot with steam)
- Subtle shadow/border treatment

### Copy

- Heading: "Your basket is waiting"
- Body text: "It looks like you haven't planned any meals for the week yet. Let's find something your little one will love."
- Text is centred, max-width constrained

### Call to Action

- "Go to Meal Planner" primary pill button (centred)
- Book/menu icon within button

---

## Syncing State Overlay (conditional)

When the shopping list is being generated from the meal plan, show a full-screen overlay:

- Backdrop: blurred surface with high opacity
- Centred card containing:
  - **Spinner:** circular progress indicator with sync icon in centre
  - **Heading:** "Gathering your ingredients..."
  - **Description:** "We're double-checking your meal plan for allergies and dietary needs."
  - **Progress bar:** horizontal bar showing generation progress
  - **Status text:** "Almost ready to shop!" (italic)

---

## Mobile Bottom Navigation

- Same 4-tab bar as shopping list (Kitchen, Recipes, List active, Progress)

---

## Key Interactions

- "Go to Meal Planner" navigates to `/planner`
- Syncing overlay appears automatically while list is being generated (no user interaction)
- Once syncing completes, overlay dismisses and full shopping list appears
