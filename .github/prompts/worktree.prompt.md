---
description: Create a git worktree for parallel Copilot sessions
mode: agent
---

Create a new git worktree for running a parallel session.

Steps:

1. If no name argument was provided, generate one from today's date and a short descriptor (e.g., `2026-02-03-feature`)
2. Run: `git worktree add worktrees/$name origin/main`
3. Confirm the worktree was created successfully
4. Print the path to the new worktree: `worktrees/$name`
5. Remind the user they can list worktrees with `git worktree list` and remove with `git worktree remove worktrees/$name`
