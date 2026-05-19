import { useState, useCallback, useRef } from 'react'
import AgentPipeline from './components/AgentPipeline'
import FeatureSelector from './components/FeatureSelector'
import Console from './components/Console'
import OutputPanel from './components/OutputPanel'

const API = import.meta.env.VITE_API_URL || ''

const AGENTS_INIT = [
  { id: 'pm',        role: 'Senior Product Manager',        icon: '📋', desc: 'Requirements & user stories', status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'architect', role: 'Principal System Architect',    icon: '🏗️', desc: 'Tech stack & data models',    status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'developer', role: 'Senior Software Engineer',      icon: '💻', desc: 'Production-quality code',      status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'reviewer',  role: 'Staff Engineer — Reviewer',     icon: '🔍', desc: 'Security & best practices',    status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'qa',        role: 'Senior QA Engineer',            icon: '🧪', desc: 'Tests & quality assurance',    status: 'idle', startTime: null, duration: null, preview: null },
]

const DEMO_SCRIPT = [
  {
    duration: 7000,
    preview: '## Feature Summary\nA URL shortener service allowing users to create short links, track click analytics, set expiry dates, and use custom slugs.\n\n## User Stories\n1. As an anonymous user, I want to shorten a URL so that I can share compact links.\n2. As a registered user, I want to view click analytics so I can track engagement.\n3. As a registered user, I want to set a custom slug so my links are memorable.\n4. As a registered user, I want to set expiry dates so links auto-deactivate.',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Thought: I need to analyze this feature request and produce a complete PRD.', 'console'],
      ['Thought: Let me identify all user types — anonymous visitors and registered users.', 'console'],
      ['Action: write_file | filename: requirements.md', 'console'],
      ['Observation: File written successfully → output/requirements.md', 'console'],
      ['Final Answer: PRD complete with 4 user stories, 12 acceptance criteria, 6 API endpoints.', 'console'],
    ],
  },
  {
    duration: 6000,
    preview: '## Tech Stack\n- **Framework**: FastAPI (Python 3.12)\n- **Database**: SQLite via SQLAlchemy\n- **Cache/Rate-limit**: Redis\n- **Auth**: JWT (python-jose)\n\n## Project Structure\n```\napp/\n  main.py\n  models.py\n  routes/\n    auth.py\n    urls.py\n  services/\n    shortener.py\n    analytics.py\n```',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: requirements.md', 'console'],
      ['Observation: [4521 bytes read]', 'console'],
      ['Thought: Requirements call for Redis rate-limiting and click analytics. FastAPI + SQLite is the right fit.', 'console'],
      ['Action: write_file | filename: architecture.md', 'console'],
      ['Observation: File written successfully → output/architecture.md', 'console'],
      ['Final Answer: Architecture document complete — 6 modules, 3-layer design, full API contract.', 'console'],
    ],
  },
  {
    duration: 14000,
    preview: '# URL Shortener — Implementation\n\nAll endpoints implemented with full type hints, error handling, and docstrings. Rate limiting via Redis sliding window. JWT auth on protected routes. 7 files written.',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: requirements.md', 'console'],
      ['Observation: [4521 bytes read]', 'console'],
      ['Action: read_file | filename: architecture.md', 'console'],
      ['Observation: [6832 bytes read]', 'console'],
      ['Thought: I will implement the project structure as specified — starting with models, then services, then routes.', 'console'],
      ['Action: write_file | filename: app.py', 'console'],
      ['Observation: File written successfully → output/app.py', 'console'],
      ['Action: write_file | filename: models.py', 'console'],
      ['Observation: File written successfully → output/models.py', 'console'],
      ['Action: write_file | filename: routes/urls.py', 'console'],
      ['Observation: File written successfully → output/routes/urls.py', 'console'],
      ['Action: write_file | filename: routes/auth.py', 'console'],
      ['Observation: File written successfully → output/routes/auth.py', 'console'],
      ['Action: write_file | filename: services/shortener.py', 'console'],
      ['Observation: File written successfully → output/services/shortener.py', 'console'],
      ['Action: write_file | filename: requirements.txt', 'console'],
      ['Observation: File written successfully → output/requirements.txt', 'console'],
      ['Final Answer: All 6 source files written. Implementation complete.', 'console'],
    ],
  },
  {
    duration: 5000,
    preview: '## Code Review Summary\n\n✅ Strong type hints throughout\n✅ Proper JWT validation on all protected routes\n✅ Redis sliding-window rate limiting implemented correctly\n\n🟡 Major: Missing input sanitisation on custom slug — could allow path traversal\n🟡 Major: No index on `clicks.created_at` — analytics queries will degrade at scale\n🟢 Minor: `get_db()` dependency could be extracted to a shared module',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: app.py', 'console'],
      ['Observation: [3241 bytes read]', 'console'],
      ['Action: read_file | filename: models.py', 'console'],
      ['Observation: [1823 bytes read]', 'console'],
      ['Thought: Checking for SQL injection vectors on the slug field...', 'console'],
      ['Thought: Reviewing JWT token validation flow...', 'console'],
      ['Thought: Checking for N+1 query patterns in analytics endpoint...', 'console'],
      ['Action: write_file | filename: code_review.md', 'console'],
      ['Observation: File written successfully → output/code_review.md', 'console'],
      ['Final Answer: Review complete — 0 critical, 2 major, 1 minor issue found.', 'console'],
    ],
  },
  {
    duration: 8000,
    preview: '## Test Coverage: 94%\n\n### Suites\n- `test_shorten_url` — 8 cases (happy path + edge cases)\n- `test_redirect` — 5 cases (valid, expired, not found)\n- `test_analytics` — 4 cases\n- `test_auth` — 6 cases (register, login, invalid token)\n- `test_rate_limiting` — 3 cases\n- `test_custom_slug` — 4 cases\n\nAll 30 tests passing.',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: requirements.md', 'console'],
      ['Observation: [4521 bytes read]', 'console'],
      ['Action: read_file | filename: app.py', 'console'],
      ['Observation: [3241 bytes read]', 'console'],
      ['Thought: I will write tests for every acceptance criterion, starting with edge cases.', 'console'],
      ['Thought: Adding security tests — invalid tokens, path traversal on slugs, rate limit bypass attempts.', 'console'],
      ['Action: write_file | filename: test_suite.py', 'console'],
      ['Observation: File written successfully → output/test_suite.py', 'console'],
      ['Action: write_file | filename: test_plan.md', 'console'],
      ['Observation: File written successfully → output/test_plan.md', 'console'],
      ['Final Answer: 30 tests written across 6 suites. Estimated coverage: 94%.', 'console'],
    ],
  },
]

