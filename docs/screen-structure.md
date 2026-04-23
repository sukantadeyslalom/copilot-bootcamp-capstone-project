# Capabilities Platform Screen Structure

## Navigation Model

The application should evolve from a single mixed-purpose page into six primary screens with role-aware actions.

1. Discovery dashboard
2. Capability detail
3. Registration and request flow
4. Consultant workspace
5. Practice lead admin workspace
6. Analytics and planning view

The current single-page implementation now covers portions of the discovery dashboard, consultant workspace, and practice lead admin workspace. The screens below define the target structure for future iterations.

## Screen Map

### Discovery Dashboard

Purpose: help consultants and practice leads browse the capability catalog quickly.

Core features:

- Keyword search across capability names and descriptions.
- Filters for practice area, industry vertical, and certification.
- Sorting by alphabetic order, available capacity, and team size.
- Summary cards that surface the most relevant capability metadata at a glance.

Primary users:

- Consultants exploring where to register or request development support.
- Practice leads scanning current supply and visible team composition.

### Capability Detail

Purpose: present a single capability as a richer destination rather than a card in a list.

Core features:

- Extended description, skill levels, certifications, and industry coverage.
- Current consultant roster, capacity posture, and support demand.
- Action area for register, request training, or contact the owning practice lead.
- Related capabilities and recommended next steps.

Primary users:

- Consultants evaluating where to contribute.
- Practice leads reviewing the operational state of a single capability.

### Registration and Request Flow

Purpose: separate action-taking from browsing and make workflow states explicit.

Core features:

- Self-registration flow with future approval states.
- Support and training request submission.
- Clear feedback for submitted, approved, rejected, or completed actions.
- Optional capture of consultant goals, availability, and development intent.

Primary users:

- Consultants registering or requesting support.

### Consultant Workspace

Purpose: give each consultant a focused place to view and manage their involvement.

Core features:

- Current registrations.
- Submitted support or training requests and their statuses.
- Recommended capabilities or development paths.
- Signals about required certifications or next steps.

Primary users:

- Consultants tracking their active capability footprint.

### Practice Lead Admin Workspace

Purpose: centralize operational actions for leads responsible for specific practice areas.

Core features:

- Authentication and role-scoped access.
- Capability editing for capacity, certifications, industry coverage, and descriptive content.
- Request review queues, audit history, and practice-area snapshots.
- Tools to add or remove consultants while respecting authorization boundaries.

Primary users:

- Practice leads and future admin roles.

### Analytics and Planning View

Purpose: support staffing and capability investment decisions over time.

Core features:

- Capacity by practice area and capability.
- Demand, request volume, and trend reporting.
- Risk indicators for understaffed or high-demand capabilities.
- Exportable views for leadership and staffing planning.

Primary users:

- Practice leads, operations, and leadership stakeholders.

## Key User Journeys

### Consultant Journey

1. Start in the discovery dashboard and narrow the catalog with search and filters.
2. Open a capability detail view to review requirements and current team composition.
3. Register or submit a training or support request.
4. Check the consultant workspace for current registrations and request status.

### Practice Lead Journey

1. Sign in and open the practice lead admin workspace.
2. Review managed capabilities, current activity, and pending support requests.
3. Update capability metadata, capacity, and team membership.
4. Use the analytics view to identify demand hotspots and staffing gaps.

## Data and API Implications

- Discovery views should consume read-optimized endpoints that support filtering, sorting, and pagination.
- Capability detail pages need stable capability identifiers and richer response models than the current catalog payload.
- Registration and support flows should move to explicit request resources with statuses and ownership.
- Consultant workspaces require user-scoped queries rather than simple email lookups.
- Analytics views require historical storage and aggregation rather than only current-state JSON files.

## Implementation Guidance

- Keep the discovery dashboard lightweight and optimized for browse-first behavior.
- Move write-heavy admin actions into dedicated forms rather than mixing them into catalog cards.
- Separate consultant-facing flows from practice-lead management so permissions remain understandable.
- Treat analytics as a later dedicated screen, not as secondary content bolted onto the catalog.