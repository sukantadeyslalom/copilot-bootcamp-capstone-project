---
name: "validate-step"
description: "Validate that all success criteria for the current step are met"
agent: "code-reviewer"
model: "Claude Sonnet 4.5 (copilot)"
argument-hint: "step-number (required, e.g. 5-0 or 5-1)"
tools: [search, read, execute, web, todo]
---

Follow [repository instructions](../copilot-instructions.md), especially the `Workflow Utilities` section.

Validate that all success criteria for the requested step are met.

Arguments:

- `step-number` is required, for example `5-0` or `5-1`

If the user does not provide `step-number`, ask for it before proceeding.

Workflow:

1. Use `gh` CLI to find the main exercise issue.
2. Get the issue content with comments.
3. Search the issue content for `# Step {step-number}:`.
4. Extract that step’s `Success Criteria` section.
5. Check each criterion against the current workspace state.
6. Report completion status and provide specific guidance for any incomplete items.

Output expectations:

- list each success criterion
- mark it complete or incomplete
- explain the evidence for each judgment
- give concrete next actions for incomplete criteria