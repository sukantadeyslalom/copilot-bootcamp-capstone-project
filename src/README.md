# Slalom Capabilities Management API

<p align="center">
  <img src="https://colby-timm.github.io/images/byte-teacher.png" alt="Byte Teacher" width="200" />
</p>

A FastAPI application that enables Slalom consultants to register their capabilities and manage consulting expertise across the organization.

## Features

- View all available consulting capabilities
- Search and filter capabilities by keyword, practice area, industry vertical, and certification
- Register consultant expertise and availability
- View consultant registrations and submit training or support requests
- Track skill levels and certifications
- Manage capability capacity and team assignments
- Practice lead sign-in with role-scoped capability management and activity tracking

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc
   - Capabilities Dashboard: http://localhost:8000/

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/capabilities`                                                   | Get all capabilities with details and current consultant assignments |
| POST   | `/capabilities/{capability_name}/register?email=consultant@slalom.com` | Register consultant for a capability                     |
| DELETE | `/capabilities/{capability_name}/unregister?email=consultant@slalom.com` | Unregister consultant from a capability              |
| GET    | `/auth/session`                                                   | Return the current authenticated practice lead session             |
| POST   | `/auth/login`                                                     | Sign in as a practice lead                                          |
| POST   | `/auth/logout`                                                    | Sign out the current practice lead                                  |
| PATCH  | `/capabilities/{capability_name}`                                 | Update capability metadata as an authorized practice lead           |
| GET    | `/consultants/{email}/registrations`                              | Look up a consultant's registered capabilities                      |
| POST   | `/capabilities/{capability_name}/support-request`                 | Submit a training or support request                                |
| GET    | `/admin/overview`                                                 | Return a practice lead summary, activity, and support queue         |

## Data Model

The application uses a consulting-focused data model:

1. **Capabilities** - Uses capability name as identifier:
   - Description of the consulting capability
   - Skill levels (Emerging, Proficient, Advanced, Expert)
   - Practice area (Strategy, Technology, Operations)
   - Industry verticals served
   - Required certifications
   - List of consultant emails registered
   - Available capacity (hours per week)
   - Geographic location preferences

2. **Consultants** - Uses email as identifier:
   - Name
   - Practice area
   - Skill level
   - Certifications
   - Availability

All data is currently stored in memory for this learning exercise. In a production environment, this would be backed by a robust database system.

## Configuration

Capability definitions are stored in `capabilities.json` alongside the API code. Update that file to add or edit capabilities without changing `app.py`.

Practice lead identities are stored in `practice_leads.json`. Passwords are read from environment variables named in that file, so secrets do not need to be committed to the repository.

For stronger local authentication, you can store PBKDF2 password hashes in the configured environment variables using this format:

- `pbkdf2_sha256$<iterations>$<salt>$<hex_digest>`

For local testing, set the password environment variables before starting the app. Example:

- `export PRACTICELEAD_TECH_PASSWORD='choose-a-strong-password'`
- `export PRACTICELEAD_STRATEGY_PASSWORD='choose-a-strong-password'`

If those environment variables are missing, practice lead login returns `503` to indicate the server is not configured for authenticated access yet.

Capability and practice lead configuration is loaded from disk on each request, so updates to those JSON files are reflected without restarting the app.

Audit activity and consultant support requests are also written to JSON files in `src/` for this learning exercise.

## Product Planning

- [Platform revamp roadmap](../docs/revamp-roadmap.md)
- [Screen structure and user flows](../docs/screen-structure.md)

## Future Enhancements

This exercise will guide you through implementing:
- Capability maturity assessments
- Intelligent team matching algorithms  
- Analytics dashboards for practice leads
- Integration with project management systems
- Advanced search and filtering capabilities
