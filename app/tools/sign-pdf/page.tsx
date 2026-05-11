'use client'
import { useState } from 'react'
import { PenLine, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [sigText, setSigText] = useState('')
  const [position, setPosition] = useState('bottom-right')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file || !sigText.trim()) { setError('Enter signature text'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('signature', sigText); fd.append('position', position)
      const res = await fetch('/api/pdf/sign-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const POS = ['top-left','top-right','bottom-left','bottom-right']

  return (
    <ToolPage title="Sign PDF" description="Add a text signature to your PDF document" icon={PenLine} color="bg-gradient-to-br from-blue-600 to-blue-900">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to sign" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Signature Text</label>
            <input value={sigText} onChange={e => setSigText(e.target.value)} autoFocus
              placeholder="Your Name / Initials"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition font-serif text-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Position on Page</label>
            <div className="grid grid-cols-2 gap-2">
              {POS.map(p => (
                <button key={p} type="button" onClick={() => setPosition(p)}
                  className={`py-3 rounded-xl border-2 text-xs font-medium capitalize transition ${position === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                  {p.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download="signed.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Signed PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading || !sigText.trim()}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing...</> : <><PenLine className="w-5 h-5" /> Sign PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
