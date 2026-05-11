'use client'
import { useState } from 'react'
import { FileImage, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const PAGE_SIZES = [
  { id: 'fit', label: 'Fit Image', sub: 'Page = image size' },
  { id: 'a4', label: 'A4', sub: '210 × 297 mm' },
  { id: 'letter', label: 'Letter', sub: '8.5 × 11 in' },
  { id: 'legal', label: 'Legal', sub: '8.5 × 14 in' },
]
const ORIENTATIONS = [
  { id: 'auto', label: '🔄 Auto' },
  { id: 'portrait', label: '📄 Portrait' },
  { id: 'landscape', label: '🖼️ Landscape' },
]

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('auto')
  const [margin, setMargin] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (newFiles: File[]) => { setFiles(prev => [...prev, ...newFiles]); setDownloadUrl(null); setError(null) }
  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))
  const reset = () => { setFiles([]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!files.length) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('pageSize', pageSize); fd.append('orientation', orientation)
      fd.append('margin', margin.toString())
      const res = await fetch('/api/pdf/jpg-to-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Images to PDF" description="Convert JPG, PNG and other images into a PDF" icon={FileImage} color="bg-gradient-to-br from-blue-500 to-blue-700">
      {files.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={addFiles} accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'] }} multiple label="Select or drop images here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          {/* File list */}
          <div className="space-y-2">
            {files.map((f, i) => (
              <FileCard key={i} file={f} onRemove={() => removeFile(i)} />
            ))}
            <button type="button" onClick={() => document.getElementById('add-more-input')?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition">
              + Add more images
            </button>
            <input id="add-more-input" type="file" accept="image/*" multiple className="hidden"
              onChange={e => addFiles(Array.from(e.target.files || []))} />
          </div>

          {/* Page size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Page Size</label>
            <div className="grid grid-cols-4 gap-2">
              {PAGE_SIZES.map(s => (
                <button key={s.id} type="button" onClick={() => setPageSize(s.id)}
                  className={`py-3 rounded-xl border-2 text-xs font-semibold flex flex-col items-center gap-0.5 transition ${pageSize === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                  <span>{s.label}</span>
                  <span className="font-normal opacity-60">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Orientation</label>
            <div className="flex gap-2">
              {ORIENTATIONS.map(o => (
                <button key={o.id} type="button" onClick={() => setOrientation(o.id)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition ${orientation === o.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Margin */}
          <div>
            <div className="flex justify-between mb-1"><label className="text-sm font-semibold text-gray-700">Margin</label><span className="text-sm text-blue-600 font-bold">{margin}pt</span></div>
            <input type="range" min={0} max={72} value={margin} onChange={e => setMargin(+e.target.value)} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>No margin</span><span>Large margin</span></div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="images.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><FileImage className="w-5 h-5" /> Convert to PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
