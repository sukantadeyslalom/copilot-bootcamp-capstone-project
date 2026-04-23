---
name: "execute-step"
description: "Execute instructions from the current GitHub Issue step"
agent: "tdd-developer"
model: "Claude Sonnet 4.5 (copilot)"
argument-hint: "issue-number (optional)"
tools: [search, read, edit, execute, web, todo]
---

Follow [repository instructions](../copilot-instructions.md), especially the `Workflow Utilities`, `Git Workflow`, and testing guidance sections.

Execute the instructions from the current GitHub Issue step.

Arguments:

- `issue-number` is optional

Workflow:

1. If `issue-number` is not provided, use `gh` CLI to find the exercise issue using the repository workflow guidance.
2. Get the full issue content with comments.
3. Parse the latest relevant step instructions from the issue comments.
4. Execute each `:keyboard: Activity:` section systematically.
5. Keep the work scoped to the current step activities.

Scope boundaries:

- Do not create or run Playwright UI tests in this prompt.
- Use `/create-ui-tests` and `/run-ui-tests` for Playwright UI work.
- Do not commit or push changes in this prompt.

Handoff rule:

- If the current step includes Playwright UI work, stop implementation after non-UI activities are complete and direct the user to `/create-ui-tests` followed by `/run-ui-tests` before validation.

Completion behavior:

- Stop after completing the current activities.
- Then provide next commands in this exact order:

If the current step requires UI workflow:

1. `/create-ui-tests`
2. `/run-ui-tests`
3. `/validate-step {step-number}`

If the current step does not require UI workflow:

1. `/validate-step {step-number}`

Never recommend `/validate-step` before required UI prompts.

Important:

- Follow testing scope constraints from [repository instructions](../copilot-instructions.md).