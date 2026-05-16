# Home / Landing Page

> Route: `/` (unauthenticated visitors)

## Purpose

Convert first-time visitors (parents/caregivers of fussy eaters) into registered users. Communicate the emotional value of calmer mealtimes through a warm, approachable tone.

---

## Page Sections (top to bottom)

### Navigation Bar (sticky)

- Logo/wordmark (left)
- Desktop nav links: Recipes, Meal Planner, Shopping List, Household
- Right side: "Add Recipe" primary pill button (desktop only) + user avatar/account icon
- Mobile: hamburger or simplified nav

### Hero Section

- Two-column layout on desktop (text left, image right); stacks on mobile
- **Left column:**
  - Large headline focused on emotional outcome (e.g. "Mealtimes, made happy.")
  - Supporting body paragraph — discover recipes kids will eat, plan with confidence
  - Two CTAs: primary pill button "Join the Club" + secondary outlined button "See How It Works"
- **Right column:**
  - Large rounded image container (family meal scene) with a subtle rotated background shape behind it
  - **Floating success badge** (bottom-left overlay on desktop): icon + tiny label text + descriptive text (e.g. "Broccoli eaten! 🎉") — reinforces the "wins" concept

### Value Propositions

- Section heading + subtitle (centred)
- 3-column responsive grid of feature cards (single column on mobile):
  1. **Allergy-Aware** — icon in coloured container, heading, description about filtering by sensitivity
  2. **Stress-Free Planning** — icon, heading, description about drag-and-drop weekly calendar
  3. **Auto-Shopping** — icon, heading, description about auto-generated aisle-sorted shopping lists
- Each card has a rounded container, hover border effect

### Popular Recipes Preview

- Section label ("Tested by Kids" uppercase small text) + heading ("Popular this week")
- "Browse all 500+ recipes" link with arrow icon (right-aligned on desktop)
- 4-column responsive grid of recipe cards (2-col tablet, 1-col mobile)
- Each card:
  - Tall aspect-ratio image (4:5) with hover zoom
  - Time badge overlay (top-right): timer icon + duration
  - Recipe title below image
  - Tag pills (e.g. "DAIRY FREE", "FAST", "NUT FREE", "FREEZABLE")

### Final CTA Section

- Full-width rounded container with large heading + subtitle + social proof text ("Join 10,000+ parents...")
- Two CTAs: primary "Join the Club" + secondary "Try a Free Week"
- Decorative abstract circle shapes in background (non-functional)

### Footer

- Logo/wordmark + tagline + copyright
- Links: Help Center, Community, Account Settings, Privacy
- Social icons (circles with icon)

---

## Key Interactions

- Navigation is sticky on scroll
- Recipe cards have hover zoom on image + title colour change
- CTAs link to registration flow
- "See How It Works" scrolls to value props section
- "Browse all recipes" navigates to `/recipes`
