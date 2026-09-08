from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.screening_service import screening_engine

router = APIRouter(prefix="/api/screening", tags=["Restricted-Party Screening"])


class ScreenRequest(BaseModel):
    name: str
    country: Optional[str] = ""
    entity_type: Optional[str] = "Organization"


@router.post("/screen")
def screen_entity(payload: ScreenRequest):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Entity name cannot be empty")
    return screening_engine.screen(name=payload.name, country=payload.country or "", entity_type=payload.entity_type or "Organization")


@router.get("/sample-entities")
def get_sample_entities():
    return {
        "entities": [
            {"name": "Global Tech Imports LLC", "country": "China", "type": "Organization", "expected_risk": "FLAGGED (Entity List)"},
            {"name": "AeroDynamics Trans Trading FZE", "country": "United Arab Emirates", "type": "Organization", "expected_risk": "FLAGGED (OFAC SDN)"},
            {"name": "Apex Semiconductor Solutions", "country": "Taiwan", "type": "Organization", "expected_risk": "WARNING (Unverified List)"},
            {"name": "Orion Avionics & Wireless Systems Ltd", "country": "United Kingdom", "type": "Organization", "expected_risk": "CLEAR (Allied Commercial Partner)"}
        ]
    }
