import { useEffect, useState } from 'react'

const STEP_LABELS = ['01', '02', '03', '04', '05']

const STATE_CLASS = {
  idle:     'agent-idle',
  active:   'agent-active',
  complete: 'agent-complete',
  error:    'agent-error',
}

const STATE_TAG = {
  idle:     { label: 'WAITING', cls: 'text-faint' },
  active:   { label: 'WORKING', cls: 'text-amber' },
  complete: { label: 'DONE',    cls: 'text-grove' },
  error:    { label: 'FAILED',  cls: 'text-ember' },
}

function fmt(ms) {
  if (!ms || ms < 0) return null
  const s = Math.floor(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function AgentCard({ agent, index }) {
  const { role, desc, status, startTime, duration, preview } = agent
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'active' || !startTime) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(id)
  }, [status, startTime])

  const timeStr = status === 'complete' ? fmt(duration)
                : status === 'active'   ? fmt(elapsed)
                : null

  const tag = STATE_TAG[status]

  return (
    <div className={`flex flex-col gap-3 p-3 rounded transition-all duration-500 ${STATE_CLASS[status]}`}>
      {/* Step number + timer */}
      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs font-bold tracking-widest ${
          status === 'active'   ? 'text-amber' :
          status === 'complete' ? 'text-grove/60' :
          'text-faint'
        }`}>
          {STEP_LABELS[index]}
        </span>
        {timeStr && (
          <span className="font-mono text-[10px] text-muted">{timeStr}</span>
        )}
        {status === 'active' && !timeStr && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        )}
      </div>

      {/* Role name */}
      <div>
        <div className="text-[11px] font-semibold leading-snug tracking-tight">{role}</div>
        <div className="text-[10px] text-muted mt-0.5 leading-relaxed">{desc}</div>
      </div>

      {/* Status line */}
      <div className={`text-[9px] font-mono font-bold tracking-[0.15em] ${tag.cls}`}>
        {tag.label}
      </div>

      {/* Output preview on complete */}
      {status === 'complete' && preview && (
        <div
          title={preview}
          className="text-[10px] font-mono text-grove/60 leading-relaxed border-l-2 border-grove/30 pl-2 line-clamp-2 cursor-default"
        >
          {preview.slice(0, 110)}
        </div>
      )}
    </div>
  )
}
