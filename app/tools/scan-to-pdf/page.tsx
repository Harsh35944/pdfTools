'use client'
import { useState } from 'react'
import { ScanLine, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function ScanToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (f: File[]) => { setFiles(prev => [...prev, ...f]); setDownloadUrl(null); setError(null) }
  const remove = (i: number) => setFiles(prev => prev.filter((_, j) => j !== i))
  const reset = () => { setFiles([]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!files.length) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); files.forEach(f => fd.append('files', f))
      const res = await fetch('/api/pdf/scan-to-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Scan to PDF" description="Convert scanned images into a single PDF" icon={ScanLine} color="bg-gradient-to-br from-teal-500 to-teal-800">
      {files.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={addFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp','.bmp','.tiff'] }} multiple label="Select scanned images" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Pages will appear in this order:</p>
          {files.map((f, i) => <FileCard key={i} file={f} onRemove={() => remove(i)} />)}
          <button type="button" onClick={() => document.getElementById('scan-add')?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-teal-400 hover:text-teal-500 transition">
            + Add more scans
          </button>
          <input id="scan-add" type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(Array.from(e.target.files || []))} />
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download="scanned.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating PDF...</> : <><ScanLine className="w-5 h-5" /> Create PDF ({files.length} pages)</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
