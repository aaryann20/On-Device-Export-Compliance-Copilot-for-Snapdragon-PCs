from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.classifier_service import classifier_engine

router = APIRouter(prefix="/api/classify", tags=["HS & ECCN Classification"])


class ClassifyRequest(BaseModel):
    description: str


class TppCalculateRequest(BaseModel):
    tops: float
    bit_width: int
    interconnect_gbps: float
    die_area_mm2: float


class BomItem(BaseModel):
    part_number: Optional[str] = ""
    name: str
    description: Optional[str] = ""
    quantity: Optional[int] = 1


class BomScanRequest(BaseModel):
    items: List[BomItem]


@router.get("/presets")
def get_presets():
    return {"presets": classifier_engine.get_presets()}


@router.post("/hs-eccn")
def classify_product(payload: ClassifyRequest):
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    return classifier_engine.classify(payload.description)


@router.post("/calculate-tpp")
def calculate_tpp(payload: TppCalculateRequest):
    return classifier_engine.calculate_tpp(
        tops=payload.tops,
        bit_width=payload.bit_width,
        interconnect_gbps=payload.interconnect_gbps,
        die_area_mm2=payload.die_area_mm2
    )


@router.post("/batch-bom")
def scan_bom(payload: BomScanRequest):
    if not payload.items:
        raise HTTPException(status_code=400, detail="BOM items list cannot be empty")
    raw_items = [item.model_dump() for item in payload.items]
    return classifier_engine.scan_bom(raw_items)