const DEMO_FILES = [
  { name: 'requirements.md', size: 4521 },
  { name: 'architecture.md', size: 6832 },
  { name: 'app.py',          size: 3241 },
  { name: 'models.py',       size: 1823 },
  { name: 'routes_urls.py',  size: 5102 },
  { name: 'routes_auth.py',  size: 2876 },
  { name: 'requirements.txt',size: 312  },
  { name: 'code_review.md',  size: 3891 },
  { name: 'test_suite.py',   size: 7234 },
  { name: 'test_plan.md',    size: 2341 },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default function App() {
  const [phase, setPhase]   = useState('select')
  const [agents, setAgents] = useState(AGENTS_INIT.map(a => ({ ...a })))
  const [logs, setLogs]     = useState([])
  const [files, setFiles]   = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const esRef    = useRef(null)
  const abortRef = useRef(false)
  const logId    = useRef(0)

  const addLog = useCallback((text, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + (++logId.current), text, type }])
  }, [])

  const resetState = useCallback(() => {
    esRef.current?.close()
    abortRef.current = true
    setPhase('select')
    setAgents(AGENTS_INIT.map(a => ({ ...a })))
    setLogs([])
    setFiles([])
    setErrorMsg('')
    setIsDemo(false)
  }, [])

  // ── Demo simulation ────────────────────────────────────────────────
  const handleDemo = useCallback(async () => {
    abortRef.current = false
    setPhase('running')
    setIsDemo(true)
    setAgents(AGENTS_INIT.map(a => ({ ...a })))
    setLogs([])
    setFiles([])
    setErrorMsg('')

    addLog('Demo mode — simulating a URL Shortener pipeline run', 'system')
    addLog('Run ID: demo-a1b2c3… — pipeline started', 'system')
    await sleep(400)

    for (let i = 0; i < AGENTS_INIT.length; i++) {
      if (abortRef.current) return
      const script = DEMO_SCRIPT[i]
      const startTime = Date.now()

      setAgents(prev => prev.map((a, idx) =>
        idx === i ? { ...a, status: 'active', startTime } : a
      ))
      addLog(`▶ Agent ${i + 1}/5: ${AGENTS_INIT[i].role} started`, 'agent')

      const logDelay = script.duration / script.logs.length
      for (const [text, type] of script.logs) {
        if (abortRef.current) return
        await sleep(logDelay)
        addLog(text, type)
      }

      if (abortRef.current) return
      setAgents(prev => prev.map((a, idx) =>
        idx === i
          ? { ...a, status: 'complete', duration: Date.now() - startTime, preview: script.preview }
          : a
      ))
      addLog(`✓ ${AGENTS_INIT[i].role} completed`, 'success')
      await sleep(300)
    }

    if (abortRef.current) return
    setPhase('complete')
    setFiles(DEMO_FILES)
    addLog('', 'divider')
    addLog('🎉 All 5 agents completed successfully!', 'success')
    addLog(`${DEMO_FILES.length} files written to ./output/`, 'system')
  }, [addLog])

  // ── Real run ───────────────────────────────────────────────────────
  const handleStart = useCallback(async (featureRequest) => {
    esRef.current?.close()
    abortRef.current = false
    setPhase('running')
    setIsDemo(false)
    setAgents(AGENTS_INIT.map(a => ({ ...a })))
    setLogs([])
    setFiles([])
    setErrorMsg('')
    addLog('Initializing AutoDev Crew pipeline…', 'system')

    let res, data
    try {
      res = await fetch(`${API}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_request: featureRequest }),
      })
      data = await res.json()
    } catch (err) {
      setPhase('error')
      setErrorMsg(err.message)
      addLog(`Network error: ${err.message}`, 'error')
      return
    }

    if (data.error) {
      setPhase('error')
      setErrorMsg(data.error)
      addLog(data.error, 'error')
      return
    }

    addLog(`Run ID: ${data.run_id.slice(0, 8)}… — pipeline started`, 'system')

    const es = new EventSource(`${API}/api/stream/${data.run_id}`)
    esRef.current = es

    es.onmessage = ({ data: raw }) => {
      let ev
      try { ev = JSON.parse(raw) } catch { return }

      switch (ev.type) {
        case 'agent_start':
          setAgents(prev => prev.map((a, i) =>
            i === ev.step ? { ...a, status: 'active', startTime: Date.now() } : a
          ))
          addLog(`▶ Agent ${ev.step + 1}/5: ${AGENTS_INIT[ev.step]?.role} started`, 'agent')
          break
        case 'agent_complete':
          setAgents(prev => prev.map((a, i) =>
            i === ev.step
              ? { ...a, status: 'complete', duration: a.startTime ? Date.now() - a.startTime : null, preview: ev.output_preview }
              : a
          ))
          addLog(`✓ ${AGENTS_INIT[ev.step]?.role} completed`, 'success')
          break
        case 'console':
          addLog(ev.text, 'console')
          break
        case 'run_complete':
          setPhase('complete')
          setFiles(ev.files || [])
          addLog('', 'divider')
          addLog('🎉 All 5 agents completed successfully!', 'success')
          addLog(`${ev.files?.length ?? 0} files written to ./output/`, 'system')
          es.close()
          break
        case 'run_error':
          setPhase('error')
          setErrorMsg(ev.error)
          setAgents(prev => prev.map(a => a.status === 'active' ? { ...a, status: 'error' } : a))
          addLog('', 'divider')
          addLog(`❌ Pipeline failed: ${ev.error}`, 'error')
          es.close()
          break
        case 'done':
          es.close()
          break
        default:
          break
      }
    }

    es.onerror = () => {
      addLog('SSE connection interrupted — the crew may still be running in the background', 'warn')
      es.close()
    }
  }, [addLog])

  const completedCount = agents.filter(a => a.status === 'complete').length
  const activeAgent    = agents.find(a => a.status === 'active')
  const errorAgent     = agents.find(a => a.status === 'error')

  return (
    <div className="h-screen flex flex-col bg-[#070712] text-slate-100 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border bg-[#090918]/90 backdrop-blur-sm px-5 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-900/40 flex-shrink-0">
            A
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight leading-tight">AutoDev Crew</div>
            <div className="text-[10px] text-slate-600 leading-tight">Multi-Agent Development Pipeline</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {phase === 'select' && <span className="text-xs text-slate-600">Ready to run</span>}
          {phase === 'running' && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300 font-medium">{completedCount}/5</span>
              <span>agents done</span>
              {activeAgent && <span className="text-slate-500">· {activeAgent.role}</span>}
              {isDemo && <span className="text-[10px] text-violet-500 border border-violet-700/40 rounded px-1.5 py-0.5">DEMO</span>}
            </div>
          )}
          {phase === 'complete' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium">Pipeline complete</span>
              <span className="text-slate-600">· {files.length} files generated</span>
              {isDemo && <span className="text-[10px] text-violet-500 border border-violet-700/40 rounded px-1.5 py-0.5">DEMO</span>}
            </div>
          )}
          {phase === 'error' && (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-medium">Pipeline failed</span>
              {errorAgent && <span className="text-slate-600">at {errorAgent.role}</span>}
            </div>
          )}
          <div className="border border-border rounded-md px-2 py-1 text-[10px] text-slate-600 font-mono">
            gpt-4o
          </div>
        </div>
      </header>

      {/* ── Agent pipeline bar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-border bg-surface px-5 py-3">
        <AgentPipeline agents={agents} />
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        <aside className="w-72 flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <FeatureSelector
              phase={phase}
              onStart={handleStart}
              onDemo={handleDemo}
              onReset={resetState}
              error={errorMsg}
            />
            {(phase === 'complete' || files.length > 0) && (
              <div className="animate-fade-in">
                <div className="border-t border-border mb-4" />
                <OutputPanel files={files} apiBase={API} isDemo={isDemo} />
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Console logs={logs} phase={phase} />
        </main>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border bg-surface px-5 py-1.5 flex items-center justify-between">
        <div className="text-[10px] text-slate-700 font-mono">
          CrewAI · Sequential Pipeline · 5 agents
        </div>
        <div className="text-[10px] text-slate-700">
          PM → Architect → Developer → Reviewer → QA
        </div>
      </div>
    </div>
  )
}
