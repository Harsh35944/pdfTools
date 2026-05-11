'use client'
import { useState, useEffect } from 'react'
import { Maximize2, Download, Loader2, Lock, Unlock } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const FIT_OPTIONS = ['inside', 'cover', 'fill', 'contain']

export default function ResizeImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [origW, setOrigW] = useState(0)
  const [origH, setOrigH] = useState(0)
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [percent, setPercent] = useState(50)
  const [fit, setFit] = useState('inside')
  const [locked, setLocked] = useState(true) // lock aspect ratio
  const [upscale, setUpscale] = useState(true)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setError(null); setOrigW(0); setOrigH(0) }

  const onFiles = (files: File[]) => {
    const f = files[0]; setFile(f); setDownloadUrl(null); setError(null)
    const url = URL.createObjectURL(f); setPreview(url)
    const img = new Image()
    img.onload = () => { setOrigW(img.naturalWidth); setOrigH(img.naturalHeight); setWidth(String(img.naturalWidth)); setHeight(String(img.naturalHeight)) }
    img.src = url
  }

  const onWidthChange = (v: string) => {
    setWidth(v)
    if (locked && origW && origH) setHeight(String(Math.round(parseInt(v) * origH / origW)) || '')
  }
  const onHeightChange = (v: string) => {
    setHeight(v)
    if (locked && origW && origH) setWidth(String(Math.round(parseInt(v) * origW / origH)) || '')
  }

  const handle = async () => {
    if (!file) return
    if (mode === 'pixels' && !width && !height) { setError('Enter width or height'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('mode', mode); fd.append('fit', fit); fd.append('upscale', upscale.toString())
      if (mode === 'pixels') { if (width) fd.append('width', width); if (height) fd.append('height', height) }
      else fd.append('percent', percent.toString())
      const res = await fetch('/api/image/resize', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Resize Image" description="Resize by pixels or percentage, preserves format" icon={Maximize2} color="bg-gradient-to-br from-yellow-500 to-yellow-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }} multiple={false} label="Select or drop your image here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          {origW > 0 && (
            <div className="text-xs text-gray-400 text-center -mt-3">
              Original: {origW} × {origH} px
            </div>
          )}

          {/* Mode tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {(['pixels', 'percent'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500'}`}>
                {m === 'pixels' ? '📐 By Pixels' : '📊 By Percentage'}
              </button>
            ))}
          </div>

          {mode === 'pixels' ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 block mb-1">Width (px)</label>
                <input type="number" value={width} onChange={e => onWidthChange(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <button type="button" onClick={() => setLocked(!locked)}
                className={`mt-5 p-2.5 rounded-xl border-2 transition ${locked ? 'border-yellow-400 bg-yellow-50 text-yellow-600' : 'border-gray-200 text-gray-400'}`}
                title={locked ? 'Lock aspect ratio' : 'Unlock aspect ratio'}>
                {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 block mb-1">Height (px)</label>
                <input type="number" value={height} onChange={e => onHeightChange(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Scale</label>
                <span className="text-lg font-bold text-yellow-600">{percent}%</span>
              </div>
              <input type="range" min={1} max={200} value={percent} onChange={e => setPercent(+e.target.value)} className="w-full accent-yellow-500 h-2" />
              {origW > 0 && <p className="text-xs text-gray-400 mt-1 text-center">
                Result: {Math.round(origW * percent / 100)} × {Math.round(origH * percent / 100)} px
              </p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Fit Mode</label>
              <select value={fit} onChange={e => setFit(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-400">
                {FIT_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={upscale} onChange={e => setUpscale(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                <span className="text-sm text-gray-700">Allow upscaling</span>
              </label>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`resized_${file?.name}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Resized Image
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resizing...</> : <><Maximize2 className="w-5 h-5" /> Resize Image</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
