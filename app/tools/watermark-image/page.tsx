'use client'
import { useState } from 'react'
import { Droplets, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const POSITIONS = ['top-left','top-center','top-right','middle-left','center','middle-right','bottom-left','bottom-center','bottom-right']
const POS_ICONS: Record<string, string> = {
  'top-left':'↖','top-center':'↑','top-right':'↗','middle-left':'←','center':'⊙','middle-right':'→','bottom-left':'↙','bottom-center':'↓','bottom-right':'↘'
}

export default function WatermarkImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [text, setText] = useState('SAMPLE')
  const [position, setPosition] = useState('center')
  const [opacity, setOpacity] = useState(50)
  const [fontSize, setFontSize] = useState(36)
  const [rotation, setRotation] = useState(0)
  const [color, setColor] = useState('#ffffff')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null); setPreview(URL.createObjectURL(f[0])) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('text', text); fd.append('position', position)
      fd.append('opacity', (opacity / 100).toString()); fd.append('fontSize', fontSize.toString())
      fd.append('rotation', rotation.toString()); fd.append('color', color)
      const res = await fetch('/api/image/watermark', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Watermark Image" description="Add custom text watermark to your image" icon={Droplets} color="bg-gradient-to-br from-blue-500 to-blue-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={false} label="Select image to watermark" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Watermark Text</label>
            <input value={text} onChange={e => setText(e.target.value)} autoFocus
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
            <div className="grid grid-cols-3 gap-1.5 w-36">
              {POSITIONS.map(pos => (
                <button key={pos} type="button" onClick={() => setPosition(pos)}
                  className={`h-10 w-10 rounded-lg border-2 text-lg transition ${position === pos ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-blue-300'}`}>
                  {POS_ICONS[pos]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-600">Opacity</label><span className="text-xs font-bold text-blue-600">{opacity}%</span></div>
              <input type="range" min={5} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full accent-blue-600" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-600">Rotation</label><span className="text-xs font-bold text-blue-600">{rotation}°</span></div>
              <input type="range" min={0} max={360} value={rotation} onChange={e => setRotation(+e.target.value)} className="w-full accent-blue-600" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-600">Font Size</label><span className="text-xs font-bold text-blue-600">{fontSize}px</span></div>
              <input type="range" min={12} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-blue-600" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-9 rounded cursor-pointer border" />
              <label className="text-sm text-gray-700">Color</label>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`watermarked_${file?.name}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Watermarked Image
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Adding Watermark...</> : <><Droplets className="w-5 h-5" /> Add Watermark</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
