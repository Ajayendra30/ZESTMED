import fs from 'fs';
import path from 'path';

const imageFiles = [
  {
    title: '1. Home Page (Top Portion)',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492684625_efcbf3b1.jpg'
  },
  {
    title: '2. Home Page (Complete & Bottom Portion)',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492692067_6506ae6f.jpg'
  },
  {
    title: '3. Medicines Mega Menu',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492699264_0b632bdd.jpg'
  },
  {
    title: '4. Medicines Store Page',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492709967_236331d7.jpg'
  },
  {
    title: '5. Lab Tests & Diagnostics Page',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492717540_12bac414.jpg'
  },
  {
    title: '6. Health Packages Page',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492763950_bc9c70c3.jpg'
  },
  {
    title: '7. About Us Page',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492774272_38aa8d5c.jpg'
  },
  {
    title: '8. Contact Us Page',
    path: 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/.user_uploaded/media_1794492782215_0afcbb12.jpg'
  }
];

function getJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xFF) {
      offset++;
      continue;
    }
    const marker = buffer[offset + 1];
    // SOF markers: 0xC0 .. 0xCF except 0xC4, 0xC8, 0xCC
    if (
      (marker >= 0xC0 && marker <= 0xCF) &&
      marker !== 0xC4 &&
      marker !== 0xC8 &&
      marker !== 0xCC
    ) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      const components = buffer.readUInt8(offset + 9);
      return { width, height, components };
    }
    const length = buffer.readUInt16BE(offset + 2);
    offset += 2 + length;
  }
  throw new Error('SOF marker not found');
}

class PDFBuilder {
  constructor() {
    this.chunks = [];
    this.offsets = {};
    this.currentOffset = 0;
    this.objCount = 0;
  }

  writeString(str) {
    const buf = Buffer.from(str, 'latin1');
    this.chunks.push(buf);
    this.currentOffset += buf.length;
  }

  writeBuffer(buf) {
    this.chunks.push(buf);
    this.currentOffset += buf.length;
  }

  newObject() {
    this.objCount++;
    this.offsets[this.objCount] = this.currentOffset;
    this.writeString(`${this.objCount} 0 obj\n`);
    return this.objCount;
  }

  endObject() {
    this.writeString('endobj\n');
  }

  build(pagesData) {
    // PDF header
    this.writeString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    // Obj 1: Catalog
    const catalogObj = this.newObject();
    this.writeString('<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\n');
    this.endObject();

    // Obj 2: Pages (forward referenced)
    const pagesObj = this.newObject(); // Will fill later
    // We will allocate objects in predictable fashion:
    // For each page:
    // pageObj, contentObj, imageObj
    const totalPages = pagesData.length;
    const pageObjIds = [];
    let currentId = 2; // after pagesObj

    for (let i = 0; i < totalPages; i++) {
      currentId++;
      const pId = currentId; // page
      currentId++;
      const cId = currentId; // content
      currentId++;
      const imgId = currentId; // image
      pageObjIds.push({ pageId: pId, contentId: cId, imageId: imgId });
    }

    // Now write Obj 2 content
    this.writeString('<<\n  /Type /Pages\n  /Kids [ ');
    for (const p of pageObjIds) {
      this.writeString(`${p.pageId} 0 R `);
    }
    this.writeString(`]\n  /Count ${totalPages}\n>>\n`);
    this.endObject();

    // Now write each page, content, and image
    for (let i = 0; i < totalPages; i++) {
      const data = pagesData[i];
      const { pageId, contentId, imageId } = pageObjIds[i];

      // Page Object
      this.newObject(); // should match pageId
      this.writeString(
        `<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [ 0 0 ${data.width} ${data.height} ]\n  /Resources <<\n    /XObject <<\n      /Im1 ${imageId} 0 R\n    >>\n  >>\n  /Contents ${contentId} 0 R\n>>\n`
      );
      this.endObject();

      // Content Stream Object
      const contentStream = `q\n${data.width} 0 0 ${data.height} 0 0 cm\n/Im1 Do\nQ\n`;
      const contentBuf = Buffer.from(contentStream, 'latin1');
      this.newObject(); // should match contentId
      this.writeString(`<<\n  /Length ${contentBuf.length}\n>>\nstream\n`);
      this.writeBuffer(contentBuf);
      this.writeString('\nendstream\n');
      this.endObject();

      // Image XObject with raw unmodified JPEG stream (lossless DCTDecode)
      this.newObject(); // should match imageId
      this.writeString(
        `<<\n  /Type /XObject\n  /Subtype /Image\n  /Width ${data.width}\n  /Height ${data.height}\n  /ColorSpace /DeviceRGB\n  /BitsPerComponent 8\n  /Filter /DCTDecode\n  /Length ${data.buffer.length}\n>>\nstream\n`
      );
      this.writeBuffer(data.buffer);
      this.writeString('\nendstream\n');
      this.endObject();
    }

    // Cross-Reference Table
    const startXref = this.currentOffset;
    this.writeString(`xref\n0 ${this.objCount + 1}\n`);
    this.writeString('0000000000 65535 f \n');
    for (let i = 1; i <= this.objCount; i++) {
      const off = this.offsets[i].toString().padStart(10, '0');
      this.writeString(`${off} 00000 n \n`);
    }

    // Trailer
    this.writeString(
      `trailer\n<<\n  /Size ${this.objCount + 1}\n  /Root 1 0 R\n>>\nstartxref\n${startXref}\n%%EOF\n`
    );

    return Buffer.concat(this.chunks);
  }
}

console.log('Reading 8 reference images...');
const pagesData = [];

for (const img of imageFiles) {
  if (!fs.existsSync(img.path)) {
    throw new Error(`File not found: ${img.path}`);
  }
  const buf = fs.readFileSync(img.path);
  const dims = getJpegDimensions(buf);
  console.log(`Loaded: ${img.title} (${dims.width}x${dims.height}, ${Math.round(buf.length / 1024)} KB)`);
  pagesData.push({
    title: img.title,
    width: dims.width,
    height: dims.height,
    buffer: buf
  });
}

console.log('Generating PDF with 100% original lossless resolution...');
const builder = new PDFBuilder();
const pdfBuffer = builder.build(pagesData);

const outWorkspace = 'C:/Users/ajaye/PROJECT_/ZESTMED/ZESTMED_Reference_Designs.pdf';
const outArtifact = 'C:/Users/ajaye/.gemini/antigravity/brain/ba8a0381-a40f-4bc8-8e8f-b38f44f89c8d/ZESTMED_Reference_Designs.pdf';

fs.writeFileSync(outWorkspace, pdfBuffer);
fs.writeFileSync(outArtifact, pdfBuffer);

console.log(`Success! PDF created:`);
console.log(`- Workspace: ${outWorkspace}`);
console.log(`- Artifact: ${outArtifact}`);
console.log(`- Total size: ${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB (${pagesData.length} pages)`);
