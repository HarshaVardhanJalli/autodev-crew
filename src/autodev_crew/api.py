"""FastAPI backend — streams CrewAI pipeline events to the UI via SSE."""
import asyncio
import io
import json
import os
import queue
import re
import sys
import threading
import time
import traceback
import uuid
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="AutoDev Crew API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

AGENTS_META = [
    {"id": "pm",        "role": "Senior Product Manager",        "icon": "📋", "desc": "Requirements & user stories"},
    {"id": "architect", "role": "Principal System Architect",    "icon": "🏗️", "desc": "Tech stack & data models"},
    {"id": "developer", "role": "Senior Software Engineer",      "icon": "💻", "desc": "Production-quality code"},
    {"id": "reviewer",  "role": "Staff Engineer — Code Reviewer","icon": "🔍", "desc": "Security & best practices"},
    {"id": "qa",        "role": "Senior QA Engineer",            "icon": "🧪", "desc": "Tests & quality assurance"},
]

OUTPUT_DIR = Path(__file__).parent.parent.parent / "output"
_ANSI = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")

active_runs: dict[str, dict] = {}


class RunRequest(BaseModel):
    feature_request: str


class _StreamCapture(io.TextIOBase):
    """Redirect stdout/stderr into the SSE event queue, stripping ANSI codes."""

    def __init__(self, eq: queue.Queue, original):
        self._q = eq
        self._orig = original

    def write(self, text: str) -> int:
        clean = _ANSI.sub("", text).strip()
        if clean:
            self._q.put({"type": "console", "text": clean})
        if self._orig:
            self._orig.write(text)
        return len(text)

    def flush(self):
        if self._orig:
            self._orig.flush()


def _run_crew(run_id: str, feature_request: str, eq: queue.Queue) -> None:
    orig_out, orig_err = sys.stdout, sys.stderr
    current_step = [0]

    def on_task_done(output) -> None:
        step = current_step[0]
        if step >= len(AGENTS_META):
            return
        agent = AGENTS_META[step]
        try:
            preview = str(getattr(output, "raw", output))[:800]
        except Exception:
            preview = ""
        eq.put({"type": "agent_complete", "step": step, "agent_id": agent["id"], "output_preview": preview})
        current_step[0] += 1
        if current_step[0] < len(AGENTS_META):
            nxt = AGENTS_META[current_step[0]]
            eq.put({"type": "agent_start", "step": current_step[0], "agent_id": nxt["id"]})

    try:
        from .crew import build_autodev_crew  # noqa: PLC0415

        eq.put({"type": "agent_start", "step": 0, "agent_id": AGENTS_META[0]["id"]})

        sys.stdout = _StreamCapture(eq, orig_out)
        sys.stderr = _StreamCapture(eq, orig_err)

        crew = build_autodev_crew(feature_request, task_callback=on_task_done)
        crew.kickoff()

    except Exception as exc:
        eq.put({"type": "run_error", "error": str(exc), "traceback": traceback.format_exc()})
        return
    finally:
        sys.stdout = orig_out
        sys.stderr = orig_err

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    files = [
        {"name": f.name, "size": f.stat().st_size}
        for f in sorted(OUTPUT_DIR.glob("*"))
        if f.is_file()
    ]
    eq.put({"type": "run_complete", "files": files})
    eq.put(None)  # sentinel → end stream


@app.post("/api/run")
async def start_run(req: RunRequest):
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        return {"error": "No API key set. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env"}
    run_id = str(uuid.uuid4())
    eq: queue.Queue = queue.Queue()
    active_runs[run_id] = {"queue": eq, "started_at": time.time()}
    threading.Thread(target=_run_crew, args=(run_id, req.feature_request, eq), daemon=True).start()
    return {"run_id": run_id}


async def _sse(run_id: str) -> AsyncGenerator[str, None]:
    if run_id not in active_runs:
        yield f"data: {json.dumps({'type': 'error', 'error': 'Run not found'})}\n\n"
        return
    eq = active_runs[run_id]["queue"]
    loop = asyncio.get_event_loop()
    while True:
        try:
            event = await loop.run_in_executor(None, lambda: eq.get(timeout=45))
        except queue.Empty:
            yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
            continue
        if event is None:
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            break
        yield f"data: {json.dumps(event)}\n\n"


@app.get("/api/stream/{run_id}")
async def stream_events(run_id: str):
    return StreamingResponse(
        _sse(run_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/agents")
async def list_agents():
    return {"agents": AGENTS_META}


@app.get("/api/output")
async def list_output():
    if not OUTPUT_DIR.exists():
        return {"files": []}
    return {
        "files": [
            {"name": f.name, "size": f.stat().st_size}
            for f in sorted(OUTPUT_DIR.glob("*"))
            if f.is_file()
        ]
    }


@app.get("/api/output/{filename}")
async def get_file(filename: str):
    fp = OUTPUT_DIR / filename
    if not fp.exists() or not fp.is_file():
        return {"error": "Not found"}
    return {"content": fp.read_text(errors="replace")}


# Serve built frontend when present
_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if _dist.exists():
    app.mount("/", StaticFiles(directory=str(_dist), html=True), name="static")


def run_server() -> None:
    import uvicorn
    uvicorn.run("autodev_crew.api:app", host="0.0.0.0", port=8000, reload=False)
