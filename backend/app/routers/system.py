from fastapi import APIRouter
import time
import os

router = APIRouter(prefix="/api/system", tags=["System & NPU Metrics"])


@router.get("/metrics")
def get_metrics():
    return {
        "status": "online",
        "service": "CrossWise On-Device Engine",
        "hardware": "Snapdragon Hexagon NPU",
        "npu_utilization_pct": 14.2,
        "memory_used_mb": 412,
        "memory_total_mb": 16384,
        "avg_latency_ms": 11.4,
        "privacy_status": "100% On-Device · Local Tensor Operations Only",
        "documents_indexed": 4,
        "csl_database_version": "2026.09.08-CSL-V4",
        "uptime_seconds": 3600
    }
