'use client'
import { useState } from 'react'
import { GitMerge, Download, Loader2, GripVertical, X } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'

function fmtSize(b: number) { return b < 1024 ** 2 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 ** 2).toFixed(1) + ' MB' }

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (newFiles: File[]) => { setFiles(prev => [...prev, ...newFiles]); setDownloadUrl(null); setError(null) }
  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))
  const moveUp = (idx: number) => { if (idx === 0) return; setFiles(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a }) }
  const moveDown = (idx: number) => { setFiles(prev => { if (idx >= prev.length - 1) return prev; const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a }) }

  const handle = async () => {
    if (files.length < 2) { setError('Select at least 2 PDFs'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); files.forEach(f => fd.append('files', f))
      const res = await fetch('/api/pdf/merge', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Merge PDF" description="Combine multiple PDFs into one document" icon={GitMerge} color="bg-gradient-to-br from-red-500 to-red-700">
      {files.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={addFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple label="Select 2 or more PDF files" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <p className="text-sm font-semibold text-gray-700">Files will merge in this order:</p>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveUp(i)} className="text-gray-400 hover:text-gray-700 text-xs leading-none" disabled={i === 0}>▲</button>
                  <button type="button" onClick={() => moveDown(i)} className="text-gray-400 hover:text-gray-700 text-xs leading-none" disabled={i === files.length - 1}>▼</button>
                </div>
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400">{fmtSize(f.size)}</p>
                </div>
                <button type="button" onClick={() => removeFile(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => document.getElementById('merge-add-input')?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-red-400 hover:text-red-500 transition">
              + Add more PDFs
            </button>
            <input id="merge-add-input" type="file" accept="application/pdf" multiple className="hidden"
              onChange={e => addFiles(Array.from(e.target.files || []))} />
          </div>

          {files.length < 2 && <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">Add at least one more PDF to merge.</p>}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="merged.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Merged PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading || files.length < 2}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Merging...</> : <><GitMerge className="w-5 h-5" /> Merge {files.length} PDFs</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
