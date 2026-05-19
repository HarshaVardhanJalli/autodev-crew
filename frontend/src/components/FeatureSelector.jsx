import { useState } from 'react'

const EXAMPLES = [
  {
    id: 1,
    label: 'JWT Auth API',
    stack: 'FastAPI · SQLite',
    request:
      'Build a REST API for user authentication with JWT tokens using FastAPI and SQLite. ' +
      'Users should be able to register with email and password, log in to get a JWT access ' +
      'token and refresh token, access protected routes, refresh their token, and log out. ' +
      'Passwords must be hashed. Tokens must expire (access: 15 min, refresh: 7 days). ' +
      'Include rate limiting on login endpoint to prevent brute force attacks.',
  },
  {
    id: 2,
    label: 'Task Management API',
    stack: 'FastAPI · JWT',
    request:
      'Build a REST API for a task management system (like a simplified Trello) using FastAPI. ' +
      'Users can create projects, add tasks to projects, assign tasks to team members, ' +
      'set due dates and priorities, and update task status (todo/in-progress/done). ' +
      'Include filtering tasks by status, assignee, and due date. ' +
      'Use SQLite for storage and JWT for authentication.',
  },
  {
    id: 3,
    label: 'URL Shortener',
    stack: 'FastAPI · Redis',
    request:
      'Build a URL shortener service like bit.ly using FastAPI and Redis. ' +
      'Users can shorten long URLs, get analytics (click count, referrer, geo), ' +
      'set expiry dates on short links, and optionally set a custom slug. ' +
      'Anonymous users can shorten up to 5 URLs per day (rate limited by IP). ' +
      'Registered users get unlimited URLs and analytics dashboard.',
  },
]

export default function FeatureSelector({ phase, onStart, onDemo, onReset, error }) {
  const [request, setRequest]           = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [loading, setLoading]           = useState(false)

  const canRun   = phase === 'select' || phase === 'error' || phase === 'complete'
  const isActive = phase === 'running'

  const pickExample = (ex) => {
    setRequest(ex.request)
    setShowExamples(false)
  }

  const handleRun = async () => {
    if (!request.trim()) return
    setLoading(true)
    await onStart(request.trim())
    setLoading(false)
  }

  const handleReset = () => {
    setRequest('')
    setShowExamples(false)
    setLoading(false)
    onReset()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-muted uppercase">
          Feature Request
        </span>
        {canRun && (
          <button
            onClick={() => setShowExamples(v => !v)}
            className="font-mono text-[10px] text-amber/70 hover:text-amber transition-colors"
          >
            {showExamples ? '− hide examples' : '+ examples'}
          </button>
        )}
      </div>

      {/* Examples drawer */}
      {showExamples && canRun && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          {EXAMPLES.map(ex => (
            <button
              key={ex.id}
              onClick={() => pickExample(ex)}
              className="text-left bg-raised border border-edge hover:border-amber/40 rounded px-3 py-2 transition-all duration-150 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-ink group-hover:text-amber transition-colors">
                  {ex.label}
                </span>
                <span className="font-mono text-[9px] text-muted">{ex.stack}</span>
              </div>
            </button>
          ))}
          <div className="border-t border-edge mt-1" />
        </div>
      )}

      {/* Main textarea */}
      <textarea
        rows={6}
        disabled={isActive}
        value={request}
        onChange={e => setRequest(e.target.value)}
        placeholder={"Describe what you want to build...\n\ne.g. A REST API for a blog where users can create posts, comment, and follow authors."}
        className={`w-full bg-raised border border-edge rounded px-3 py-2.5 font-mono text-[11px] text-ink placeholder-faint leading-relaxed resize-none focus:outline-none focus:border-amber/50 transition-colors ${
          isActive ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      />

      {/* Error */}
      {error && (
        <div className="bg-[#1f1313] border border-ember/30 rounded px-3 py-2 font-mono text-[10px] text-ember animate-fade-in">
          ✕ {error}
        </div>
      )}

      {/* Actions */}
      {canRun ? (
        <div className="flex flex-col gap-2">
          <button
            disabled={!request.trim() || loading}
            onClick={handleRun}
            className={`w-full py-2.5 rounded font-mono text-[11px] font-bold tracking-widest uppercase transition-all duration-200 ${
              request.trim()
                ? 'bg-amber text-[#0e0c0a] hover:bg-amber/90 shadow-[0_0_20px_rgba(240,135,45,0.25)] hover:shadow-[0_0_28px_rgba(240,135,45,0.4)]'
                : 'bg-raised text-faint border border-edge cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-[#0e0c0a]/30 border-t-[#0e0c0a] rounded-full animate-spin" />
                initializing…
              </span>
            ) : (
              '→ run pipeline'
            )}
          </button>

          <button
            onClick={onDemo}
            className="w-full py-1.5 rounded font-mono text-[10px] text-muted hover:text-amber/80 border border-edge hover:border-amber/30 transition-all duration-150"
          >
            ▷ watch demo run
          </button>
        </div>
      ) : (
        <button
          onClick={handleReset}
          className="w-full py-2 rounded font-mono text-[11px] text-muted border border-edge hover:border-amber/30 hover:text-amber/80 transition-all duration-150"
        >
          ← new run
        </button>
      )}
    </div>
  )
}
