'use client'
import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function PdfToWordPage() {
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
      const res = await fetch('/api/pdf/pdf-to-word', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="PDF to Word" description="Convert PDF to an editable Word document" icon={FileText} color="bg-gradient-to-br from-blue-600 to-blue-800">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to convert to Word" />
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            📝 Text is extracted from the PDF and placed in a structured .docx file. Formatting may vary.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />
          <div className="flex items-center justify-center gap-4 py-4 text-gray-500">
            <div className="text-center"><div className="text-3xl">📄</div><div className="text-xs mt-1">PDF</div></div>
            <div className="text-2xl text-gray-300">→</div>
            <div className="text-center"><div className="text-3xl">📝</div><div className="text-xs mt-1">DOCX</div></div>
          </div>
          {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Extracting text and building document…</p>}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download="converted.docx"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Word (.docx)
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><FileText className="w-5 h-5" /> Convert to Word</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
