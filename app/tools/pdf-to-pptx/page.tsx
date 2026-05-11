'use client'
import { useState } from 'react'
import { Monitor, Download, Loader2, AlertTriangle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function PdfToPptxPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/pdf/pdf-to-pptx', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="PDF to PowerPoint" description="Convert PDF pages into editable slides" icon={Monitor} color="bg-gradient-to-br from-orange-500 to-orange-800">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to convert to PPTX" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Each PDF page becomes a slide image. Slide text is not editable (PDF layouts are preserved as images).
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center"><div className="text-3xl">📄</div><div className="text-xs mt-1 text-gray-500">PDF</div></div>
            <div className="text-2xl text-gray-300">→</div>
            <div className="text-center"><div className="text-3xl">📊</div><div className="text-xs mt-1 text-gray-500">PPTX</div></div>
          </div>
          {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Rendering PDF pages into slides…</p>}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download={file.name.replace('.pdf', '.pptx')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PPTX
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Monitor className="w-5 h-5" /> Convert to PPTX</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
