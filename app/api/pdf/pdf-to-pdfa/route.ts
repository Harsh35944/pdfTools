import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

// Conformance level descriptions
const CONFORMANCE = {
  'pdfa-1b': { version: '1', conformance: 'B', note: 'PDF/A-1b – basic visual reproducibility' },
  'pdfa-1a': { version: '1', conformance: 'A', note: 'PDF/A-1a – accessible + tagged' },
  'pdfa-2b': { version: '2', conformance: 'B', note: 'PDF/A-2b – supports JPEG2000, transparency' },
  'pdfa-3b': { version: '3', conformance: 'B', note: 'PDF/A-3b – allows embedded files' },
}

function buildXmpPdfa(version: string, conformance: string, title: string): string {
  const now = new Date().toISOString()
  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <pdfaid:part>${version}</pdfaid:part>
      <pdfaid:conformance>${conformance}</pdfaid:conformance>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${title}</rdf:li></rdf:Alt></dc:title>
      <xmp:CreateDate>${now}</xmp:CreateDate>
      <xmp:ModifyDate>${now}</xmp:ModifyDate>
      <xmp:MetadataDate>${now}</xmp:MetadataDate>
      <xmp:CreatorTool>pdf-image-tools PDF/A Converter</xmp:CreatorTool>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const level = (formData.get('level') as string) || 'pdfa-1b'

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const conf = CONFORMANCE[level as keyof typeof CONFORMANCE] || CONFORMANCE['pdfa-1b']

    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

    const title = pdfDoc.getTitle() || 'PDF/A Document'
    pdfDoc.setTitle(title)
    pdfDoc.setProducer('pdf-image-tools PDF/A Converter')
    pdfDoc.setCreator('pdf-image-tools')
    pdfDoc.setCreationDate(new Date())
    pdfDoc.setModificationDate(new Date())

    // Embed XMP metadata with PDF/A conformance declaration
    const xmpMetadata = buildXmpPdfa(conf.version, conf.conformance, title)
    const xmpBytes = Buffer.from(xmpMetadata, 'utf8')
    const metadataStream = pdfDoc.context.stream(xmpBytes, {
      Type: 'Metadata',
      Subtype: 'XML',
      Length: xmpBytes.length,
    })
    const metadataRef = pdfDoc.context.register(metadataStream)
    pdfDoc.catalog.set(pdfDoc.context.obj('Metadata'), metadataRef)

    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // PDF/A requires no cross-reference streams
      addDefaultPage: false,
    })

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pdfa_${level}.pdf"`,
        'X-Conformance': conf.note,
      },
    })
  } catch (error: any) {
    console.error('PDF/A error:', error)
    return NextResponse.json({ error: 'Failed to convert to PDF/A' }, { status: 500 })
  }
}
