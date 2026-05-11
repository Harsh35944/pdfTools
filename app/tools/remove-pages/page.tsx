'use client'
import { useState } from 'react'
import { Trash2, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function RemovePagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file || !pages.trim()) { setError('Enter pages to remove'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('pages', pages)
      const res = await fetch('/api/pdf/remove-pages', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Remove Pages" description="Delete specific pages from your PDF" icon={Trash2} color="bg-gradient-to-br from-yellow-500 to-yellow-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to remove pages from" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pages to Delete</label>
            <input type="text" value={pages} onChange={e => setPages(e.target.value)} autoFocus
              placeholder="e.g.  2, 4, 6  or  3-5  or  1, 3-5, 8"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition" />
            <p className="text-xs text-gray-400 mt-1.5">The pages you enter will be <strong>deleted</strong>. All other pages are kept.</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="removed-pages.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading || !pages.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Removing...</> : <><Trash2 className="w-5 h-5" /> Remove Pages</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
