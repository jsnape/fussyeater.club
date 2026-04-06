# Household

## Household Invites

The household page contains an invites section with two areas:

- **Active Invite** (single current invite, if one exists)
- **Expired Invites** (non-active historical invites only)

### Active Invite

Displays:

- Full code **only immediately after create/regenerate**
- Uses as `used / max` (`maxUses - remainingUses` / `maxUses`)
- Expiry date

Actions:

- **Copy Link** → copies `/register?invite=<CODE>`
- **Regenerate invite** → revokes prior active invite and creates a new one
- **Revoke** → revokes the current active invite

### Expired Invites

Displays columns:

- Masked code
- Status (`revoked`, `expired`, `exhausted`)
- Uses as `used / max`
- Expiry date

Rules:

- Active invites are not shown in the expired invites list.
- Historical rows do not include per-row action buttons.
- At most one invite is active at any time.

### Create vs Regenerate

- Show **Create invite** when there is no active invite.
- Show **Regenerate invite** when an active invite exists.
- Both paths refresh the full invite list after success.
