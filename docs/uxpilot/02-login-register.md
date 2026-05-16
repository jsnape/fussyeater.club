# Login / Register

> Route: `/login` and `/register` (combined as tabbed view)

## Purpose

Authenticate existing users or onboard new users. Minimal, focused layout with no distractions.

---

## Layout

- Simplified header: logo only, centred, no navigation links
- Full-height centred content area (vertically and horizontally centred card)
- Simplified footer: copyright text only

---

## Auth Card

Single card container with two tabs:

### Tab Bar

- Two equal-width tabs: "Log In" | "Create Account"
- Active tab has bottom border indicator and emphasised text
- Switching tabs reveals the corresponding form (no page reload)

### Social Auth Block (shared between tabs)

- "Continue with Google" button (icon + text)
- "Continue with Apple" button (icon + text)
- Divider line with centred text: "Or continue with email"

---

### Login Form (default active tab)

- **Email Address** — text input, required
- **Password** — password input with toggle show/hide button (eye icon), required
- "Forgot password?" link aligned to the right of the password label
- **"Log In"** submit button (full width, primary style)

---

### Registration Form

- **Caregiver Name** — text input, required, placeholder "Jane Doe"
- **Email Address** — text input, required
- **Password** — password input with toggle show/hide, required
  - Inline helper text: "Must be at least 8 characters with 1 number and 1 special character."
- **Terms agreement** — checkbox with label linking to Terms of Service and Privacy Policy. Includes allergy disclaimer text: user is responsible for verifying ingredients
- **"Create Account"** submit button (full width, primary style)
- Post-submit note: "You'll set up your family profile next."

---

## Key Interactions

- Tab switch is instant (client-side toggle, no navigation)
- Password visibility toggle (eye icon toggles between text/password type)
- Form validation: inline field-level errors
- After successful registration, user is redirected to household/profile setup
- After successful login, user is redirected to recipes browse or meal planner
