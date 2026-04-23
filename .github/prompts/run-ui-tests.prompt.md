---
name: "run-ui-tests"
description: "Run UI tests and summarize failures"
agent: "test-engineer"
model: "Claude Sonnet 4.5 (copilot)"
tools: [read, execute, todo]
---

Follow [repository instructions](../copilot-instructions.md), especially the testing guidance sections.

Run UI tests and summarize failures.

Required first step:

1. Run `npm run test:ui:install --workspace=frontend` before `/run-ui-tests`.
2. In Ubuntu or Linux environments, treat `test:ui:install` as mandatory and ensure it performs `playwright install --with-deps chromium` before running tests.
3. `test:ui:install` includes bounded Ubuntu repository remediation for the common Yarn key issue plus one retry.

Environment guardrails:

- Do not perform ad hoc package hunting or broad operating system troubleshooting beyond the automated remediation already built into `test:ui:install`.
- If install still fails, stop immediately and report an environment blocker with the failing command and the key error lines.
- Do not continue to Playwright test execution after a failed dependency install.

Execution workflow:

1. Ensure both backend and frontend are running before executing UI tests. Start from the repository root with `npm start` if needed.
2. Run UI tests using the project command.
3. Summarize pass or fail results.
4. For failures, classify likely root cause categories as application code, test code, or environment.

Output expectations:

- installation status
- test command run
- pass or fail summary
- key failing cases if any
- root cause classification for failures