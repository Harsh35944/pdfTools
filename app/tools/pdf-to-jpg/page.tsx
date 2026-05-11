'use client'
import { useState } from 'react'
import { FileImage, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'zip' | 'single'>('zip')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setPageCount(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setPageCount(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setPageCount(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('mode', mode)
      const res = await fetch('/api/pdf/pdf-to-jpg', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const pages = res.headers.get('X-Page-Count')
      if (pages) setPageCount(parseInt(pages))
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="PDF to JPG" description="Convert every PDF page to a high-quality JPG image" icon={FileImage} color="bg-gradient-to-br from-red-500 to-red-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to convert" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Output Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'zip', icon: '📦', label: 'All pages as ZIP', sub: 'One JPG per page' },
                { id: 'single', icon: '📄', label: 'First page only', sub: 'Single JPG output' },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setMode(m.id as any)}
                  className={`py-5 rounded-2xl flex flex-col items-center gap-1.5 border-2 font-semibold text-sm transition ${mode === m.id ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                  <span className="text-3xl">{m.icon}</span>
                  <span>{m.label}</span>
                  <span className="font-normal text-xs opacity-60">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {pageCount && <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">✅ Converted {pageCount} pages → ZIP archive ready</div>}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={mode === 'zip' ? 'pdf_pages.zip' : 'page_1.jpg'}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download {mode === 'zip' ? 'ZIP' : 'JPG'}
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><FileImage className="w-5 h-5" /> Convert to JPG</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
