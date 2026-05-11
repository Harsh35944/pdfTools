'use client'
import { useState } from 'react'
import { EyeOff, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function RedactPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file || !keywords.trim()) { setError('Enter keywords to redact'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('keywords', keywords)
      const res = await fetch('/api/pdf/redact-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Redact PDF" description="Permanently black out sensitive text in your PDF" icon={EyeOff} color="bg-gradient-to-br from-gray-700 to-gray-900">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to redact" />
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
            ⚠️ Redaction permanently removes text. The black boxes cannot be removed from the output PDF.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keywords to Redact</label>
            <textarea value={keywords} onChange={e => setKeywords(e.target.value)} rows={3} autoFocus
              placeholder={'One keyword or phrase per line:\nJohn Smith\n+1 555 0100\nconfidential@email.com'}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-500 transition resize-none font-mono" />
            <p className="text-xs text-gray-400 mt-1.5">Each line is a separate search term. Matching text will be covered with a black box.</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download="redacted.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Redacted PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading || !keywords.trim()}
              className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Redacting...</> : <><EyeOff className="w-5 h-5" /> Redact PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
