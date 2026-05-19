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

  const pickExample = (ex) => { setRequest(ex.request); setShowExamples(false) }

  const handleRun = async () => {
    if (!request.trim()) return
    setLoading(true)
    await onStart(request.trim())
    setLoading(false)
  }

  const handleReset = () => { setRequest(''); setShowExamples(false); setLoading(false); onReset() }

  return (
    <div className="flex flex-col gap-4">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold tracking-[0.15em] uppercase" style={{ fontSize: 11, color: '#a89070' }}>
          Feature Request
        </span>
        {canRun && (
          <button
            onClick={() => setShowExamples(v => !v)}
            className="font-mono transition-colors"
            style={{ fontSize: 11, color: showExamples ? '#f5922a' : '#8a7868' }}
          >
            {showExamples ? '− hide' : '+ examples'}
          </button>
        )}
      </div>

      {/* Examples drawer */}
      {showExamples && canRun && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {EXAMPLES.map(ex => (
            <button
              key={ex.id}
              onClick={() => pickExample(ex)}
              className="text-left rounded-lg px-3 py-2.5 transition-all duration-150 group border"
              style={{ background: '#1e1a15', borderColor: '#3a3028' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,146,42,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a3028' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold" style={{ fontSize: 13, color: '#f0e8dc' }}>{ex.label}</span>
                <span className="font-mono flex-shrink-0" style={{ fontSize: 10, color: '#8a7868' }}>{ex.stack}</span>
              </div>
            </button>
          ))}
          <div className="border-t mt-1" style={{ borderColor: '#3a3028' }} />
        </div>
      )}

      {/* Textarea */}
      <textarea
        rows={7}
        disabled={isActive}
        value={request}
        onChange={e => setRequest(e.target.value)}
        placeholder={"Describe what you want to build...\n\ne.g. A REST API for a blog where users can write posts, comment, and follow authors."}
        className="w-full rounded-lg px-3.5 py-3 font-mono leading-relaxed resize-none focus:outline-none transition-colors"
        style={{
          fontSize: 13,
          background: '#1e1a15',
          border: `1.5px solid ${request.trim() ? 'rgba(245,146,42,0.4)' : '#3a3028'}`,
          color: '#f0e8dc',
          opacity: isActive ? 0.45 : 1,
          cursor: isActive ? 'not-allowed' : 'text',
        }}
        onFocus={e  => { if (!isActive) e.target.style.borderColor = 'rgba(245,146,42,0.6)' }}
        onBlur={e   => { e.target.style.borderColor = request.trim() ? 'rgba(245,146,42,0.4)' : '#3a3028' }}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg px-3.5 py-2.5 border animate-fade-in"
             style={{ background: '#201515', borderColor: 'rgba(240,96,96,0.4)', color: '#f06060', fontSize: 12 }}>
          ✕ {error}
        </div>
      )}

      {/* Buttons */}
      {canRun ? (
        <div className="flex flex-col gap-2">
          <button
            disabled={!request.trim() || loading}
            onClick={handleRun}
            className="w-full py-3 rounded-lg font-mono font-bold tracking-widest uppercase transition-all duration-200"
            style={{
              fontSize: 12,
              background:  request.trim() ? '#f5922a' : '#1e1a15',
              color:       request.trim() ? '#0e0c0a' : '#52453a',
              border:      request.trim() ? 'none' : '1px solid #3a3028',
              cursor:      !request.trim() || loading ? 'not-allowed' : 'pointer',
              boxShadow:   request.trim() ? '0 0 24px rgba(245,146,42,0.3)' : 'none',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(14,12,10,0.3)', borderTopColor: '#0e0c0a' }} />
                starting…
              </span>
            ) : '→ run pipeline'}
          </button>

          <button
            onClick={onDemo}
            className="w-full py-2.5 rounded-lg font-mono transition-all duration-150 border"
            style={{ fontSize: 12, color: '#a89070', borderColor: '#3a3028', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,146,42,0.35)'; e.currentTarget.style.color = '#f5922a' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a3028'; e.currentTarget.style.color = '#a89070' }}
          >
            ▷ watch demo run
          </button>
        </div>
      ) : (
        <button
          onClick={handleReset}
          className="w-full py-2.5 rounded-lg font-mono transition-all duration-150 border"
          style={{ fontSize: 12, color: '#a89070', borderColor: '#3a3028' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,146,42,0.35)'; e.currentTarget.style.color = '#f5922a' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a3028'; e.currentTarget.style.color = '#a89070' }}
        >
          ← new run
        </button>
      )}
    </div>
  )
}
