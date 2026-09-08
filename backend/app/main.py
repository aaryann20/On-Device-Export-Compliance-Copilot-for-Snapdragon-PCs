from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import qa, classify, screening, system

app = FastAPI(
    title="CrossWise API",
    description="On-device export-compliance copilot. Local vector RAG, HS/ECCN classification, and Consolidated Screening List screening.",
    version="1.0.0",
)

# Allow requests from Vite dev server and preview server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(qa.router)
app.include_router(classify.router)
app.include_router(screening.router)
app.include_router(system.router)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "crosswise",
        "mode": "on-device",
        "engine": "Snapdragon Hexagon NPU Accelerated",
        "version": "1.0.0"
    }
