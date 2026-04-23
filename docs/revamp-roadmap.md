# Capabilities Platform Revamp Roadmap

## Current State Audit

The current platform now supports:

- A searchable capabilities catalog with client-side filters for practice area, industry vertical, and certification.
- Consultant self-registration for capabilities.
- Practice lead sign-in, role-based capability management, and practice-area authorization.
- Consultant registration lookup, support and training requests, and a practice lead workspace with recent activity.
- JSON-backed capability and practice lead configuration that can be updated without changing Python code.

The largest remaining gaps are persistence, richer navigation, approval workflows, and deeper operational analytics.

## Product Direction

The target product is a capabilities marketplace rather than a single-page roster. Consultants should be able to discover the right capability, understand its context, register or request support, and track their involvement. Practice leads should be able to manage demand, capacity, requests, and reporting without editing source code or relying on ad hoc coordination.

## Phased Roadmap

### Phase 1: Strengthen the Current MVP

Objective: reduce operational friction in the existing app and make capability discovery reliable.

- Ship search, filters, sorting, and empty-state behavior across the catalog.
- Expand practice lead administration to include capability updates, support request visibility, and audit history.
- Add consultant self-service for registration lookup and development or staffing requests.
- Document the product direction and screen structure so follow-on work stays coherent.

Implementation notes:

- Keep JSON-backed configuration while the data model remains small.
- Preserve a thin API surface that can later be backed by database storage with minimal frontend churn.

### Phase 2: Introduce Workflow and Persistence

Objective: move from simple registry behavior to operational workflow management.

- Replace direct consultant self-registration with a configurable approval workflow.
- Persist capabilities, requests, and audit data in a database.
- Add request statuses, assignee ownership, and decision history for practice leads.
- Introduce capability detail views with richer staffing, certification, and maturity data.
- Add notifications for request submission, approval, rejection, and capacity risk.

Implementation notes:

- Add stable IDs for capabilities and requests before introducing relational storage.
- Separate read models used by discovery pages from write models used by admin workflows.

### Phase 3: Build Marketplace and Insights Features

Objective: turn the registry into a planning and matching platform.

- Add capacity forecasting, heatmaps, and trend reporting by practice area.
- Surface recommended capabilities based on consultant profile, certifications, and demand signals.
- Add staffing pipeline views that connect support requests to upcoming client opportunities.
- Support richer profile data such as regions, recent project history, and preferred development paths.
- Integrate with identity and collaboration systems for production authentication and notifications.

Implementation notes:

- Treat analytics as a distinct service boundary once historical data volume grows.
- Model demand, staffing, and learning signals as first-class entities instead of storing them as audit events.

## Prioritized Backlog

1. Add approval states and practice lead decision actions for consultant registration requests.
2. Persist capability, request, and audit data outside JSON files.
3. Introduce capability detail views and dedicated admin workflows.
4. Add notifications and ownership assignment for support requests.
5. Expand analytics from snapshot metrics to historical reporting.
6. Integrate production-ready authentication and team directory data.

## Dependency Notes

- Approval workflows depend on persistent request storage and stable entity identifiers.
- Historical analytics depend on structured event storage rather than transient in-memory sessions.
- Production authentication depends on replacing environment-variable secrets with centralized identity.
- Advanced matching features depend on richer consultant profile data than the current email-based model.

## Success Criteria

- Near-term work improves discovery and administrative safety without increasing code-editing burden for practice leads.
- Mid-term work replaces manual coordination with explicit workflow states and ownership.
- Longer-term work supports marketplace-style discovery, planning, and analytics rather than simple registration tracking.