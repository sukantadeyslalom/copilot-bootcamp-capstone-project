# Patterns Discovered

Use this file to document repository-specific code and workflow patterns that should be reused over time. Add patterns only when they are validated and likely to matter again.

## Pattern Template

### Pattern Name

**Context**

Where this pattern appears and when it should be used.

**Problem**

What issue or source of confusion this pattern addresses.

**Solution**

What implementation approach should be used.

**Example**

Provide a short repository-relevant example.

**Related Files**

List the files where this pattern is implemented or referenced.

## Example Pattern

### Service Initialization: Prefer Empty Arrays Over Null

**Context**

Use this pattern when initializing service-backed collections or configuration-driven lists that may legitimately contain zero items.

**Problem**

Using `null` or `None` for an empty collection forces consumers to branch between "not loaded" and "loaded but empty" even when the service already guarantees a list-shaped response.

**Solution**

Initialize collection-like values to an empty array or list when the system expects a collection contract. Reserve `null` or `None` for states that are meaningfully distinct from "empty".

**Example**

If a service returns a list of capabilities, initialize the local value as `[]` rather than `null` when there are currently no capabilities to show.

**Related Files**

- `src/app.py`
- `src/capabilities.json`

Over time, this file should become an accumulated record of validated learnings rather than a scratch pad.