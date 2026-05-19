import { useEffect, useRef, useState } from 'react'

function LogLine({ log }) {
  if (log.type === 'divider') return <div className="log-divider" />
  return (
    <div className={`flex gap-2 font-mono text-[11px] leading-relaxed animate-slide-up log-${log.type}`}>
      <span className="opacity-30 flex-shrink-0 select-none w-12 text-right">
        {new Date(log.id).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="break-all whitespace-pre-wrap">{log.text}</span>
    </div>
  )
}

export default function Console({ logs, phase }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState('all') // all | agent | console

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }

  const visible = filter === 'all'
    ? logs
    : filter === 'agent'
      ? logs.filter(l => ['agent', 'success', 'system', 'divider'].includes(l.type))
      : logs.filter(l => l.type === 'console')

  const counts = {
    errors: logs.filter(l => l.type === 'error').length,
    agents: logs.filter(l => l.type === 'agent').length,
  }

  return (
    <div className="flex flex-col h-full bg-[#070712]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Console</span>
          <span className="text-[10px] text-slate-600 font-mono">{logs.filter(l => l.type !== 'divider').length} lines</span>
          {counts.errors > 0 && (
            <span className="text-[10px] bg-rose-900/40 text-rose-400 px-1.5 py-0.5 rounded">
              {counts.errors} error{counts.errors > 1 ? 's' : ''}
            </span>
          )}
          {phase === 'running' && (
            <span className="flex items-center gap-1 text-[10px] text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          {['all', 'agent', 'console'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors capitalize ${
                filter === f
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(v => !v)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              autoScroll
                ? 'border-indigo-500/40 text-indigo-400'
                : 'border-border text-slate-600 hover:text-slate-400'
            }`}
            title="Toggle auto-scroll"
          >
            ↓ Auto
          </button>
        </div>
      </div>

      {/* Log output */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
      >
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 select-none">
            <div className="text-3xl mb-3">⬛</div>
            <div className="text-sm font-medium">Console output will appear here</div>
            <div className="text-xs mt-1">Select a feature and run the pipeline to start</div>
          </div>
        ) : (
          visible.map(log => <LogLine key={log.id} log={log} />)
        )}

        {/* Blinking cursor when running */}
        {phase === 'running' && (
          <div className="font-mono text-[11px] text-indigo-400 flex items-center gap-1">
            <span className="opacity-30 w-12" />
            <span className="animate-blink">█</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
