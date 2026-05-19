import { useEffect, useState } from 'react'

const STATUS_CLASSES = {
  idle:     'status-idle',
  active:   'status-active',
  complete: 'status-complete',
  error:    'status-error',
}

const STATUS_DOT = {
  idle:     'bg-slate-700',
  active:   'bg-indigo-400 animate-pulse',
  complete: 'bg-emerald-400',
  error:    'bg-rose-500',
}

const STATUS_LABEL = {
  idle:     'Waiting',
  active:   'Working…',
  complete: 'Done',
  error:    'Failed',
}

function fmt(ms) {
  if (!ms) return ''
  const s = Math.floor(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function AgentCard({ agent }) {
  const { icon, role, desc, status, startTime, duration, preview } = agent
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'active' || !startTime) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(id)
  }, [status, startTime])

  const timeLabel =
    status === 'complete' && duration ? fmt(duration) :
    status === 'active' ? fmt(elapsed) : ''

  return (
    <div className={`flex flex-col gap-2 rounded-xl border px-3 py-3 transition-all duration-500 ${STATUS_CLASSES[status]}`}>
      {/* Top row: icon + status dot */}
      <div className="flex items-center justify-between">
        <span className="text-xl leading-none">{icon}</span>
        <div className="flex items-center gap-1.5">
          {timeLabel && (
            <span className="text-[10px] font-mono opacity-70">{timeLabel}</span>
          )}
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
        </div>
      </div>

      {/* Role */}
      <div>
        <div className="text-xs font-semibold leading-tight tracking-tight">{role}</div>
        <div className="text-[10px] opacity-50 mt-0.5 leading-tight">{desc}</div>
      </div>

      {/* Status badge */}
      <div className={`text-[10px] font-medium tracking-wide uppercase ${
        status === 'active'   ? 'text-indigo-400' :
        status === 'complete' ? 'text-emerald-400' :
        status === 'error'    ? 'text-rose-400' :
        'text-slate-600'
      }`}>
        {STATUS_LABEL[status]}
      </div>

      {/* Output preview chip — shown on complete */}
      {status === 'complete' && preview && (
        <div
          className="text-[10px] text-emerald-500/70 font-mono line-clamp-2 border border-emerald-900/40 bg-emerald-950/20 rounded px-2 py-1 leading-relaxed cursor-default"
          title={preview}
        >
          {preview.slice(0, 120)}…
        </div>
      )}

      {/* Error hint */}
      {status === 'error' && (
        <div className="text-[10px] text-rose-400/70">Check console for details</div>
      )}
    </div>
  )
}
