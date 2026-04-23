# Memory System

This directory is the working memory layer for development in this repository. It captures patterns, decisions, discoveries, and lessons learned so future work can build on verified context instead of re-discovering the same information.

## Purpose

Use this memory system to:

- track implementation patterns that repeat across the codebase
- record decisions made during debugging, testing, and refactoring
- preserve lessons from completed sessions
- keep temporary active-session notes separate from committed historical knowledge

The goal is simple: make future development faster, more consistent, and more context-aware.

## Two Types of Memory

There are two distinct memory layers in this repository.

### Persistent Memory

Persistent memory lives in `.github/copilot-instructions.md`.

Use it for foundational principles and stable workflows that should apply broadly, such as:

- project-wide development expectations
- durable workflow guidance
- recurring engineering rules the AI should always consider

This is the always-on memory for the repository.

### Working Memory

Working memory lives in `.github/memory/`.

Use it for discoveries made while doing real work, including:

- debugging findings
- TDD observations
- linting-related patterns
- local architecture decisions
- examples of how this codebase solves recurring problems

This is the evolving memory for the repository.

## Directory Structure

### `.github/memory/session-notes.md`

Historical summaries of completed sessions.

Use this file when you want a durable record of:

- what was accomplished
- important findings and decisions
- final outcomes from a completed work session

This file is committed to git.

### `.github/memory/patterns-discovered.md`

Accumulated code and workflow patterns discovered over time.

Use this file when you identify a pattern that should be reused or remembered, such as:

- a preferred initialization style
- a consistent error-handling approach
- a recurring testing setup
- a repository-specific linting or debugging convention

This file is committed to git.

### `.github/memory/scratch/working-notes.md`

Active notes for the current session.

Use this file while work is still in progress to capture:

- current task scope
- hypotheses
- investigation notes
- partial decisions
- blockers
- next steps

This file is intentionally ephemeral and should not be treated as a historical source of truth.

### `.github/memory/scratch/.gitignore`

Prevents scratch files from being committed accidentally.

The scratch area is for active work only.

## When To Use Each File

### During TDD

Use `scratch/working-notes.md` to track:

- the failing behavior being targeted
- the current hypothesis
- what test was added or updated
- what changed to make the test pass

After the session is complete:

- move the important summary into `session-notes.md`
- add any reusable testing pattern to `patterns-discovered.md`

### During Linting

Use `scratch/working-notes.md` to note:

- which rules failed
- whether the issue was stylistic or structural
- whether the fix revealed a broader pattern

If a lint fix exposes a repeatable repository convention, document it in `patterns-discovered.md`.

If the session led to a meaningful cleanup or decision, summarize it in `session-notes.md`.

### During Debugging

Use `scratch/working-notes.md` to track:

- symptoms
- suspected root causes
- checks that confirmed or disproved hypotheses
- the final fix and remaining risks

Once the bug is resolved:

- store the completed summary in `session-notes.md`
- document any recurring root-cause/fix pattern in `patterns-discovered.md`

## How AI Should Read And Apply This Memory

The intended usage order is:

1. Read `.github/copilot-instructions.md` for stable repository guidance.
2. Read `session-notes.md` for relevant historical context from prior completed sessions.
3. Read `patterns-discovered.md` for reusable repository-specific implementation patterns.
4. Use `scratch/working-notes.md` during active work to capture current discoveries.

When the AI finds a recurring pattern, it should:

- reuse the pattern when it matches the current task
- keep new changes consistent with previously documented decisions
- record newly verified patterns instead of relying on memory alone

When the AI completes a session, it should convert useful active notes into durable summaries and patterns.

## Important Difference Between Session And Scratch Notes

`session-notes.md` is for completed session summaries and is committed as a historical record.

`scratch/working-notes.md` is for active work in the current session and should remain uncommitted and disposable.

That separation keeps the committed memory clean while still giving active development a place to think, test, and iterate.