"""
Slalom Capabilities Management System API

A FastAPI application that enables Slalom consultants to register their
capabilities and manage consulting expertise across the organization.
"""

import json
import hmac
import hashlib
import os
import secrets
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Slalom Capabilities Management API",
              description="API for managing consulting capabilities and consultant expertise")

current_dir = Path(__file__).parent
capabilities_file = current_dir / "capabilities.json"
practice_leads_file = current_dir / "practice_leads.json"
audit_log_file = current_dir / "audit_log.json"
support_requests_file = current_dir / "support_requests.json"
session_cookie_name = "slalom_session"
auth_sessions = {}
config_lock = RLock()


class LoginRequest(BaseModel):
    username: str
    password: str


class CapabilityUpdateRequest(BaseModel):
    description: str | None = None
    capacity: int | None = None
    certifications: list[str] | None = None
    industry_verticals: list[str] | None = None
    skill_levels: list[str] | None = None


class SupportRequest(BaseModel):
    email: str
    request_type: str = "training"
    note: str | None = None


def load_json_file(file_path: Path):
    with config_lock:
        with file_path.open("r", encoding="utf-8") as file_handle:
            return json.load(file_handle)


def save_json_file(file_path: Path, data):
    with config_lock:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            dir=file_path.parent,
            delete=False,
        ) as file_handle:
            json.dump(data, file_handle, indent=2)
            file_handle.write("\n")
            temporary_path = Path(file_handle.name)

        os.replace(temporary_path, file_path)


def ensure_json_file(file_path: Path, default_value):
    with config_lock:
        if not file_path.exists():
            save_json_file(file_path, default_value)


def load_capabilities():
    return load_json_file(capabilities_file)


def load_practice_leads():
    return load_json_file(practice_leads_file)


def save_capabilities(updated_capabilities):
    save_json_file(capabilities_file, updated_capabilities)


def load_audit_log():
    ensure_json_file(audit_log_file, [])
    return load_json_file(audit_log_file)


def load_support_requests():
    ensure_json_file(support_requests_file, [])
    return load_json_file(support_requests_file)


def save_support_requests(requests):
    save_json_file(support_requests_file, requests)


def append_audit_event(action: str, actor: str, capability_name: str | None = None, details=None):
    audit_events = load_audit_log()
    audit_events.insert(0, {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "actor": actor,
        "capability_name": capability_name,
        "details": details or {}
    })
    save_json_file(audit_log_file, audit_events)


def hash_password(password: str, salt: str, iterations: int):
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()


def verify_password(password: str, practice_lead: dict):
    expected_password = os.getenv(practice_lead["password_env_var"])

    if expected_password is None:
        return None

    if expected_password.startswith("pbkdf2_sha256$"):
        try:
            _, iterations, salt, expected_hash = expected_password.split("$", maxsplit=3)
            candidate_hash = hash_password(password, salt, int(iterations))
            return hmac.compare_digest(candidate_hash, expected_hash)
        except ValueError:
            return False

    return hmac.compare_digest(password, expected_password)


def build_session_user(username: str, practice_lead: dict):
    return {
        "username": username,
        "role": practice_lead["role"],
        "practice_areas": practice_lead["practice_areas"]
    }


def get_authenticated_practice_lead(request: Request):
    session_token = request.cookies.get(session_cookie_name)
    username = auth_sessions.get(session_token)
    practice_leads = load_practice_leads()

    if not username or username not in practice_leads:
        raise HTTPException(status_code=401, detail="Practice lead authentication required")

    return build_session_user(username, practice_leads[username])


def can_manage_capability(practice_lead: dict, capability: dict):
    practice_areas = practice_lead["practice_areas"]
    return "All" in practice_areas or capability.get("practice_area") in practice_areas


def get_managed_capabilities(practice_lead: dict, capabilities: dict):
    return {
        capability_name: capability
        for capability_name, capability in capabilities.items()
        if can_manage_capability(practice_lead, capability)
    }


def get_consultant_registrations(email: str):
    capabilities = load_capabilities()
    registrations = [
        capability_name
        for capability_name, capability in capabilities.items()
        if email in capability.get("consultants", [])
    ]
    return sorted(registrations)


