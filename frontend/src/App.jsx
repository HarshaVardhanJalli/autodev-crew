import { useState, useCallback, useRef } from 'react'
import AgentPipeline from './components/AgentPipeline'
import FeatureSelector from './components/FeatureSelector'
import Console from './components/Console'
import OutputPanel from './components/OutputPanel'

const API = import.meta.env.VITE_API_URL || ''

const AGENTS_INIT = [
  { id: 'pm',        role: 'Product Manager',   desc: 'Requirements & user stories', status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'architect', role: 'System Architect',   desc: 'Tech stack & data models',   status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'developer', role: 'Senior Engineer',    desc: 'Production-quality code',    status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'reviewer',  role: 'Staff Reviewer',     desc: 'Security & best practices',  status: 'idle', startTime: null, duration: null, preview: null },
  { id: 'qa',        role: 'QA Engineer',        desc: 'Tests & quality assurance',  status: 'idle', startTime: null, duration: null, preview: null },
]

const DEMO_SCRIPT = [
  {
    duration: 7000,
    preview: '## Feature Summary\nA URL shortener allowing users to create short links, track click analytics, set expiry dates, and use custom slugs.\n\n## User Stories\n1. As an anonymous user, I want to shorten a URL so I can share compact links.\n2. As a registered user, I want to view click analytics to track engagement.',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Thought: I need to analyze this feature request and produce a complete PRD.', 'console'],
      ['Thought: Let me identify all user types — anonymous visitors and registered users.', 'console'],
      ['Action: write_file | filename: requirements.md', 'console'],
      ['Observation: File written successfully → output/requirements.md', 'console'],
      ['Final Answer: PRD complete — 4 user stories, 12 acceptance criteria, 6 API endpoints.', 'console'],
    ],
  },
  {
    duration: 6000,
    preview: '## Tech Stack\n- FastAPI (Python 3.12)\n- SQLite via SQLAlchemy\n- Redis for rate-limiting\n- JWT via python-jose\n\n## Project Structure\napp/ main.py · models.py · routes/ · services/shortener.py',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: requirements.md', 'console'],
      ['Observation: [4521 bytes read]', 'console'],
      ['Thought: Requirements call for Redis rate-limiting. FastAPI + SQLite is the right fit.', 'console'],
      ['Action: write_file | filename: architecture.md', 'console'],
      ['Observation: File written successfully → output/architecture.md', 'console'],
      ['Final Answer: Architecture complete — 6 modules, 3-layer design, full API contract.', 'console'],
    ],
  },
  {
    duration: 14000,
    preview: 'All endpoints implemented with full type hints, error handling, and docstrings. Rate limiting via Redis sliding window. JWT auth on protected routes. 7 files written.',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: requirements.md', 'console'],
      ['Observation: [4521 bytes read]', 'console'],
      ['Action: read_file | filename: architecture.md', 'console'],
      ['Observation: [6832 bytes read]', 'console'],
      ['Thought: Starting with models, then services, then routes as specified.', 'console'],
      ['Action: write_file | filename: app.py', 'console'],
      ['Observation: File written successfully → output/app.py', 'console'],
      ['Action: write_file | filename: models.py', 'console'],
      ['Observation: File written successfully → output/models.py', 'console'],
      ['Action: write_file | filename: routes/urls.py', 'console'],
      ['Observation: File written successfully → output/routes/urls.py', 'console'],
      ['Action: write_file | filename: services/shortener.py', 'console'],
      ['Observation: File written successfully → output/services/shortener.py', 'console'],
      ['Action: write_file | filename: requirements.txt', 'console'],
      ['Observation: File written successfully → output/requirements.txt', 'console'],
      ['Final Answer: All 6 source files written. Implementation complete.', 'console'],
    ],
  },
  {
    duration: 5000,
    preview: '✅ Strong type hints · JWT validation correct · Redis rate-limit implemented\n🟡 Missing input sanitisation on custom slug (path traversal risk)\n🟡 No index on clicks.created_at — analytics will degrade at scale',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: app.py', 'console'],
      ['Observation: [3241 bytes read]', 'console'],
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
    preview: 'Coverage: 94% — 30 tests across 6 suites: shorten_url (8), redirect (5), analytics (4), auth (6), rate_limiting (3), custom_slug (4). All passing.',
    logs: [
      ['> Entering new CrewAgentExecutor chain...', 'console'],
      ['Action: read_file | filename: requirements.md', 'console'],
      ['Observation: [4521 bytes read]', 'console'],
      ['Thought: Writing tests starting with edge cases and security scenarios.', 'console'],
      ['Thought: Adding security tests — invalid tokens, path traversal on slugs, rate limit bypass.', 'console'],
      ['Action: write_file | filename: test_suite.py', 'console'],
      ['Observation: File written successfully → output/test_suite.py', 'console'],
      ['Action: write_file | filename: test_plan.md', 'console'],
      ['Observation: File written successfully → output/test_plan.md', 'console'],
      ['Final Answer: 30 tests written across 6 suites. Estimated coverage: 94%.', 'console'],
    ],
  },
]

