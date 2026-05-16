# Landing Page

> Route: `/` (unauthenticated visitors)
>
> Current status: **Implemented** — has hero, feature grid, CTA panel. Needs enhancement.

## Purpose

Convert first-time visitors (parents/caregivers of fussy eaters) into registered users. Communicate the emotional value — calmer, safer mealtimes — and build trust quickly.

---

## Layout

- Sticky top navigation (landing variant)
- Full-width vertical scroll of content sections
- No sidebar

---

## Navigation (Landing Variant)

- Logo/wordmark (left)
- Anchor links: "How It Works", "Recipes", "Stories" (scroll to sections)
- Right side: "Log In" text link + "Get Started" primary button
- Becomes sticky on scroll past hero

### Current implementation

`SiteNavbar` component exists but doesn't differentiate between landing and app navigation. Needs a landing-specific variant with anchor links and unauthenticated CTAs.

---

## Hero Section

- Two-column layout on desktop (text left, image right); stacks on mobile
- **Left column:**
  - Headline — emotional, outcome-focused (e.g. "Mealtimes, made happy.")
  - Supporting paragraph — briefly explain allergy-aware planning, sensory preferences, and stress-free shopping
  - Two CTAs: primary "Join the Club" + secondary "See How It Works"
  - Social proof line: avatar stack + "Joined by X+ relieved parents"
- **Right column:**
  - Large rounded hero image (family meal scene)
  - Floating overlay badge reinforcing a "win" moment (e.g. "Broccoli eaten! 🎉")
  - Two smaller floating badges: "Sensory-Friendly" (texture/colour filters) + "Allergy-Aware" (ingredient tracking)

### Current implementation

`HomeHeroSection` exists with hero image and CTA buttons. Needs: floating badges, social proof line, richer copy.

---

## How It Works (Value Propositions)

- Section heading + supporting subtitle (centred)
- 3-column responsive grid (single column mobile):
  1. **Granular Filtering** — icon, heading, description about texture/colour/temperature filters
  2. **Stress-Free Planning** — icon, heading, description about drag-and-drop weekly calendar
  3. **Smart Shopping Lists** — icon, heading, description about auto-generated, allergen-aware, categorised lists
- Each card: icon in circular container, heading, body text

### Current implementation

`HomeFeatureGrid` exists with 3 feature cards. Content needs updating to match above.

---

## Sample Recipe Gallery

- Section label (small caps) + heading (e.g. "Popular This Week")
- "Browse all recipes →" link (right-aligned on desktop)
- 4-column responsive grid (2-col tablet, 1-col mobile) of recipe preview cards
- Each card:
  - Tall aspect-ratio image with hover zoom
  - Time badge overlay (top-right)
  - Recipe title
  - Tag pills (dietary info: "Dairy-Free", "Nut-Free", etc.)
  - Texture descriptor (e.g. "Smooth", "Crunchy")

### Current implementation

Not implemented. New section needed.

---

## Testimonials

- Section heading
- 2-column grid (stacks on mobile) of testimonial cards
- Each card:
  - Decorative quote icon
  - Testimonial text
  - Author row: avatar, name, context (e.g. "Mum of 2, one with ARFID")

### Current implementation

Not implemented. New section needed.

---

## Final CTA Section

- Full-width container with heading + subtitle + social proof text
- Two CTAs: primary "Join the Club" + secondary "Try a Free Week"

### Current implementation

`HomeCtaPanel` exists with conditional Register button. Needs enhancement with dual CTAs and social proof.

---

## Footer

- Logo + tagline + copyright
- Links: Privacy Policy, Terms of Service, Help Centre, Contact
- Social media icon links

### Current implementation

Not implemented as a dedicated component. Needed site-wide.

---

## Key Interactions

- Navigation becomes sticky when scrolled past hero
- Recipe cards navigate to `/recipes/[id]` on click
- "See How It Works" smooth-scrolls to value props section
- "Browse all recipes" navigates to `/recipes`
- Hero CTAs link to `/register`
- Signed-in users see a different CTA (e.g. "Go to Planner") instead of registration prompts
