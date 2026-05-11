'use client'
import { useState, useRef, useCallback } from 'react'
import { Crop, Download, Loader2, RefreshCw } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'

export default function CropImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 }) // percentages
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFile = (files: File[]) => {
    const f = files[0]
    setFile(f); setDownloadUrl(null); setError(null)
    const img = new Image()
    const url = URL.createObjectURL(f)
    img.onload = () => { setNaturalW(img.naturalWidth); setNaturalH(img.naturalHeight) }
    img.src = url
    setPreview(url)
    setCrop({ x: 10, y: 10, w: 80, h: 80 })
  }

  // Mouse drag to define crop area on preview div
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    setDragStart({ x: px, y: py })
    setDragging(true)
  }

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const cy = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    setCrop({
      x: Math.min(dragStart.x, cx),
      y: Math.min(dragStart.y, cy),
      w: Math.abs(cx - dragStart.x),
      h: Math.abs(cy - dragStart.y),
    })
  }, [dragging, dragStart])

  const onMouseUp = () => setDragging(false)

  const handleCrop = async () => {
    if (!file || !naturalW || !naturalH) { setError('Please select an image'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      // Convert percentages to pixel coordinates
      const left = Math.round((crop.x / 100) * naturalW)
      const top = Math.round((crop.y / 100) * naturalH)
      const width = Math.round((crop.w / 100) * naturalW)
      const height = Math.round((crop.h / 100) * naturalH)

      if (width < 1 || height < 1) { setError('Please draw a crop area on the image'); setLoading(false); return }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('left', left.toString())
      formData.append('top', top.toString())
      formData.append('width', width.toString())
      formData.append('height', height.toString())

      const res = await fetch('/api/image/crop', { method: 'POST', body: formData })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Crop failed') }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Crop Image" description="Draw a selection to crop your image precisely" icon={Crop} color="bg-gradient-to-br from-rose-500 to-rose-700">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {!preview ? (
          <FileUpload onFiles={handleFile} accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }} multiple={false} label="Select image to crop" />
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Drag on the image to select crop area</p>
              <button onClick={() => { setPreview(null); setFile(null); setDownloadUrl(null) }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Change
              </button>
            </div>

            {/* Interactive crop canvas */}
            <div
              ref={containerRef}
              className="relative select-none rounded-xl overflow-hidden cursor-crosshair border border-gray-200"
              style={{ userSelect: 'none' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <img src={preview} alt="Preview" className="w-full block pointer-events-none" draggable={false} />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              {/* Crop selection (clears overlay) */}
              {crop.w > 0 && crop.h > 0 && (
                <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none"
                  style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.w}%`, height: `${crop.h}%` }}>
                  <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-white border border-rose-400" />
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white border border-rose-400" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-white border border-rose-400" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border border-rose-400" />
                </div>
              )}
            </div>

            {/* Crop info */}
            {crop.w > 0 && naturalW > 0 && (
              <p className="mt-2 text-xs text-gray-400 text-center">
                Crop: {Math.round((crop.w / 100) * naturalW)} × {Math.round((crop.h / 100) * naturalH)} px
                &nbsp;at ({Math.round((crop.x / 100) * naturalW)}, {Math.round((crop.y / 100) * naturalH)})
              </p>
            )}
          </>
        )}

        {error && <div className="mt-4 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <button onClick={handleCrop} disabled={loading || !file || crop.w < 1}
          className="mt-6 w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Cropping...</> : <><Crop className="w-5 h-5" /> Crop Image</>}
        </button>

        {downloadUrl && (
          <a href={downloadUrl} download={`cropped_${file?.name}`}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 block text-center">
            <Download className="w-5 h-5 inline mr-2" />Download Cropped Image
          </a>
        )}
      </div>
    </ToolPage>
  )
}
