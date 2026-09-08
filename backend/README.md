# CrossWise backend

FastAPI service. Inference is intended to stay on this machine (Ollama at `http://localhost:11434`).

## Run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/health`
