import { useState } from 'react'

const DEMOS = [
  {
    id: 1,
    icon: '🔐',
    name: 'JWT Auth API',
    tag: 'FastAPI · SQLite',
    desc: 'Register/login flow with JWT tokens, refresh tokens, and rate limiting.',
    request:
      'Build a REST API for user authentication with JWT tokens using FastAPI and SQLite. ' +
      'Users should be able to register with email and password, log in to get a JWT access ' +
      'token and refresh token, access protected routes, refresh their token, and log out. ' +
      'Passwords must be hashed. Tokens must expire (access: 15 min, refresh: 7 days). ' +
      'Include rate limiting on login endpoint to prevent brute force attacks.',
  },
  {
    id: 2,
    icon: '📋',
    name: 'Task Management API',
    tag: 'FastAPI · JWT',
    desc: 'Trello-like project/task system with priorities, assignments, and filters.',
    request:
      'Build a REST API for a task management system (like a simplified Trello) using FastAPI. ' +
      'Users can create projects, add tasks to projects, assign tasks to team members, ' +
      'set due dates and priorities, and update task status (todo/in-progress/done). ' +
      'Include filtering tasks by status, assignee, and due date. ' +
      'Use SQLite for storage and JWT for authentication.',
  },
  {
    id: 3,
    icon: '🔗',
    name: 'URL Shortener',
    tag: 'FastAPI · Redis',
    desc: 'bit.ly clone with click analytics, expiry dates, and custom slugs.',
    request:
      'Build a URL shortener service like bit.ly using FastAPI and Redis. ' +
      'Users can shorten long URLs, get analytics (click count, referrer, geo), ' +
      'set expiry dates on short links, and optionally set a custom slug. ' +
      'Anonymous users can shorten up to 5 URLs per day (rate limited by IP). ' +
      'Registered users get unlimited URLs and analytics dashboard.',
  },
]

export default function FeatureSelector({ phase, onStart, onDemo, onReset, error }) {
  const [selected, setSelected] = useState(null) // demo id | 'custom'
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)

  const canRun = phase === 'select' || phase === 'error' || phase === 'complete'
  const isRunning = phase === 'running'

  const handleRun = async () => {
    const req =
      selected === 'custom'
        ? custom.trim()
        : DEMOS.find(d => d.id === selected)?.request

    if (!req) return
    setLoading(true)
    await onStart(req)
    setLoading(false)
  }

  const handleReset = () => {
    setSelected(null)
    setCustom('')
    setLoading(false)
    onReset()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Feature Request</div>
        <div className="text-[11px] text-slate-600">
          Choose a demo or describe your own feature
        </div>
      </div>

      {/* Demo options */}
      <div className="flex flex-col gap-2">
        {DEMOS.map(demo => (
          <button
            key={demo.id}
            disabled={isRunning}
            onClick={() => setSelected(demo.id)}
            className={`text-left rounded-lg border px-3 py-2.5 transition-all duration-200 group ${
              selected === demo.id
                ? 'border-indigo-500/60 bg-indigo-950/40'
                : 'border-border bg-card hover:border-slate-600 hover:bg-[#121230]'
            } ${isRunning ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{demo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">{demo.name}</span>
                  <span className="text-[9px] text-slate-600 font-mono flex-shrink-0">{demo.tag}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{demo.desc}</div>
              </div>
            </div>
          </button>
        ))}

        {/* Custom option */}
        <button
          disabled={isRunning}
          onClick={() => setSelected('custom')}
          className={`text-left rounded-lg border px-3 py-2.5 transition-all duration-200 ${
            selected === 'custom'
              ? 'border-violet-500/60 bg-violet-950/30'
              : 'border-border bg-card hover:border-slate-600'
          } ${isRunning ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">✏️</span>
            <span className="text-xs font-semibold text-slate-300">Custom Request</span>
          </div>
        </button>

        {selected === 'custom' && (
          <textarea
            className="w-full bg-[#0a0a1e] border border-violet-500/30 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-violet-500/60 resize-none font-mono leading-relaxed animate-fade-in"
            rows={5}
            placeholder="Describe the feature you want to build…"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            disabled={isRunning}
          />
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-700/40 rounded-lg px-3 py-2 text-xs text-rose-400 animate-fade-in">
          <span className="font-medium">Error: </span>{error}
        </div>
      )}

      {/* CTA buttons */}
      {canRun ? (
        <div className="flex flex-col gap-2">
          <button
            disabled={!selected || (selected === 'custom' && !custom.trim()) || loading}
            onClick={handleRun}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all duration-200 ${
              selected && !(selected === 'custom' && !custom.trim())
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60'
                : 'bg-[#12122a] text-slate-700 cursor-not-allowed border border-border'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting pipeline…
              </span>
            ) : (
              '🚀 Run Pipeline'
            )}
          </button>

          <button
            onClick={onDemo}
            className="w-full py-2 rounded-lg text-xs font-medium text-violet-400 border border-violet-700/40 hover:border-violet-500/60 hover:bg-violet-950/30 transition-all duration-200"
          >
            ▶ Watch Demo  <span className="text-violet-600">— no API key needed</span>
          </button>
        </div>
      ) : (
        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-300 border border-border hover:border-slate-500 hover:bg-[#12122a] transition-all duration-200"
        >
          ↺ New Run
        </button>
      )}
    </div>
  )
}
