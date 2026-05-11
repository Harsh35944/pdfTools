import Link from 'next/link'
import {
  FileText, Image, Scissors, RotateCw, Lock, Unlock,
  Minimize2, PenTool, FileOutput, FileInput, Layers,
  Crop, RefreshCw, Maximize2, Eraser, Droplets, Type,
  FileType2, FileDiff, EyeOff, Wrench, Camera, ScanText,
  Languages, Sparkles, FileSearch, ZoomIn, Smile, Globe2,
  Search, FileEdit, Shield, LayoutGrid
} from 'lucide-react'

const pdfToolGroups = [
  {
    title: '📁 Organize',
    tools: [
      { name: 'Merge PDF', desc: 'Combine multiple PDFs into one', icon: Layers, href: '/tools/merge-pdf', color: 'bg-red-500' },
      { name: 'Split PDF', desc: 'Split PDF into separate pages', icon: Scissors, href: '/tools/split-pdf', color: 'bg-orange-500' },
      { name: 'Remove Pages', desc: 'Delete specific pages', icon: FileText, href: '/tools/remove-pages', color: 'bg-yellow-500' },
      { name: 'Extract Pages', desc: 'Pull out specific pages', icon: FileOutput, href: '/tools/extract-pages', color: 'bg-green-500' },
      { name: 'Rotate PDF', desc: 'Rotate pages in PDF', icon: RotateCw, href: '/tools/rotate-pdf', color: 'bg-teal-500' },
      { name: 'Crop PDF', desc: 'Trim PDF page margins', icon: Crop, href: '/tools/crop-pdf', color: 'bg-orange-400' },
    ],
  },
  {
    title: '🔄 Convert to PDF',
    tools: [
      { name: 'JPG to PDF', desc: 'Convert images to PDF', icon: FileInput, href: '/tools/jpg-to-pdf', color: 'bg-blue-500' },
      { name: 'Image to PDF', desc: 'Any image format to PDF', icon: Image, href: '/tools/image-to-pdf', color: 'bg-blue-400' },
      { name: 'Word to PDF', desc: 'Convert Word docs to PDF', icon: FileType2, href: '/tools/word-to-pdf', color: 'bg-blue-700' },
      { name: 'Excel to PDF', desc: 'Convert spreadsheets to PDF', icon: FileType2, href: '/tools/excel-to-pdf', color: 'bg-green-700' },
      { name: 'PowerPoint to PDF', desc: 'Convert presentations to PDF', icon: FileType2, href: '/tools/pptx-to-pdf', color: 'bg-red-600' },
      { name: 'HTML to PDF', desc: 'Convert web pages to PDF', icon: Globe2, href: '/tools/html-to-pdf', color: 'bg-orange-600' },
      { name: 'Scan to PDF', desc: 'Use camera to scan docs', icon: Camera, href: '/tools/scan-to-pdf', color: 'bg-cyan-600' },
    ],
  },
  {
    title: '📤 Convert from PDF',
    tools: [
      { name: 'PDF to JPG', desc: 'PDF pages to images', icon: Image, href: '/tools/pdf-to-jpg', color: 'bg-indigo-500' },
      { name: 'PDF to Word', desc: 'Convert PDF to Word doc', icon: FileType2, href: '/tools/pdf-to-word', color: 'bg-blue-600' },
      { name: 'PDF to Excel', desc: 'Extract tables to spreadsheet', icon: FileType2, href: '/tools/pdf-to-excel', color: 'bg-green-600' },
      { name: 'PDF to PowerPoint', desc: 'Convert PDF to slides', icon: FileType2, href: '/tools/pdf-to-pptx', color: 'bg-red-500' },
      { name: 'Extract Images', desc: 'Extract all embedded images', icon: Image, href: '/tools/extract-images', color: 'bg-pink-500' },
    ],
  },
  {
    title: '✏️ Edit & Annotate',
    tools: [
      { name: 'Edit PDF', desc: 'Add text and shapes', icon: PenTool, href: '/tools/edit-pdf', color: 'bg-indigo-500' },
      { name: 'Sign PDF', desc: 'Add your signature', icon: PenTool, href: '/tools/sign-pdf', color: 'bg-violet-500' },
      { name: 'Watermark PDF', desc: 'Add watermark overlay', icon: Droplets, href: '/tools/watermark-pdf', color: 'bg-purple-500' },
      { name: 'Page Numbers', desc: 'Add page numbers', icon: Type, href: '/tools/page-numbers', color: 'bg-pink-500' },
      { name: 'Compare PDF', desc: 'Compare two PDFs side by side', icon: FileDiff, href: '/tools/compare-pdf', color: 'bg-sky-500' },
      { name: 'Redact PDF', desc: 'Black out sensitive content', icon: EyeOff, href: '/tools/redact-pdf', color: 'bg-zinc-600' },
      { name: 'PDF Forms', desc: 'Fill & flatten form fields', icon: FileSearch, href: '/tools/pdf-forms', color: 'bg-teal-500' },
    ],
  },
  {
    title: '🔐 Security',
    tools: [
      { name: 'Protect PDF', desc: 'Password protect PDF', icon: Lock, href: '/tools/protect-pdf', color: 'bg-red-600' },
      { name: 'Unlock PDF', desc: 'Remove PDF password', icon: Unlock, href: '/tools/unlock-pdf', color: 'bg-orange-600' },
    ],
  },
  {
    title: '🛠️ Optimize & Repair',
    tools: [
      { name: 'Compress PDF', desc: 'Reduce PDF file size', icon: Minimize2, href: '/tools/compress-pdf', color: 'bg-green-600' },
      { name: 'Repair PDF', desc: 'Fix corrupted PDF files', icon: Wrench, href: '/tools/repair-pdf', color: 'bg-yellow-600' },
      { name: 'OCR PDF', desc: 'Make scanned PDF searchable', icon: ScanText, href: '/tools/ocr-pdf', color: 'bg-rose-500' },
      { name: 'PDF to PDF/A', desc: 'Convert to archival format', icon: Shield, href: '/tools/pdf-to-pdfa', color: 'bg-slate-500' },
    ],
  },
  {
    title: '🤖 AI & Smart',
    tools: [
      { name: 'AI Summarizer', desc: 'Summarize PDF documents', icon: Sparkles, href: '/tools/ai-summarizer', color: 'bg-purple-600' },
      { name: 'Translate PDF', desc: 'Translate PDF to other languages', icon: Languages, href: '/tools/translate-pdf', color: 'bg-cyan-700' },
    ],
  },
]

