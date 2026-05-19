import { useState } from 'react'

function fmtSize(b) {
  return b < 1024 ? `${b}B` : `${(b / 1024).toFixed(1)}KB`
}

function FileViewer({ filename, content, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0e0c0a]/95 backdrop-blur-sm flex items-start justify-center pt-16 px-6 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[76vh] flex flex-col bg-surface border border-edge rounded shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-edge bg-raised flex-shrink-0">
          <span className="font-mono text-[11px] text-amber">{filename}</span>
          <button
            onClick={onClose}
            className="font-mono text-[10px] text-muted hover:text-ink transition-colors px-2"
          >
            ✕ close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="font-mono text-[11px] text-ink/80 leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function OutputPanel({ files, apiBase, isDemo }) {
  const [viewFile, setViewFile]   = useState(null)
  const [fileContent, setContent] = useState('')
  const [loading, setLoading]     = useState(false)

  const open = async (name) => {
    if (viewFile === name) { setViewFile(null); return }
    if (isDemo) {
      setContent(`# ${name}\n\n(Demo mode — run the real pipeline to generate actual output.)`)
      setViewFile(name)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/output/${name}`)
      const { content } = await res.json()
      setContent(content || '')
      setViewFile(name)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {viewFile && <FileViewer filename={viewFile} content={fileContent} onClose={() => setViewFile(null)} />}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-muted uppercase">Output</span>
          <span className="font-mono text-[10px] text-amber">{files.length} files</span>
        </div>

        <div className="flex flex-col gap-1">
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => open(f.name)}
              disabled={loading}
              className="flex items-center justify-between gap-2 bg-raised border border-edge hover:border-amber/40 rounded px-3 py-2 text-left group transition-all duration-150 animate-slide-up"
            >
              <span className="font-mono text-[10px] text-ink/70 group-hover:text-amber transition-colors truncate">{f.name}</span>
              <span className="font-mono text-[9px] text-faint flex-shrink-0">{fmtSize(f.size)}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
