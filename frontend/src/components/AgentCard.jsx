import { useEffect, useState } from 'react'

const STEP_LABELS = ['01', '02', '03', '04', '05']

const STATE_CLASS = {
  idle:     'agent-idle',
  active:   'agent-active',
  complete: 'agent-complete',
  error:    'agent-error',
}

const STATE_TAG = {
  idle:     { label: 'WAITING', color: '#6a5848' },
  active:   { label: 'WORKING', color: '#f5922a' },
  complete: { label: 'DONE',    color: '#64d264' },
  error:    { label: 'FAILED',  color: '#f06060' },
}

const STEP_COLOR = {
  idle:     '#6a5848',
  active:   '#f5922a',
  complete: '#64d264',
  error:    '#f06060',
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
    <div className={`flex flex-col gap-2.5 p-3.5 rounded-lg transition-all duration-500 ${STATE_CLASS[status]}`}>
      {/* Step + timer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold tracking-widest" style={{ color: STEP_COLOR[status] }}>
          {STEP_LABELS[index]}
        </span>
        {timeStr && (
          <span className="font-mono text-xs font-medium" style={{ color: '#a89070' }}>{timeStr}</span>
        )}
        {status === 'active' && !timeStr && (
          <span className="w-2 h-2 rounded-full bg-[#f5922a] animate-pulse" />
        )}
      </div>

      {/* Role */}
      <div>
        <div className="text-sm font-semibold leading-snug tracking-tight">{role}</div>
        <div className="text-xs mt-1 leading-relaxed" style={{ color: '#a89880' }}>{desc}</div>
      </div>

      {/* Status tag */}
      <div className="font-mono text-[10px] font-bold tracking-[0.18em]" style={{ color: tag.color }}>
        {tag.label}
      </div>

      {/* Output preview */}
      {status === 'complete' && preview && (
        <div
          title={preview}
          className="text-xs font-mono leading-relaxed border-l-2 pl-2.5 line-clamp-2 cursor-default"
          style={{ color: '#64d264', borderColor: 'rgba(100,210,100,0.35)', opacity: 0.85 }}
        >
          {preview.slice(0, 100)}
        </div>
      )}
    </div>
  )
}