def normalize_list(values: list[str] | None):
    if values is None:
        return None

    normalized_values = []
    for value in values:
        cleaned_value = value.strip()
        if cleaned_value:
            normalized_values.append(cleaned_value)
    return normalized_values


def capability_summary(capability_name: str, capability: dict):
    return {
        "name": capability_name,
        "practice_area": capability.get("practice_area"),
        "capacity": capability.get("capacity", 0),
        "consultant_count": len(capability.get("consultants", [])),
        "industry_verticals": capability.get("industry_verticals", []),
        "certifications": capability.get("certifications", []),
    }


# Mount the static files directory
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/capabilities")
def get_capabilities():
    return load_capabilities()


@app.get("/auth/session")
def get_auth_session(request: Request):
    session_token = request.cookies.get(session_cookie_name)
    username = auth_sessions.get(session_token)
    practice_leads = load_practice_leads()

    if not username or username not in practice_leads:
        return {"authenticated": False}

    return {
        "authenticated": True,
        "user": build_session_user(username, practice_leads[username])
    }


@app.post("/auth/login")
def login(login_request: LoginRequest, response: Response):
    practice_leads = load_practice_leads()
    practice_lead = practice_leads.get(login_request.username)

    if not practice_lead:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    password_is_valid = verify_password(login_request.password, practice_lead)

    if password_is_valid is None:
        raise HTTPException(
            status_code=503,
            detail="Practice lead authentication is not configured on the server"
        )

    if not password_is_valid:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    session_token = secrets.token_urlsafe(32)
    auth_sessions[session_token] = login_request.username
    response.set_cookie(
        key=session_cookie_name,
        value=session_token,
        httponly=True,
        samesite="lax",
        max_age=8 * 60 * 60
    )
    append_audit_event("practice_lead_login", login_request.username)

    return {
        "message": "Practice lead signed in",
        "user": build_session_user(login_request.username, practice_lead)
    }


@app.post("/auth/logout")
def logout(request: Request, response: Response):
    session_token = request.cookies.get(session_cookie_name)
    username = auth_sessions.get(session_token)

    if session_token:
        auth_sessions.pop(session_token, None)

    if username:
        append_audit_event("practice_lead_logout", username)

    response.delete_cookie(session_cookie_name)
    return {"message": "Signed out"}


@app.post("/capabilities/{capability_name}/register")
def register_for_capability(capability_name: str, email: str):
    """Register a consultant for a capability"""
    with config_lock:
        capabilities = load_capabilities()

        # Validate capability exists
        if capability_name not in capabilities:
            raise HTTPException(status_code=404, detail="Capability not found")

        # Get the specific capability
        capability = capabilities[capability_name]

        # Validate consultant is not already registered
        if email in capability["consultants"]:
            raise HTTPException(
                status_code=400,
                detail="Consultant is already registered for this capability"
            )

        # Add consultant
        capability["consultants"].append(email)
        save_capabilities(capabilities)
        append_audit_event(
            "consultant_registered",
            email,
            capability_name,
            {"registration_type": "self-service"}
        )

    return {"message": f"Registered {email} for {capability_name}"}


@app.delete("/capabilities/{capability_name}/unregister")
def unregister_from_capability(capability_name: str, email: str, request: Request):
    """Unregister a consultant from a capability"""
    with config_lock:
        capabilities = load_capabilities()

        # Validate capability exists
        if capability_name not in capabilities:
            raise HTTPException(status_code=404, detail="Capability not found")

        # Get the specific capability
        capability = capabilities[capability_name]
        practice_lead = get_authenticated_practice_lead(request)

        if not can_manage_capability(practice_lead, capability):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to manage this practice area"
            )

        # Validate consultant is registered
        if email not in capability["consultants"]:
            raise HTTPException(
                status_code=400,
                detail="Consultant is not registered for this capability"
            )

        # Remove consultant
        capability["consultants"].remove(email)
        save_capabilities(capabilities)
        append_audit_event(
            "consultant_unregistered",
            practice_lead["username"],
            capability_name,
            {"consultant_email": email}
        )

    return {"message": f"Unregistered {email} from {capability_name}"}


