import { useState } from 'react'

function fmtSize(b) {
  return b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`
}

function FileViewer({ filename, content, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-6 animate-fade-in"
         style={{ background: 'rgba(14,12,10,0.94)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-4xl flex flex-col rounded-xl overflow-hidden shadow-2xl"
           style={{ maxHeight: '76vh', background: '#1a1612', border: '1px solid #3a3028' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
             style={{ borderColor: '#3a3028', background: '#141210' }}>
          <span className="font-mono font-semibold" style={{ fontSize: 13, color: '#f5922a' }}>{filename}</span>
          <button onClick={onClose}
                  className="font-mono transition-colors px-2"
                  style={{ fontSize: 12, color: '#8a7868' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f0e8dc'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8a7868'}>
            ✕ close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <pre className="font-mono leading-relaxed whitespace-pre-wrap break-words"
               style={{ fontSize: 12, color: '#d4c8b8' }}>
            {content}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function OutputPanel({ files, apiBase, isDemo }) {
  const [viewFile, setViewFile] = useState(null)
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(false)

  const open = async (name) => {
    if (viewFile === name) { setViewFile(null); return }
    if (isDemo) { setContent(`# ${name}\n\n(Demo mode — run the real pipeline to generate actual output.)`); setViewFile(name); return }
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/output/${name}`)
      const { content: c } = await res.json()
      setContent(c || ''); setViewFile(name)
    } finally { setLoading(false) }
  }

  return (
    <>
      {viewFile && <FileViewer filename={viewFile} content={content} onClose={() => setViewFile(null)} />}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-[0.15em] uppercase" style={{ fontSize: 11, color: '#a89070' }}>Output</span>
          <span className="font-mono font-semibold" style={{ fontSize: 12, color: '#f5922a' }}>{files.length} files</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => open(f.name)}
              disabled={loading}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left border transition-all duration-150 animate-slide-up group"
              style={{ background: '#1e1a15', borderColor: '#3a3028' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,146,42,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a3028' }}
            >
              <span className="font-mono truncate" style={{ fontSize: 12, color: '#d4c8b8' }}>{f.name}</span>
              <span className="font-mono flex-shrink-0" style={{ fontSize: 11, color: '#8a7868' }}>{fmtSize(f.size)}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