const DEMO_FILES = [
  { name: 'requirements.md',  size: 4521 },
  { name: 'architecture.md',  size: 6832 },
  { name: 'app.py',           size: 3241 },
  { name: 'models.py',        size: 1823 },
  { name: 'routes_urls.py',   size: 5102 },
  { name: 'routes_auth.py',   size: 2876 },
  { name: 'requirements.txt', size: 312  },
  { name: 'code_review.md',   size: 3891 },
  { name: 'test_suite.py',    size: 7234 },
  { name: 'test_plan.md',     size: 2341 },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default function App() {
  const [phase, setPhase]       = useState('select')
  const [agents, setAgents]     = useState(AGENTS_INIT.map(a => ({ ...a })))
  const [logs, setLogs]         = useState([])
  const [files, setFiles]       = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [isDemo, setIsDemo]     = useState(false)
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

  // ── Demo ──────────────────────────────────────────────────────────
  const handleDemo = useCallback(async () => {
    abortRef.current = false
    setPhase('running')
    setIsDemo(true)
    setAgents(AGENTS_INIT.map(a => ({ ...a })))
    setLogs([])
    setFiles([])
    setErrorMsg('')
    addLog('demo mode — simulating URL Shortener pipeline', 'system')
    addLog('run id: demo-a1b2c3… started', 'system')
    await sleep(400)

    for (let i = 0; i < AGENTS_INIT.length; i++) {
      if (abortRef.current) return
      const script    = DEMO_SCRIPT[i]
      const startTime = Date.now()
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'active', startTime } : a))
      addLog(`▶ agent ${i + 1}/5: ${AGENTS_INIT[i].role} started`, 'agent')
      const delay = script.duration / script.logs.length
      for (const [text, type] of script.logs) {
        if (abortRef.current) return
        await sleep(delay)
        addLog(text, type)
      }
      if (abortRef.current) return
      setAgents(prev => prev.map((a, idx) =>
        idx === i ? { ...a, status: 'complete', duration: Date.now() - startTime, preview: script.preview } : a
      ))
      addLog(`✓ ${AGENTS_INIT[i].role} completed`, 'success')
      await sleep(250)
    }

    if (abortRef.current) return
    setPhase('complete')
    setFiles(DEMO_FILES)
    addLog('', 'divider')
    addLog('✓ all 5 agents completed', 'success')
    addLog(`${DEMO_FILES.length} files written to ./output/`, 'system')
  }, [addLog])

  // ── Real run ─────────────────────────────────────────────────────
  const handleStart = useCallback(async (featureRequest) => {
    esRef.current?.close()
    abortRef.current = false
    setPhase('running')
    setIsDemo(false)
    setAgents(AGENTS_INIT.map(a => ({ ...a })))
    setLogs([])
    setFiles([])
    setErrorMsg('')
    addLog('initializing pipeline…', 'system')

    let res, data
    try {
      res  = await fetch(`${API}/api/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feature_request: featureRequest }) })
      data = await res.json()
    } catch (err) {
      setPhase('error'); setErrorMsg(err.message); addLog(`network error: ${err.message}`, 'error'); return
    }
    if (data.error) {
      setPhase('error'); setErrorMsg(data.error); addLog(data.error, 'error'); return
    }

    addLog(`run ${data.run_id.slice(0, 8)}… started`, 'system')
    const es = new EventSource(`${API}/api/stream/${data.run_id}`)
    esRef.current = es

    es.onmessage = ({ data: raw }) => {
      let ev; try { ev = JSON.parse(raw) } catch { return }
      switch (ev.type) {
        case 'agent_start':
          setAgents(prev => prev.map((a, i) => i === ev.step ? { ...a, status: 'active', startTime: Date.now() } : a))
          addLog(`▶ agent ${ev.step + 1}/5: ${AGENTS_INIT[ev.step]?.role} started`, 'agent')
          break
        case 'agent_complete':
          setAgents(prev => prev.map((a, i) => i === ev.step ? { ...a, status: 'complete', duration: a.startTime ? Date.now() - a.startTime : null, preview: ev.output_preview } : a))
          addLog(`✓ ${AGENTS_INIT[ev.step]?.role} completed`, 'success')
          break
        case 'console':    addLog(ev.text, 'console'); break
        case 'run_complete':
          setPhase('complete'); setFiles(ev.files || [])
          addLog('', 'divider'); addLog('✓ all 5 agents completed', 'success')
          addLog(`${ev.files?.length ?? 0} files written to ./output/`, 'system')
          es.close(); break
        case 'run_error':
          setPhase('error'); setErrorMsg(ev.error)
          setAgents(prev => prev.map(a => a.status === 'active' ? { ...a, status: 'error' } : a))
          addLog('', 'divider'); addLog(`pipeline error: ${ev.error}`, 'error')
          es.close(); break
        case 'done': es.close(); break
        default: break
      }
    }
    es.onerror = () => { addLog('sse connection dropped', 'warn'); es.close() }
  }, [addLog])

  const completed   = agents.filter(a => a.status === 'complete').length
  const activeAgent = agents.find(a => a.status === 'active')
  const errorAgent  = agents.find(a => a.status === 'error')

  return (
    <div className="h-screen flex flex-col bg-bg text-ink overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-edge bg-surface/80 backdrop-blur-sm px-5 py-2.5 flex items-center justify-between z-40">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] font-bold tracking-widest text-amber border border-amber/40 px-2 py-0.5 rounded">
            AD
          </div>
          <div>
            <div className="font-mono text-xs font-bold tracking-tight text-ink">autodev<span className="text-amber">·</span>crew</div>
            <div className="font-mono text-[9px] text-muted tracking-wider">autonomous dev pipeline</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          {phase === 'select' && (
            <span className="font-mono text-[10px] text-faint">idle</span>
          )}
          {phase === 'running' && (
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              <span className="text-amber">{completed}/5</span>
              <span className="text-muted">agents done</span>
              {activeAgent && <span className="text-faint">· {activeAgent.role}</span>}
              {isDemo && <span className="text-[9px] text-amber/50 border border-amber/20 rounded px-1">demo</span>}
            </div>
          )}
          {phase === 'complete' && (
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-grove" />
              <span className="text-grove">complete</span>
              <span className="text-faint">· {files.length} files</span>
              {isDemo && <span className="text-[9px] text-amber/50 border border-amber/20 rounded px-1">demo</span>}
            </div>
          )}
          {phase === 'error' && (
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-ember" />
              <span className="text-ember">failed</span>
              {errorAgent && <span className="text-faint">at {errorAgent.role}</span>}
            </div>
          )}

          <div className="font-mono text-[9px] text-faint border border-edge rounded px-2 py-0.5">
            gpt-4o
          </div>
        </div>
      </header>

      {/* ── Pipeline ───────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-edge bg-surface px-5 py-3">
        <AgentPipeline agents={agents} />
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-edge bg-surface flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
            <FeatureSelector
              phase={phase}
              onStart={handleStart}
              onDemo={handleDemo}
              onReset={resetState}
              error={errorMsg}
            />
            {(phase === 'complete' || files.length > 0) && (
              <div className="animate-fade-in">
                <div className="border-t border-edge mb-4" />
                <OutputPanel files={files} apiBase={API} isDemo={isDemo} />
              </div>
            )}
          </div>
        </aside>

        {/* Console */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Console logs={logs} phase={phase} />
        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-edge bg-surface px-5 py-1.5 flex items-center justify-between">
        <span className="font-mono text-[9px] text-faint">crewai · sequential · 5 agents</span>
        <span className="font-mono text-[9px] text-faint">pm → arch → dev → review → qa</span>
      </div>
    </div>
  )
}
