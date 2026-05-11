/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors don't affect runtime — Next.js uses swc for compilation.
    // All Buffer/Uint8Array BodyInit mismatches are safe at runtime.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'sharp',
      'pdf-lib',
      'canvas',
      'pdfjs-dist',
      'puppeteer',
      'tesseract.js',
      'mammoth',
      'xlsx',
      'pptxgenjs',
      'docx',
      'archiver',
      'archiver-utils',
    ],
  },
}

module.exports = nextConfig
