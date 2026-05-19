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

export default function App() {
  const [phase, setPhase]   = useState('select') // select | running | complete | error
  const [agents, setAgents] = useState(AGENTS_INIT.map(a => ({ ...a })))
  const [logs, setLogs]     = useState([])
  const [files, setFiles]   = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const esRef = useRef(null)
  const logId = useRef(0)

  const addLog = useCallback((text, type = 'info') => {
    setLogs(prev => [...prev, { id: ++logId.current * 1000 + Date.now() % 1000, text, type }])
  }, [])

  const handleStart = useCallback(async (featureRequest) => {
    esRef.current?.close()
    setPhase('running')
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

  const handleReset = useCallback(() => {
    esRef.current?.close()
    setPhase('select')
    setAgents(AGENTS_INIT.map(a => ({ ...a })))
    setLogs([])
    setFiles([])
    setErrorMsg('')
  }, [])

  const completedCount = agents.filter(a => a.status === 'complete').length
  const activeAgent    = agents.find(a => a.status === 'active')
  const errorAgent     = agents.find(a => a.status === 'error')

  return (
    <div className="h-screen flex flex-col bg-[#070712] text-slate-100 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border bg-[#090918]/90 backdrop-blur-sm px-5 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-900/40 flex-shrink-0">
            A
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight leading-tight">AutoDev Crew</div>
            <div className="text-[10px] text-slate-600 leading-tight">Multi-Agent Development Pipeline</div>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-3">
          {phase === 'select' && (
            <span className="text-xs text-slate-600">Ready to run</span>
          )}
          {phase === 'running' && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300 font-medium">{completedCount}/5</span>
              <span>agents done</span>
              {activeAgent && (
                <span className="text-slate-500">· {activeAgent.role}</span>
              )}
            </div>
          )}
          {phase === 'complete' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium">Pipeline complete</span>
              <span className="text-slate-600">· {files.length} files generated</span>
            </div>
          )}
          {phase === 'error' && (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-medium">Pipeline failed</span>
              {errorAgent && <span className="text-slate-600">at {errorAgent.role}</span>}
            </div>
          )}

          {/* Model badge */}
          <div className="border border-border rounded-md px-2 py-1 text-[10px] text-slate-600 font-mono">
            gpt-4o
          </div>
        </div>
      </header>

      {/* ── Agent pipeline bar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-border bg-surface px-5 py-3">
        <AgentPipeline agents={agents} />
      </div>

      {/* ── Main content area ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <FeatureSelector
              phase={phase}
              onStart={handleStart}
              onReset={handleReset}
              error={errorMsg}
            />

            {/* Output files — visible once pipeline starts producing results */}
            {(phase === 'complete' || files.length > 0) && (
              <div className="animate-fade-in">
                <div className="border-t border-border mb-4" />
                <OutputPanel files={files} apiBase={API} />
              </div>
            )}
          </div>
        </aside>

        {/* Right panel — console */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Console logs={logs} phase={phase} />
        </main>
      </div>

      {/* ── Bottom status bar ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border bg-surface px-5 py-1.5 flex items-center justify-between">
        <div className="text-[10px] text-slate-700 font-mono">
          CrewAI · Sequential Pipeline · 5 agents
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-700">
          <span>PM → Architect → Developer → Reviewer → QA</span>
        </div>
      </div>
    </div>
  )
}
