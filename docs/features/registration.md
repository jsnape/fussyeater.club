---
status: design-review
---

# Registration & Login

Support email/password and social login (Google, GitHub). New users are guided through household setup after first sign-in.

---

## Routes

| Path | Purpose |
|---|---|
| `/register` | Create a new account |
| `/login` | Sign in to an existing account |
| `/login/callback` | OAuth callback handler (server-side) |
| `/logout` | Sign out and clear session |

---

## User Flows

### New User (Email/Password)

```
/register
  → fill name, email, password
  → submit → server validates → create account
  → redirect → /household/setup (onboarding)
```

### Returning User (Email/Password)

```
/login
  → fill email, password
  → submit → server validates
  → redirect → / (or original destination)
```

### Social Login (Google / GitHub)

```
/login  (or /register)
  → click "Continue with Google" / "Continue with GitHub"
  → OAuth redirect → /login/callback
  → server exchanges code → upsert user
  → new user  → /household/setup
  → known user → / (or original destination)
```

### Forgot Password

```
/login
  → click "Forgot password?"
  → /forgot-password: enter email → send reset link
  → /reset-password?token=… → enter new password → /login
```

---

## Page Designs

All auth pages share a centred, single-column card layout with the site logo above, consistent with the white card / `bg-primary-50` surface pattern used throughout the design system.

### /register — Create Account

```
┌────────────────────────────────────┐
│         🍽 FussyEater Club          │  ← Logo/brand link to /
├────────────────────────────────────┤
│   Create your account              │  ← h2, text-2xl, primary-900
│                                    │
│  Full name         [____________]  │
│  Email             [____________]  │
│  Password          [____________]  │  ← show/hide toggle
│  Confirm password  [____________]  │
│                                    │
│  [ Create account ]                │  ← Button color="yellow" fullWidth
│                                    │
│  ─────────── or ───────────        │
│  [ 🔵 Continue with Google ]       │  ← Button color="light" fullWidth
│  [ ⚫ Continue with GitHub  ]       │  ← Button color="light" fullWidth
│                                    │
│  Already have an account? Log in   │  ← link to /login
└────────────────────────────────────┘
```

### /login — Sign In

```
┌────────────────────────────────────┐
│         🍽 FussyEater Club          │
├────────────────────────────────────┤
│   Welcome back                     │
│                                    │
│  Email             [____________]  │
│  Password          [____________]  │
│                          Forgot?   │  ← small link, right-aligned
│                                    │
│  [ Sign in ]                       │  ← Button color="yellow" fullWidth
│                                    │
│  ─────────── or ───────────        │
│  [ 🔵 Continue with Google ]       │
│  [ ⚫ Continue with GitHub  ]       │
│                                    │
│  No account yet? Register          │  ← link to /register
└────────────────────────────────────┘
```

---

## Components & Tokens

| Element | Flowbite component | Notes |
|---|---|---|
| Page wrapper | — | `min-h-dvh bg-primary-50 flex items-center justify-center px-4` |
| Card | `<Card>` | `border-primary-200 bg-white w-full max-w-sm` |
| Heading | — | `text-2xl font-semibold text-primary-900` |
| Label + Input | `<Label>` + `<Input>` | Standard pattern from design system |
| Password input | `<Input type="password">` | Suffix slot for show/hide toggle |
| Primary action | `<Button color="yellow">` | Full width |
| Social button | `<Button color="light">` | Full width, icon prefix |
| Divider | — | `<hr>` with "or" label, `text-primary-600 text-sm` |
| Error alert | `<Alert color="red">` | Inline, above primary action |
| Spinner | `<Spinner>` | Replaces button text during submit |

---

## Validation

### Register

| Field | Rules |
|---|---|
| Full name | Required, 2–100 chars |
| Email | Required, valid format |
| Password | Required, min 8 chars, at least one number |
| Confirm password | Must match password |

### Login

| Field | Rules |
|---|---|
| Email | Required, valid format |
| Password | Required |

Client-side validation runs on blur. Server returns field-level errors on failed submission; displayed beneath each field (`text-sm text-red-600`).

---

## Error & Loading States

- **Submit in progress**: button disabled, shows `<Spinner size="4" />` inline
- **Field error**: `<Helper color="red">` beneath the input
- **Form-level error** (e.g. wrong credentials): `<Alert color="red">` above the submit button
- **Social login failure**: same `<Alert color="red">` with short message + retry link

---

## Accessibility

- All inputs have visible `<Label>` and `aria-describedby` pointing to any helper/error text
- Password show/hide toggle uses `aria-label="Show password"` / `"Hide password"`
- Submit button communicates loading state with `aria-busy="true"` during submission
- Focus order: name → email → password → confirm → submit → social buttons

---

## Open Questions

1. **Cloudflare Access**: The wrangler config lists Cloudflare Access as the auth layer. Does this replace the email/password form entirely (Access handles it) or sit alongside a custom credential flow?
2. **Household onboarding**: What's the minimum info collected during `/household/setup`? (household name, adding family members?)
3. **Account verification**: Send email-verification link after sign-up, or skip for MVP?
4. **Rate limiting**: Apply Cloudflare rate-limiting rules on `/login` or handle in Worker middleware?
