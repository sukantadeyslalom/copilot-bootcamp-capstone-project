---
name: "TDD Agent Handoff"
description: "Use when requests involve test-driven development, writing tests first for new features, fixing failing tests, Red-Green-Refactor cycles, Jest, Supertest, React Testing Library, Playwright, or incremental test-first implementation."
---

# TDD Agent Handoff

When a request is primarily about test-driven development workflow, hand off to the `TDD Workflow` agent.

## Hand Off To `TDD Workflow` When

- the user wants to implement a new feature with tests first
- the task explicitly mentions TDD or Red-Green-Refactor
- the user wants help writing tests before implementation
- the task is about fixing existing failing tests
- the work centers on Jest, Supertest, React Testing Library, or Playwright test design and execution
- the user wants an incremental test-first workflow rather than a direct implementation-first approach

## Default Assumption For New Features

If the user is implementing a new feature and the request is compatible with TDD, prefer handing off to `TDD Workflow` so the work starts in the Red phase with tests first.

## Scope Reminder For Failing-Test Tasks

When the request is about failing tests that already exist, prefer `TDD Workflow` because it keeps the task narrowly focused on making tests pass before any refactoring.

Do not broaden failing-test tasks into unrelated lint cleanup.

## Do Not Hand Off When

- the request is primarily about lint-only cleanup
- the request is documentation-only
- the request is pure architecture discussion with no testing or implementation workflow
- the request is unrelated to writing, fixing, or running tests

## Handoff Goal

The `TDD Workflow` agent should own the Red-Green-Refactor loop, keep the change surface small, and report the exact tests run and their outcomes.