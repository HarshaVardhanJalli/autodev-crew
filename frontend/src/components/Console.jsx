import { useEffect, useRef, useState } from 'react'

function LogLine({ log }) {
  if (log.type === 'divider') return <div className="log-divider" />
  const ts = new Date(log.id).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <div className={`flex gap-3 leading-relaxed animate-slide-up log-${log.type}`}>
      <span className="flex-shrink-0 select-none w-16 text-right opacity-40" style={{ fontSize: 11 }}>{ts}</span>
      <span className="break-all whitespace-pre-wrap">{log.text}</span>
    </div>
  )
}

export default function Console({ logs, phase }) {
  const bottomRef    = useRef(null)
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter]         = useState('all')

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, autoScroll])

  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 40)
  }

  const visible = filter === 'all'
    ? logs
    : filter === 'agent'
      ? logs.filter(l => ['agent', 'success', 'system', 'divider'].includes(l.type))
      : logs.filter(l => l.type === 'console')

  const errCount = logs.filter(l => l.type === 'error').length

  const filterBtn = (f) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className="font-mono uppercase tracking-wider transition-colors px-2.5 py-0.5 rounded border"
      style={{
        fontSize: 10,
        borderColor: filter === f ? 'rgba(245,146,42,0.5)' : '#3a3028',
        color:       filter === f ? '#f5922a' : '#8a7868',
        background:  filter === f ? 'rgba(245,146,42,0.08)' : 'transparent',
      }}
    >
      {f}
    </button>
  )

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0805' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0"
           style={{ borderColor: '#3a3028', background: '#141210' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold tracking-[0.18em] uppercase" style={{ fontSize: 11, color: '#a89070' }}>
            Output
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: '#6a5848' }}>
            {logs.filter(l => l.type !== 'divider').length} lines
          </span>
          {errCount > 0 && (
            <span className="font-mono px-1.5 py-0.5 rounded border"
                  style={{ fontSize: 10, color: '#f06060', borderColor: 'rgba(240,96,96,0.35)', background: 'rgba(240,96,96,0.08)' }}>
              {errCount} error{errCount > 1 ? 's' : ''}
            </span>
          )}
          {phase === 'running' && (
            <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 11, color: '#f5922a' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5922a] animate-pulse" />
              live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'agent', 'console'].map(filterBtn)}
          <button
            onClick={() => setAutoScroll(v => !v)}
            className="font-mono px-2.5 py-0.5 rounded border transition-colors"
            style={{
              fontSize: 10,
              borderColor: autoScroll ? 'rgba(245,146,42,0.5)' : '#3a3028',
              color:       autoScroll ? '#f5922a' : '#8a7868',
            }}
          >
            ↓ auto
          </button>
        </div>
      </div>

      {/* Log stream */}
      <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none"
               style={{ color: '#52453a' }}>
            <span className="font-mono text-2xl">{'_'}</span>
            <div className="font-mono text-center" style={{ fontSize: 13 }}>
              <div>waiting for pipeline</div>
              <div className="mt-1" style={{ fontSize: 11, opacity: 0.6 }}>describe a feature and run →</div>
            </div>
          </div>
        ) : (
          visible.map(log => <LogLine key={log.id} log={log} />)
        )}

        {phase === 'running' && (
          <div className="font-mono flex gap-3" style={{ fontSize: 12 }}>
            <span className="w-16" />
            <span className="animate-blink" style={{ color: '#f5922a', opacity: 0.7 }}>█</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