@app.patch("/capabilities/{capability_name}")
def update_capability(capability_name: str, capability_update: CapabilityUpdateRequest, request: Request):
    with config_lock:
        capabilities = load_capabilities()

        if capability_name not in capabilities:
            raise HTTPException(status_code=404, detail="Capability not found")

        capability = capabilities[capability_name]
        practice_lead = get_authenticated_practice_lead(request)

        if not can_manage_capability(practice_lead, capability):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to manage this practice area"
            )

        if capability_update.capacity is not None:
            if capability_update.capacity < 0:
                raise HTTPException(status_code=400, detail="Capacity must be zero or greater")
            capability["capacity"] = capability_update.capacity

        if capability_update.description is not None:
            capability["description"] = capability_update.description.strip()

        normalized_certifications = normalize_list(capability_update.certifications)
        if normalized_certifications is not None:
            capability["certifications"] = normalized_certifications

        normalized_industries = normalize_list(capability_update.industry_verticals)
        if normalized_industries is not None:
            capability["industry_verticals"] = normalized_industries

        normalized_skill_levels = normalize_list(capability_update.skill_levels)
        if normalized_skill_levels is not None:
            capability["skill_levels"] = normalized_skill_levels

        save_capabilities(capabilities)
        append_audit_event(
            "capability_updated",
            practice_lead["username"],
            capability_name,
            capability_summary(capability_name, capability)
        )

    return {
        "message": f"Updated {capability_name}",
        "capability": capabilities[capability_name]
    }


@app.get("/consultants/{email}/registrations")
def get_registrations(email: str):
    registrations = get_consultant_registrations(email)
    return {
        "email": email,
        "registrations": registrations,
        "registration_count": len(registrations)
    }


@app.post("/capabilities/{capability_name}/support-request")
def create_support_request(capability_name: str, support_request: SupportRequest):
    capabilities = load_capabilities()

    if capability_name not in capabilities:
        raise HTTPException(status_code=404, detail="Capability not found")

    request_record = {
        "id": secrets.token_hex(8),
        "capability_name": capability_name,
        "email": support_request.email,
        "request_type": support_request.request_type,
        "note": support_request.note,
        "status": "pending",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }

    requests = load_support_requests()
    requests.insert(0, request_record)
    save_support_requests(requests)
    append_audit_event(
        "support_request_created",
        support_request.email,
        capability_name,
        {
            "request_type": support_request.request_type,
            "request_id": request_record["id"]
        }
    )

    return {
        "message": "Support request submitted for practice lead review",
        "request": request_record
    }


@app.get("/admin/overview")
def get_admin_overview(request: Request):
    practice_lead = get_authenticated_practice_lead(request)
    capabilities = load_capabilities()
    managed_capabilities = get_managed_capabilities(practice_lead, capabilities)
    practice_area_breakdown = {}

    for capability_name, capability in managed_capabilities.items():
        practice_area = capability.get("practice_area", "Unassigned")
        summary = practice_area_breakdown.setdefault(practice_area, {
            "capability_count": 0,
            "consultant_count": 0,
            "capacity": 0,
        })
        summary["capability_count"] += 1
        summary["consultant_count"] += len(capability.get("consultants", []))
        summary["capacity"] += capability.get("capacity", 0)

    relevant_capability_names = set(managed_capabilities.keys())
    audit_events = [
        event for event in load_audit_log()
        if not event.get("capability_name") or event.get("capability_name") in relevant_capability_names
    ][:10]
    support_requests = [
        item for item in load_support_requests()
        if item.get("capability_name") in relevant_capability_names
    ][:10]

    return {
        "user": practice_lead,
        "summary": {
            "managed_capability_count": len(managed_capabilities),
            "total_consultants": sum(len(item.get("consultants", [])) for item in managed_capabilities.values()),
            "total_capacity": sum(item.get("capacity", 0) for item in managed_capabilities.values()),
            "pending_support_requests": len([item for item in support_requests if item.get("status") == "pending"]),
        },
        "practice_area_breakdown": practice_area_breakdown,
        "managed_capabilities": [
            capability_summary(capability_name, capability)
            for capability_name, capability in managed_capabilities.items()
        ],
        "recent_activity": audit_events,
        "support_requests": support_requests,
    }


ensure_json_file(audit_log_file, [])
ensure_json_file(support_requests_file, [])
