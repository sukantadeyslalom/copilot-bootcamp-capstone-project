---
name: "create-ui-tests"
description: "Create UI tests for required critical user journeys"
agent: "test-engineer"
model: "Claude Sonnet 4.5 (copilot)"
argument-hint: "journeys (optional)"
tools: [search, read, edit, execute, todo]
---

Follow [repository instructions](../copilot-instructions.md), especially the testing guidance sections.

Create Playwright UI tests for required critical user journeys.

Arguments:

- `journeys` is optional

Default journeys if none are provided:

- create
- edit
- toggle
- delete
- core error-state handling

Rules:

- Create a maximum of 5 Playwright tests for this run.
- Target 3 to 5 total tests.
- Include at least 1 error-path test within that total.
- If more than 5 candidate scenarios exist, select the highest-risk 5 and list deferred scenarios instead of creating more tests.
- Generate or update UI tests using the project UI test framework.
- Prefer stable selectors and state-based waits.
- Apply Page Object Model practices by placing reusable interactions and selectors in page objects or helpers and keeping tests scenario-focused.
- Before finishing, verify the count of created or updated Playwright test cases using `test(...)` or `it(...)` and reduce the final authored count to 5 or fewer if necessary.
- Do not claim small scope if the final authored count is greater than 5.

Report:

- files changed
- scenarios covered
- deferred scenarios if any
- final Playwright test count for this run