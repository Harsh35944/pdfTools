'use client'
import { useState, useRef } from 'react'
import { PenTool, Download, Loader2, Type, Square, Circle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

type AnnotationType = 'text' | 'rect' | 'circle'
interface Annotation { type: AnnotationType; pageIndex: number; x: number; y: number; text?: string; fontSize?: number; color?: [number,number,number]; width?: number; height?: number }

export default function EditPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [tool, setTool] = useState<AnnotationType>('text')
  const [textInput, setTextInput] = useState('Hello')
  const [colorHex, setColorHex] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hexToRgb = (hex: string): [number,number,number] => [parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255]
  const reset = () => { setFile(null); setAnnotations([]); setDownloadUrl(null); setError(null) }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ann: Annotation = {
      type: tool, pageIndex: 0, x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top),
      color: hexToRgb(colorHex),
      ...(tool === 'text' ? { text: textInput, fontSize: 14 } : { width: 100, height: 60 }),
    }
    setAnnotations(prev => [...prev, ann])
  }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('annotations', JSON.stringify(annotations))
      const res = await fetch('/api/pdf/edit-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed') }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Edit PDF" description="Add text, shapes and annotations to your PDF" icon={PenTool} color="bg-gradient-to-br from-violet-500 to-violet-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={f => { setFile(f[0]); setAnnotations([]); setDownloadUrl(null) }} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to edit" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileCard file={file} onRemove={reset} />

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center bg-gray-50 rounded-xl p-3">
            {([['text','Text',Type],['rect','Rectangle',Square],['circle','Circle',Circle]] as const).map(([t, label, Icon]) => (
              <button key={t} type="button" onClick={() => setTool(t as AnnotationType)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition ${tool === t ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
            <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} className="w-9 h-9 rounded-lg border cursor-pointer" title="Color" />
            {tool === 'text' && (
              <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Text to add"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[120px] focus:outline-none focus:border-violet-400" />
            )}
          </div>

          {/* Click canvas */}
          <div onClick={handleCanvasClick}
            className="w-full h-52 bg-gray-50 border-2 border-dashed border-violet-300 rounded-xl cursor-crosshair relative overflow-hidden flex items-center justify-center select-none">
            <p className="text-gray-400 text-sm pointer-events-none">Click here to place {tool} on page 1</p>
            {annotations.map((ann, i) => (
              <div key={i} style={{ position:'absolute', left:ann.x, top:ann.y, color:`rgb(${(ann.color?.[0]??0)*255},${(ann.color?.[1]??0)*255},${(ann.color?.[2]??0)*255})` }}
                className="text-sm font-medium pointer-events-none">
                {ann.type === 'text' ? ann.text : ann.type === 'rect' ? '▭' : '◯'}
              </div>
            ))}
          </div>

          {annotations.length > 0 && (
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{annotations.length} annotation(s)</span>
              <button type="button" onClick={() => setAnnotations([])} className="text-red-500 hover:underline text-xs">Clear all</button>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="edited.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Edited PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Applying...</> : <><PenTool className="w-5 h-5" /> Apply & Download</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
