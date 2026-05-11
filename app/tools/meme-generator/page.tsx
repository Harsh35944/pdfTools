'use client'
import { useState } from 'react'
import { Smile, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function MemeGeneratorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [topText, setTopText] = useState('TOP TEXT')
  const [bottomText, setBottomText] = useState('BOTTOM TEXT')
  const [fontSize, setFontSize] = useState(48)
  const [memeUrl, setMemeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setMemeUrl(null); setError(null) }
  const onFiles = (f: File[]) => {
    setFile(f[0]); setMemeUrl(null); setError(null)
    const r = new FileReader(); r.onload = e => setPreview(e.target?.result as string); r.readAsDataURL(f[0])
  }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setMemeUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('topText', topText); fd.append('bottomText', bottomText); fd.append('fontSize', fontSize.toString())
      const res = await fetch('/api/image/meme', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setMemeUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Meme Generator" description="Add classic meme text to any image" icon={Smile} color="bg-gradient-to-br from-yellow-400 to-orange-500">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={false} label="Select image for meme" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          {/* Live meme preview */}
          {(memeUrl || preview) && (
            <div className="relative rounded-xl overflow-hidden border-2 border-yellow-300 bg-black">
              <img src={memeUrl || preview!} alt="meme" className="w-full object-contain max-h-56" />
              {!memeUrl && (
                <>
                  <p className="absolute top-2 left-0 right-0 text-center text-white font-black text-xl tracking-wider"
                    style={{ textShadow:'2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000', fontSize: `${fontSize * 0.4}px` }}>{topText}</p>
                  <p className="absolute bottom-2 left-0 right-0 text-center text-white font-black tracking-wider"
                    style={{ textShadow:'2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000', fontSize: `${fontSize * 0.4}px` }}>{bottomText}</p>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <input type="text" value={topText} onChange={e => setTopText(e.target.value)} placeholder="TOP TEXT"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-black uppercase text-sm focus:outline-none focus:border-yellow-400 transition tracking-wider" />
            <input type="text" value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="BOTTOM TEXT"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-black uppercase text-sm focus:outline-none focus:border-yellow-400 transition tracking-wider" />
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Size: <span className="font-bold text-yellow-600">{fontSize}px</span></label>
              <input type="range" min={24} max={96} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="flex-1 accent-yellow-500" />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {memeUrl ? (
            <a href={memeUrl} download="meme.jpg"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Meme
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Smile className="w-5 h-5" /> Generate Meme 😂</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