const imageToolGroups = [
  {
    title: '🖼️ Edit & Enhance',
    tools: [
      { name: 'Crop Image', desc: 'Crop and trim images', icon: Crop, href: '/tools/crop-image', color: 'bg-blue-500' },
      { name: 'Resize Image', desc: 'Change image dimensions', icon: Maximize2, href: '/tools/resize-image', color: 'bg-yellow-500' },
      { name: 'Rotate Image', desc: 'Rotate image', icon: RotateCw, href: '/tools/rotate-image', color: 'bg-teal-500' },
      { name: 'Photo Editor', desc: 'Adjust brightness, contrast, etc.', icon: PenTool, href: '/tools/photo-editor', color: 'bg-fuchsia-500' },
      { name: 'Upscale Image', desc: 'Increase image resolution', icon: ZoomIn, href: '/tools/upscale-image', color: 'bg-violet-500' },
      { name: 'Blur Face', desc: 'Blur faces & sensitive regions', icon: EyeOff, href: '/tools/blur-face', color: 'bg-slate-600' },
    ],
  },
  {
    title: '🔄 Convert',
    tools: [
      { name: 'Convert Image', desc: 'JPG ↔ PNG ↔ WebP', icon: RefreshCw, href: '/tools/convert-image', color: 'bg-purple-500' },
      { name: 'Convert from JPG', desc: 'JPG to PNG, WebP, AVIF…', icon: RefreshCw, href: '/tools/convert-from-jpg', color: 'bg-indigo-500' },
      { name: 'Image to PDF', desc: 'Bundle images into PDF', icon: FileText, href: '/tools/image-to-pdf', color: 'bg-red-500' },
      { name: 'HTML to Image', desc: 'Screenshot any webpage', icon: Globe2, href: '/tools/html-to-image', color: 'bg-teal-600' },
    ],
  },
  {
    title: '🎨 Create',
    tools: [
      { name: 'Watermark Image', desc: 'Add watermark to images', icon: Droplets, href: '/tools/watermark-image', color: 'bg-orange-500' },
      { name: 'Meme Generator', desc: 'Add classic meme captions', icon: Smile, href: '/tools/meme-generator', color: 'bg-yellow-500' },
    ],
  },
  {
    title: '⚡ Optimize',
    tools: [
      { name: 'Compress Image', desc: 'Reduce image file size', icon: Minimize2, href: '/tools/compress-image', color: 'bg-green-500' },
      { name: 'Remove Background', desc: 'Remove image background', icon: Eraser, href: '/tools/remove-bg', color: 'bg-pink-500' },
    ],
  },
]

function ToolCard({ tool }: { tool: { name: string; desc: string; icon: any; href: string; color: string } }) {
  return (
    <Link href={tool.href}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition group border border-gray-100 hover:border-gray-200">
      <div className={`${tool.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <tool.icon className="text-white w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-0.5 text-sm">{tool.name}</h3>
      <p className="text-xs text-gray-500 leading-snug">{tool.desc}</p>
    </Link>
  )
}

function ToolGroup({ group }: { group: { title: string; tools: any[] } }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-gray-700 mb-4">{group.title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {group.tools.map((tool) => <ToolCard key={tool.href} tool={tool} />)}
      </div>
    </div>
  )
}

export default function Home() {
  const totalTools = pdfToolGroups.reduce((a, g) => a + g.tools.length, 0)
    + imageToolGroups.reduce((a, g) => a + g.tools.length, 0)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur">
            <LayoutGrid className="w-4 h-4" /> {totalTools}+ Free Tools
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            PDF &amp; Image Tools
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Convert, compress, edit, sign, OCR, summarize — everything you need for PDFs and images. 100% free, no signup.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#pdf-tools" className="bg-white text-red-600 font-semibold px-6 py-3 rounded-full hover:bg-red-50 transition shadow">
              PDF Tools
            </a>
            <a href="#image-tools" className="bg-red-800 text-white font-semibold px-6 py-3 rounded-full hover:bg-red-900 transition border border-red-500">
              Image Tools
            </a>
          </div>
        </div>
      </section>

      {/* PDF Tools */}
      <section id="pdf-tools" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-1">📄 PDF Tools</h2>
        <p className="text-gray-500 mb-10">Merge, split, convert, OCR, sign, redact and more</p>
        {pdfToolGroups.map((group) => <ToolGroup key={group.title} group={group} />)}
      </section>

      {/* Image Tools */}
      <section id="image-tools" className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">🖼️ Image Tools</h2>
          <p className="text-gray-500 mb-10">Edit, convert, compress, create memes and more</p>
          {imageToolGroups.map((group) => <ToolGroup key={group.title} group={group} />)}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'Fast Processing', desc: 'Files processed instantly on our servers' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Files deleted automatically after processing' },
            { icon: '💯', title: '100% Free', desc: 'All tools completely free, no signup needed' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
