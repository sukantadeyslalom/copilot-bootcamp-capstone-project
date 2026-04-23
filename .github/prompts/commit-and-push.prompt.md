---
name: "commit-and-push"
description: "Analyze changes, generate commit message, and push to feature branch"
model: "Claude Sonnet 4.5 (copilot)"
argument-hint: "branch-name (required)"
tools: [read, execute, todo]
---

Follow [repository instructions](../copilot-instructions.md), especially the `Git Workflow` section.

Analyze changes, generate a commit message, and push to a feature branch.

Arguments:

- `branch-name` is required

If no branch name is provided, ask the user for it before doing anything else.

Workflow:

1. Determine whether the current step includes required UI workflow.
2. If UI workflow is required, also run `npm run test:ui` or require a successful `/run-ui-tests` result from the current chat before committing.
3. Analyze changes using `git diff`.
4. Generate a descriptive conventional commit message using the repository Git workflow guidance.
5. If the specified branch does not exist, create it with `git checkout -b <branch-name>`.
6. If the branch exists, switch to it with `git checkout <branch-name>`.
7. Stage all changes with `git add .`.
8. Commit with the generated message.
9. Push to the specified branch with `git push origin <branch-name>`.

Hard rules:

- Do not commit to `main`.
- Do not commit to any branch other than the user-provided branch name.
- Do not push until the branch context and required validations are satisfied.