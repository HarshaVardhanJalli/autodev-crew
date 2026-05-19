import { useState } from 'react'

const FILE_ICONS = {
  '.md':  '📄',
  '.py':  '🐍',
  '.txt': '📝',
  '.json':'📦',
  '.yaml':'⚙️',
  '.yml': '⚙️',
  '.js':  '🟨',
  '.ts':  '🔷',
}

function ext(name) {
  return '.' + name.split('.').pop()
}

function fileIcon(name) {
  return FILE_ICONS[ext(name)] || '📄'
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function FileViewer({ filename, content, onClose }) {
  const isPy = filename.endsWith('.py')
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <span>{fileIcon(filename)}</span>
          <span className="text-xs font-mono font-medium text-slate-300">{filename}</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-slate-300 text-sm transition-colors px-2"
        >
          ✕ Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <pre className={`text-[11px] leading-relaxed whitespace-pre-wrap break-words ${
          isPy ? 'text-emerald-300/90' : 'text-slate-300'
        } font-mono`}>
          {content}
        </pre>
      </div>
    </div>
  )
}

export default function OutputPanel({ files, apiBase }) {
  const [viewFile, setViewFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [loading, setLoading] = useState(false)

  const open = async (name) => {
    if (viewFile === name) {
      setViewFile(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/output/${name}`)
      const { content } = await res.json()
      setFileContent(content || '')
      setViewFile(name)
    } finally {
      setLoading(false)
    }
  }

  if (viewFile) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070712]/90 flex items-start justify-center pt-16 px-4 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-4xl max-h-[80vh] flex flex-col bg-[#0d0d22] border border-border rounded-xl shadow-2xl overflow-hidden">
          <FileViewer filename={viewFile} content={fileContent} onClose={() => setViewFile(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Output Files
        <span className="ml-2 text-slate-600 font-normal normal-case tracking-normal">{files.length} generated</span>
      </div>

      {files.length === 0 ? (
        <div className="text-[11px] text-slate-700 italic">Files will appear here after the pipeline completes.</div>
      ) : (
        <div className="flex flex-col gap-1">
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => open(f.name)}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 hover:border-indigo-500/40 hover:bg-[#101030] transition-all duration-200 text-left group animate-slide-up"
            >
              <span className="text-sm flex-shrink-0">{fileIcon(f.name)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-slate-300 group-hover:text-indigo-300 transition-colors truncate">{f.name}</div>
                <div className="text-[10px] text-slate-600">{fmtSize(f.size)}</div>
              </div>
              <span className="text-[10px] text-slate-700 group-hover:text-indigo-500 transition-colors flex-shrink-0">View →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
