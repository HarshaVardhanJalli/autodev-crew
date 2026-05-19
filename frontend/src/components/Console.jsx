import { useEffect, useRef, useState } from 'react'

function LogLine({ log }) {
  if (log.type === 'divider') return <div className="log-divider" />
  return (
    <div className={`flex gap-2 text-[11px] leading-relaxed animate-slide-up log-${log.type}`}>
      <span className="opacity-25 flex-shrink-0 select-none w-14 text-right font-mono">
        {new Date(log.id).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
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

  return (
    <div className="flex flex-col h-full bg-[#090705]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-edge bg-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-muted uppercase">Output</span>
          <span className="font-mono text-[10px] text-faint">
            {logs.filter(l => l.type !== 'divider').length} lines
          </span>
          {errCount > 0 && (
            <span className="font-mono text-[9px] bg-[#1f1313] text-ember border border-ember/30 px-1.5 py-0.5 rounded">
              {errCount} error{errCount > 1 ? 's' : ''}
            </span>
          )}
          {phase === 'running' && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'agent', 'console'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[9px] px-2 py-0.5 rounded border transition-colors uppercase tracking-wider ${
                filter === f
                  ? 'border-amber/40 text-amber bg-[#1f1912]'
                  : 'border-edge text-faint hover:text-muted'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setAutoScroll(v => !v)}
            className={`font-mono text-[9px] px-2 py-0.5 rounded border transition-colors ${
              autoScroll ? 'border-amber/40 text-amber' : 'border-edge text-faint hover:text-muted'
            }`}
          >
            ↓
          </button>
        </div>
      </div>

      {/* Log stream */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
      >
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-faint select-none gap-3">
            <pre className="font-mono text-xs leading-relaxed opacity-40 text-center">{`>_`}</pre>
            <div className="font-mono text-[11px] text-center">
              <div>waiting for pipeline</div>
              <div className="text-[10px] mt-1 opacity-60">describe a feature and run →</div>
            </div>
          </div>
        ) : (
          visible.map(log => <LogLine key={log.id} log={log} />)
        )}

        {phase === 'running' && (
          <div className="font-mono text-[11px] text-amber/60 flex gap-2">
            <span className="opacity-25 w-14 text-right" />
            <span className="animate-blink">█</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
