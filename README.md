# PDF & Image Tools - Next.js Website

iLovePDF જેવી website - Next.js + pdf-lib + Sharp

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
pdf-image-tools/
├── app/
│   ├── page.tsx                    # Homepage (all tools grid)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   ├── pdf/
│   │   │   ├── merge/route.ts      # Merge PDFs
│   │   │   ├── split/route.ts      # Split PDF
│   │   │   ├── rotate/route.ts     # Rotate PDF
│   │   │   ├── protect/route.ts    # Password protect PDF
│   │   │   ├── watermark/route.ts  # Watermark PDF
│   │   │   └── jpg-to-pdf/route.ts # Images to PDF
│   │   └── image/
│   │       ├── compress/route.ts   # Compress image
│   │       ├── resize/route.ts     # Resize image
│   │       ├── convert/route.ts    # Convert format
│   │       ├── rotate/route.ts     # Rotate image
│   │       ├── crop/route.ts       # Crop image
│   │       └── watermark/route.ts  # Watermark image
│   └── tools/
│       ├── merge-pdf/page.tsx
│       ├── compress-image/page.tsx
│       ├── resize-image/page.tsx
│       └── convert-image/page.tsx
├── components/
│   ├── Navbar.tsx                  # Navigation
│   ├── Footer.tsx                  # Footer
│   ├── FileUpload.tsx              # Drag & drop uploader
│   └── ToolPage.tsx                # Reusable tool layout
└── vercel.json                     # Vercel config
```

---

## 🛠️ Tech Stack

| Tool | Use |
|------|-----|
| Next.js 14 | Framework |
| pdf-lib | PDF operations |
| Sharp | Image processing |
| Tailwind CSS | Styling |
| react-dropzone | File upload |
| Vercel | Hosting |

---

## ☁️ Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click Deploy ✅

---

## ➕ Adding New Tools

### 1. Add API Route
```ts
// app/api/pdf/your-tool/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  // ... process file
  return new NextResponse(resultBytes, {
    headers: { 'Content-Type': 'application/pdf' }
  })
}
```

### 2. Add Tool Page
```tsx
// app/tools/your-tool/page.tsx
'use client'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
// ... add your UI
```

### 3. Add to Homepage
Add tool to the `pdfTools` or `imageTools` array in `app/page.tsx`

---

## 🔒 Remove Background (AI Feature)

Remove background requires an external API:
- [Remove.bg API](https://www.remove.bg/api) - Free 50 credits/month
- Add your API key in `.env.local`:
```
REMOVE_BG_API_KEY=your_key_here
```

---

## 📝 Notes

- All files are processed server-side and never stored permanently
- Max file size: 10MB (can be increased in next.config.js)
- PDF encryption requires `node-qpdf` or `qpdf` binary on server
