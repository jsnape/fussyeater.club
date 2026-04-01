---
description: Commit, push, and open a PR
mode: agent
---

Follow these steps in order:

1. Run `git status` to see what files have changed
2. Run `git diff` to review the changes
3. Stage the appropriate files with `git add`
4. Create a commit with a clear, descriptive message following conventional commits format. Always include this trailer:
   `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
5. Push to the remote branch (create remote branch if needed with `-u origin <branch>`)
6. Create a Pull Request using `gh pr create` with:
   - A clear title summarizing the changes
   - A description with:
     - Summary of what changed and why
     - Any testing done
     - Any notes for reviewers

If there are any issues at any step, stop and report them.
