'use client'
import { useState } from 'react'
import { Monitor, Download, Loader2, AlertTriangle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function PptxToPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null); setMissing(false) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null); setMissing(false) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setMissing(false)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/pdf/pptx-to-pdf', { method: 'POST', body: fd })
      if (res.status === 503) { setMissing(true); setLoading(false); return }
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="PowerPoint to PDF" description="Convert .pptx presentations to PDF" icon={Monitor} color="bg-gradient-to-br from-orange-600 to-orange-900">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], 'application/vnd.ms-powerpoint': ['.ppt'] }} multiple={false} label="Select .ppt or .pptx file" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center"><div className="text-3xl">📊</div><div className="text-xs mt-1 text-gray-500">PPTX</div></div>
            <div className="text-2xl text-gray-300">→</div>
            <div className="text-center"><div className="text-3xl">📄</div><div className="text-xs mt-1 text-gray-500">PDF</div></div>
          </div>
          {missing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm"><p className="font-semibold text-amber-700">LibreOffice required</p>
                <p className="text-amber-600 text-xs mt-1 font-mono">choco install libreoffice</p></div>
            </div>
          )}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download={file.name.replace(/\.pptx?$/, '.pdf')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Monitor className="w-5 h-5" /> Convert to PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
