'use client'
import { useState } from 'react'
import { Droplets, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const POSITIONS = ['top-left','top-center','top-right','middle-left','center','middle-right','bottom-left','bottom-center','bottom-right']
const POS_LABELS: Record<string, string> = {
  'top-left':'↖', 'top-center':'↑', 'top-right':'↗',
  'middle-left':'←', 'center':'⊙', 'middle-right':'→',
  'bottom-left':'↙', 'bottom-center':'↓', 'bottom-right':'↘',
}

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(30)
  const [fontSize, setFontSize] = useState(48)
  const [position, setPosition] = useState('center')
  const [rotation, setRotation] = useState(45)
  const [color, setColor] = useState('#cc0000')
  const [tiled, setTiled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('text', text); fd.append('opacity', (opacity / 100).toString())
      fd.append('fontSize', fontSize.toString()); fd.append('position', position)
      fd.append('rotation', rotation.toString()); fd.append('color', color); fd.append('tiled', tiled.toString())
      const res = await fetch('/api/pdf/watermark', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Watermark PDF" description="Add custom text watermark to every page" icon={Droplets} color="bg-gradient-to-br from-purple-600 to-purple-800">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select or drop your PDF here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          {/* Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Watermark Text</label>
            <input value={text} onChange={e => setText(e.target.value)} autoFocus
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition" />
          </div>

          {/* Position 3×3 grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
            <div className="grid grid-cols-3 gap-1.5 w-36">
              {POSITIONS.map(pos => (
                <button key={pos} type="button" onClick={() => setPosition(pos)}
                  className={`h-10 w-10 rounded-lg border-2 text-lg transition ${position === pos ? 'border-purple-500 bg-purple-100' : 'border-gray-200 hover:border-purple-300'}`}>
                  {POS_LABELS[pos]}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-600">Opacity</label><span className="text-xs text-purple-600 font-bold">{opacity}%</span></div>
              <input type="range" min={5} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full accent-purple-600" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-600">Rotation</label><span className="text-xs text-purple-600 font-bold">{rotation}°</span></div>
              <input type="range" min={0} max={360} value={rotation} onChange={e => setRotation(+e.target.value)} className="w-full accent-purple-600" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-600">Font Size</label><span className="text-xs text-purple-600 font-bold">{fontSize}pt</span></div>
              <input type="range" min={12} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-purple-600" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-9 rounded cursor-pointer border" />
              <label className="text-sm text-gray-700">Color</label>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={tiled} onChange={e => setTiled(e.target.checked)} className="w-4 h-4 accent-purple-600" />
            <span className="text-sm text-gray-700">Tile watermark across the page</span>
          </label>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="watermarked.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Watermarked PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Adding Watermark...</> : <><Droplets className="w-5 h-5" /> Add Watermark</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
