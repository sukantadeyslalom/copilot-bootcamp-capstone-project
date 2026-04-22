"""
Slalom Capabilities Management System API

A FastAPI application that enables Slalom consultants to register their
capabilities and manage consulting expertise across the organization.
"""

import json
import base64
import hashlib
import hmac
import os
import secrets
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Slalom Capabilities Management API",
              description="API for managing consulting capabilities and consultant expertise")

current_dir = Path(__file__).parent
capabilities_file = current_dir / "capabilities.json"
practice_leads_file = current_dir / "practice_leads.json"
session_cookie_name = "slalom_session"
auth_sessions = {}


class LoginRequest(BaseModel):
    username: str
    password: str


def load_json_file(file_path: Path):
    with file_path.open("r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def save_json_file(file_path: Path, data):
    with file_path.open("w", encoding="utf-8") as file_handle:
        json.dump(data, file_handle, indent=2)
        file_handle.write("\n")


def load_capabilities():
    return load_json_file(capabilities_file)


def load_practice_leads():
    return load_json_file(practice_leads_file)


def save_capabilities(updated_capabilities):
    save_json_file(capabilities_file, updated_capabilities)


def verify_password(password: str, practice_lead: dict):
    salt = base64.b64decode(practice_lead["password_salt"])
    expected_hash = base64.b64decode(practice_lead["password_hash"])
    candidate_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        200000
    )
    return hmac.compare_digest(candidate_hash, expected_hash)


def build_session_user(username: str, practice_lead: dict):
    return {
        "username": username,
        "role": practice_lead["role"],
        "practice_areas": practice_lead["practice_areas"]
    }


def get_authenticated_practice_lead(request: Request):
    session_token = request.cookies.get(session_cookie_name)
    username = auth_sessions.get(session_token)

    if not username or username not in practice_leads:
        raise HTTPException(status_code=401, detail="Practice lead authentication required")

    return build_session_user(username, practice_leads[username])


def can_manage_capability(practice_lead: dict, capability: dict):
    practice_areas = practice_lead["practice_areas"]
    return "All" in practice_areas or capability.get("practice_area") in practice_areas


# Mount the static files directory
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

capabilities = load_capabilities()
practice_leads = load_practice_leads()


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/capabilities")
def get_capabilities():
    return capabilities


@app.get("/auth/session")
def get_auth_session(request: Request):
    session_token = request.cookies.get(session_cookie_name)
    username = auth_sessions.get(session_token)

    if not username or username not in practice_leads:
        return {"authenticated": False}

    return {
        "authenticated": True,
        "user": build_session_user(username, practice_leads[username])
    }


@app.post("/auth/login")
def login(login_request: LoginRequest, response: Response):
    practice_lead = practice_leads.get(login_request.username)

    if not practice_lead or not verify_password(login_request.password, practice_lead):
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

    return {
        "message": "Practice lead signed in",
        "user": build_session_user(login_request.username, practice_lead)
    }


@app.post("/auth/logout")
def logout(request: Request, response: Response):
    session_token = request.cookies.get(session_cookie_name)

    if session_token:
        auth_sessions.pop(session_token, None)

    response.delete_cookie(session_cookie_name)
    return {"message": "Signed out"}


@app.post("/capabilities/{capability_name}/register")
def register_for_capability(capability_name: str, email: str):
    """Register a consultant for a capability"""
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
    return {"message": f"Registered {email} for {capability_name}"}


@app.delete("/capabilities/{capability_name}/unregister")
def unregister_from_capability(capability_name: str, email: str, request: Request):
    """Unregister a consultant from a capability"""
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
    return {"message": f"Unregistered {email} from {capability_name}"}
