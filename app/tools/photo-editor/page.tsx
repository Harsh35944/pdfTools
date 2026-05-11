'use client'
import { useState, useRef, useEffect } from 'react'
import { Palette, Download, RotateCcw, Sun, Contrast } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'

export default function PhotoEditorPage() {
  const [original, setOriginal] = useState<string | null>(null)
  const [fileName, setFileName] = useState('photo')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const [settings, setSettings] = useState({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 })

  const onFiles = (files: File[]) => {
    setFileName(files[0].name.replace(/\.[^.]+$/, ''))
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginal(e.target?.result as string)
      setSettings({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 })
    }
    reader.readAsDataURL(files[0])
  }

  useEffect(() => {
    if (!original || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      canvas.width = img.width
      canvas.height = img.height
      ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.blur}px) grayscale(${settings.grayscale}%) sepia(${settings.sepia}%) hue-rotate(${settings.hue}deg)`
      ctx.drawImage(img, 0, 0)
    }
    img.src = original
  }, [original, settings])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/jpeg', 0.92)
    a.download = `${fileName}_edited.jpg`
    a.click()
  }

  const sliders = [
    { key: 'brightness', label: 'Brightness', icon: Sun, min: 0, max: 200, def: 100, unit: '%' },
    { key: 'contrast', label: 'Contrast', icon: Contrast, min: 0, max: 200, def: 100, unit: '%' },
    { key: 'saturation', label: 'Saturation', icon: Palette, min: 0, max: 300, def: 100, unit: '%' },
    { key: 'hue', label: 'Hue Rotate', icon: Palette, min: 0, max: 360, def: 0, unit: '°' },
    { key: 'blur', label: 'Blur', icon: Palette, min: 0, max: 20, def: 0, unit: 'px' },
    { key: 'grayscale', label: 'Grayscale', icon: Palette, min: 0, max: 100, def: 0, unit: '%' },
    { key: 'sepia', label: 'Sepia', icon: Palette, min: 0, max: 100, def: 0, unit: '%' },
  ] as const

  return (
    <ToolPage title="Photo Editor" description="Adjust brightness, contrast, saturation and more" icon={Palette} color="bg-gradient-to-br from-fuchsia-500 to-pink-600">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {!original ? (
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }} multiple={false} label="Select photo to edit" />
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full rounded-xl border border-gray-200 mb-6 max-h-72 object-contain" style={{ imageRendering: 'auto' }} />

            <div className="space-y-4">
              {sliders.map(({ key, label, min, max, def, unit }) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-fuchsia-600 font-bold">{(settings as any)[key]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={(settings as any)[key]}
                    onChange={(e) => setSettings((p) => ({ ...p, [key]: parseFloat(e.target.value) }))}
                    className="w-full accent-fuchsia-500" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setSettings({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 })}
                className="flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={() => { setOriginal(null) }}
                className="flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl">
                New Image
              </button>
              <button onClick={handleDownload}
                className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> Download Edited Photo
              </button>
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
