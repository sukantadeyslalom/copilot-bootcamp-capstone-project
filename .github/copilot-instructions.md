# Copilot Instructions

## Agent Usage

- Use this file for stable repository-wide guidance.
- Prefer the documented memory system for discoveries, patterns, and session context gathered during development.
- Keep implementation suggestions aligned with existing repository conventions and verified patterns.

## Memory System

- Persistent Memory: This file (`.github/copilot-instructions.md`) contains foundational principles and workflows.
- Working Memory: `.github/memory/` directory contains discoveries and patterns.
- During active development, take notes in `.github/memory/scratch/working-notes.md` (not committed).
- At end of session, summarize key findings into `.github/memory/session-notes.md` (committed).
- Document recurring code patterns in `.github/memory/patterns-discovered.md` (committed).
- Reference these files when providing context-aware suggestions.

## Workflow Utilities

- Use `gh` CLI when prompts or workflows need exercise issue discovery, issue comments, or step content.
- To find the main exercise issue, start with open issues and inspect titles and comments for the active exercise thread. Prefer focused commands such as `gh issue list --state open --limit 20` followed by `gh issue view <number> --comments`.
- Treat the exercise issue comments as the source of truth for current step instructions, including headings like `# Step {step-number}:`, `Success Criteria`, and `:keyboard: Activity:` sections.
- When a prompt needs the latest step instructions, read the issue with comments and use the newest relevant step comment rather than older step text.
- When a prompt needs to validate a step, extract the specific `Success Criteria` section for that step and compare it against the current workspace state.
- If the user does not provide an issue number and the prompt requires one, use `gh` CLI to discover the exercise issue before proceeding.

## Git Workflow

- Use `git diff` or a similarly focused diff before generating commit messages.
- Prefer conventional commits in the form `type(scope): summary` when creating commit messages.
- Do not commit directly to `main` during normal workflow prompts unless the prompt explicitly requires it.
- Create or switch only to the user-specified feature branch before committing and pushing.
- Stage intentionally, commit once the message is clear, and push to `origin/<branch-name>`.
- Keep validation scoped to the current change, and include required UI test validation before committing when the current step requires UI workflow.

## Testing Workflow

- Prefer Jest + Supertest for backend and API behavior, React Testing Library for frontend component behavior, and Playwright for critical UI journeys.
- Keep Playwright tests deterministic by using stable selectors, state-based waits, and Page Object Model structure for reusable interactions.
- Do not create or run Playwright UI tests from step-execution prompts that are scoped to non-UI implementation work.
- When a step requires UI workflow, complete `/create-ui-tests` and `/run-ui-tests` before `/validate-step`.
- Keep testing scope focused on the current step and avoid broad unrelated test expansion.