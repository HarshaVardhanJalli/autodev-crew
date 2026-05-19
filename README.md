# 🤖 AutoDev Crew — Multi-Agent Software Development Team

> A CrewAI-powered autonomous development pipeline where 5 specialized AI agents collaborate to turn a feature request into production-ready code.

## Architecture

```
Feature Request
      │
      ▼
┌─────────────────┐
│  Product Manager│  → requirements.md
│  (PM Agent)     │    User stories, acceptance criteria, API design
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│System Architect │  → architecture.md
│  (Arch Agent)   │    Tech stack, data models, API contracts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Senior Developer │  → app.py, models.py, routes.py, requirements.txt
│  (Dev Agent)    │    Complete, production-quality implementation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Staff Reviewer  │  → code_review.md
│(Review Agent)   │    Security, bugs, performance, best practices
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  QA Engineer    │  → test_suite.py, test_plan.md
│  (QA Agent)     │    pytest tests covering all acceptance criteria
└─────────────────┘
```

## Real-World Problem Solved

Software teams waste enormous time on boilerplate, repeated architecture decisions, and inconsistent code review. AutoDev Crew gives solo developers and small teams an **instant senior engineering team** that:

- Never skips writing tests
- Always does architecture review before coding
- Catches security issues automatically
- Documents everything

## Setup

```bash
# Clone and enter directory
cd autodev-crew

# Create virtual environment (requires Python 3.12+)
python3.12 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install Python dependencies (includes FastAPI + Uvicorn)
pip install -e .

# Configure your API key
cp .env.example .env
```

Edit `.env` and set **one** of the following:

```bash
# Option A — OpenAI
OPENAI_API_KEY=sk-...
MODEL=gpt-4o

# Option B — Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...
MODEL=claude-sonnet-4-6
```

---

## Running the UI (recommended)

The web UI gives you a live pipeline dashboard — agent status, streaming console, and output file viewer.

**Terminal 1 — start the API backend:**
```bash
source venv/bin/activate
python run_api.py          # runs on http://localhost:8000
```

**Terminal 2 — start the frontend:**
```bash
cd frontend
npm install                # first time only
npm run dev                # runs on http://localhost:5173
```

Open **http://localhost:5173**, pick a demo scenario or enter your own feature request, and hit **Run Pipeline**.

---

## Running the CLI (no UI)

```bash
source venv/bin/activate
python -m autodev_crew.main

# Choose from 3 demo scenarios or enter your own feature request
```

### Demo Scenarios

1. **JWT Authentication API** — Register/login/refresh flow with FastAPI
2. **Task Management API** — Trello-like project/task system
3. **URL Shortener Service** — bit.ly clone with analytics

### Custom Feature Request

Type any feature description and the crew handles the rest:

```
Build a REST API for a blog platform where users can create posts,
add comments, and follow other authors...
```

## Output

All generated files appear in `./output/`:

| File | Agent | Description |
|------|-------|-------------|
| `requirements.md` | PM Agent | User stories, acceptance criteria |
| `architecture.md` | Architect Agent | Tech stack, schemas, API contracts |
| `app.py` / `main.py` | Developer Agent | Main application entry point |
| `models.py` | Developer Agent | Database models |
| `routes.py` | Developer Agent | API route handlers |
| `requirements.txt` | Developer Agent | Python dependencies |
| `code_review.md` | Reviewer Agent | Security & quality review |
| `test_suite.py` | QA Agent | Complete pytest test suite |
| `test_plan.md` | QA Agent | Test strategy & coverage |

## Tech Stack

- **[CrewAI](https://crewai.com)** — Multi-agent orchestration framework
- **GPT-4o** — Powers all 5 agents (configurable to Claude or other models)
- **Python 3.12** — Runtime

## Agent Design Principles

Each agent has:
- A **distinct role** with a specific perspective (PM thinks user-first, Architect thinks scale-first)
- A **realistic backstory** that shapes how it reasons
- **File I/O tools** to persist work for downstream agents
- **No delegation** — each agent owns its deliverable end-to-end

The **sequential pipeline** ensures each agent builds on the previous agent's verified output, mimicking how real engineering teams work.
