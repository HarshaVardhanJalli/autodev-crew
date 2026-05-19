#!/usr/bin/env python3
"""Start the AutoDev Crew API server (backend for the UI)."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("autodev_crew.api:app", host="0.0.0.0", port=8000, reload=True)
