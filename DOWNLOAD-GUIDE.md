# 📥 QR CODE DOWNLOAD - HƯỚNG DẪN SỬ DỤNG

## 🎯 Tính năng

Hệ thống download QR Code hỗ trợ **3 format**:

### 1. **SVG** (Vector) 📐
```
✅ Chất lượng: Vô hạn (vector)
✅ File size: Nhỏ nhất (~5KB)
✅ Use case: Design, web, print
✅ Edit: Dễ dàng (Figma, Illustrator...)
```

### 2. **PNG** (Raster) 🖼️
```
✅ Chất lượng: Cao (900x900px)
✅ File size: Trung bình (~50KB)
✅ Use case: Social media, presentations
✅ Compatibility: Tốt nhất
```

### 3. **PDF** (Document) 📄
```
✅ Chất lượng: Cao (A4, centered)
✅ File size: Lớn nhất (~100KB)
✅ Use case: In ấn chuyên nghiệp
✅ Format: A4 portrait, QR 10x10cm
```

---

## 🔄 FLOW DOWNLOAD

```
User chọn format (SVG/PNG/PDF)
         ↓
Click "Tải mã QR"
         ↓
handleDownload() được gọi
         ↓
Lấy SVG element từ qrRef
         ↓
downloadQRCode(svg, { format, fileName, scale })
         ↓
┌─────────────┬─────────────┬─────────────┐
│    SVG      │     PNG     │     PDF     │
├─────────────┼─────────────┼─────────────┤
│ Serialize   │ SVG→Canvas  │ SVG→Canvas  │
│ → Blob      │ → PNG Blob  │ → jsPDF     │
│ → Download  │ → Download  │ → Download  │
└─────────────┴─────────────┴─────────────┘
         ↓
File tự động download về máy!
```

---

## 📁 CẤU TRÚC FILE

### `/src/lib/qr-download.ts`

**Export:**
```typescript
export type DownloadFormat = 'svg' | 'png' | 'pdf'

export interface DownloadOptions {
  format: DownloadFormat
  fileName: string
  scale?: number // PNG only (1-5)
}

export const downloadQRCode = async (
  svgElement: SVGElement,
  options: DownloadOptions
): Promise<void>
```

**Functions:**
- `downloadAsSVG()`: Direct SVG download
- `downloadAsPNG()`: SVG → Canvas → PNG
- `downloadAsPDF()`: SVG → Canvas → jsPDF → PDF
- `triggerDownload()`: Helper để trigger download

---

## 💻 CÁCH SỬ DỤNG TRONG COMPONENT

### 1. Import
```typescript
import { downloadQRCode, type DownloadFormat } from '@/lib/qr-download'
```

### 2. State Management
```typescript
const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('png')
const [isDownloading, setIsDownloading] = useState(false)
const qrRef = useRef<HTMLDivElement>(null)
```

### 3. Handler Function
```typescript
const handleDownload = async () => {
  const svg = qrRef.current?.querySelector('svg')
  if (!svg) return

  try {
    setIsDownloading(true)
    
    await downloadQRCode(svg, {
      format: selectedFormat,
      fileName: `qr-code-${Date.now()}`,
      scale: 3 // PNG: 300px * 3 = 900px
    })
  } catch (error) {
    alert('Download failed!')
  } finally {
    setIsDownloading(false)
  }
}
```

### 4. UI Components
```tsx
{/* Format Selector */}
<div className="flex gap-2">
  <button onClick={() => setSelectedFormat('svg')}>SVG</button>
  <button onClick={() => setSelectedFormat('png')}>PNG</button>
  <button onClick={() => setSelectedFormat('pdf')}>PDF</button>
</div>

{/* Download Button */}
<Button onClick={handleDownload} disabled={isDownloading}>
  {isDownloading ? 'Đang tải...' : 'Tải mã QR'}
</Button>
```

---

## 🔧 CHI TIẾT TECHNICAL

### SVG Download

```typescript
const downloadAsSVG = async (svgElement, fileName) => {
  // 1. Serialize SVG element
  const svgData = new XMLSerializer().serializeToString(svgElement)
  
  // 2. Tạo Blob
  const blob = new Blob([svgData], { 
    type: 'image/svg+xml;charset=utf-8' 
  })
  
  // 3. Trigger download
  triggerDownload(blob, `${fileName}.svg`)
}
```

**Ưu điểm:**
- ✅ Đơn giản nhất
- ✅ Không cần thư viện external
- ✅ File size nhỏ
- ✅ Scalable vô hạn

**Nhược điểm:**
- ❌ Một số app không hỗ trợ SVG
- ❌ Preview khó hơn PNG

---

### PNG Download

```typescript
const downloadAsPNG = async (svgElement, fileName, scale) => {
  // 1. Tạo canvas
  const canvas = document.createElement('canvas')
  canvas.width = rect.width * scale  // 300 * 3 = 900px
  canvas.height = rect.height * scale
  
  // 2. Fill white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  
  // 3. Convert SVG → Image
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  
  // 4. Draw image lên canvas
  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height)
    
    // 5. Canvas → PNG Blob
    canvas.toBlob((blob) => {
      triggerDownload(blob, `${fileName}.png`)
    }, 'image/png')
  }
  
  img.src = url
}
```

**Ưu điểm:**
- ✅ Universal compatibility
- ✅ Chất lượng cao với scale
- ✅ Preview dễ dàng
- ✅ Social media friendly

**Nhược điểm:**
- ❌ File size lớn hơn SVG
- ❌ Không edit được
- ❌ Phức tạp hơn SVG

**Scale Options:**
```
scale = 1 → 300x300px  (~20KB)  - Mobile
scale = 2 → 600x600px  (~40KB)  - Web
scale = 3 → 900x900px  (~60KB)  - Print (recommended)
scale = 4 → 1200x1200px (~80KB) - High-res print
```

---

### PDF Download

```typescript
const downloadAsPDF = async (svgElement, fileName) => {
  // 1. Dynamic import jsPDF
  const { default: jsPDF } = await import('jspdf')
  
  // 2. Convert SVG → Canvas (high res)
  const scale = 4  // 1200x1200px
  const canvas = await svgToCanvas(svgElement, scale)
  
  // 3. Canvas → Data URL
  const imgData = canvas.toDataURL('image/png')
  
  // 4. Tạo PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'  // 210 x 297 mm
  })
  
  // 5. Center QR code trên A4
  const qrSize = 100  // 10cm x 10cm
  const x = (pageWidth - qrSize) / 2
  const y = (pageHeight - qrSize) / 2
  
  // 6. Add image + text
  pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize)
  pdf.text('QR Code', pageWidth / 2, y - 10, { align: 'center' })
  
  // 7. Save PDF
  pdf.save(`${fileName}.pdf`)
}
```

**Ưu điểm:**
- ✅ Chuyên nghiệp cho in ấn
- ✅ Chuẩn A4
- ✅ Centered, có text
- ✅ Multiple pages support

**Nhược điểm:**
- ❌ File size lớn nhất
- ❌ Cần dependency (jsPDF ~200KB)
- ❌ Slower (async import)

**PDF Settings:**
```
Page: A4 portrait (210 x 297 mm)
QR Size: 100 x 100 mm (10cm)
Position: Centered
Quality: High (scale 4)
Format: PNG embedded
```

---

## ⚡ PERFORMANCE

### Bundle Size
```
qr-download.ts: ~5KB (code only)
jsPDF: ~200KB (lazy loaded)

Total impact:
- SVG/PNG: +5KB
- PDF: +205KB (first time only)
```

### Download Speed
```
SVG:  ~100ms  (instant)
PNG:  ~500ms  (canvas rendering)
PDF:  ~1-2s   (jsPDF processing)
```

### Memory Usage
```
SVG:  Minimal
PNG:  Canvas allocation (~3MB)
PDF:  Canvas + jsPDF (~5MB)
```

---

## 🐛 ERROR HANDLING

### Common Errors

**1. SVG not found**
```typescript
if (!svg) {
  alert('Không tìm thấy mã QR. Vui lòng thử lại.')
  return
}
```

**2. Canvas context failed**
```typescript
if (!ctx) {
  throw new Error('Cannot get canvas context')
}
```

**3. Image load failed**
```typescript
img.onerror = () => {
  reject(new Error('Failed to load SVG image'))
}
```

**4. jsPDF import failed**
```typescript
try {
  const { default: jsPDF } = await import('jspdf')
} catch (error) {
  throw new Error('Cannot load PDF library')
}
```

---

## 🎨 CUSTOMIZATION

### Thay đổi Scale cho PNG
```typescript
await downloadQRCode(svg, {
  format: 'png',
  fileName: 'my-qr',
  scale: 5  // 1500x1500px (very high quality)
})
```

### Thay đổi PDF Size
```typescript
// In file qr-download.ts, line ~170
const qrSize = 150  // 15cm instead of 10cm
```

### Thêm Text vào PDF
```typescript
pdf.text('My Company Name', pageWidth / 2, y - 20, { align: 'center' })
pdf.text('Scan to visit website', pageWidth / 2, y + qrSize + 15, { align: 'center' })
```

### Background Color
```typescript
// PNG với background màu
ctx.fillStyle = '#f0f0f0'  // Light gray
ctx.fillRect(0, 0, width, height)
```

---

## ✅ BEST PRACTICES

### 1. Format Selection
```
📱 Social media → PNG (scale 2-3)
🖨️ Printing → PDF
🎨 Design work → SVG
📊 Presentations → PNG (scale 3)
```

### 2. Error Handling
```typescript
try {
  await downloadQRCode(svg, options)
} catch (error) {
  // Log to analytics
  console.error('Download failed:', error)
  
  // User feedback
  toast.error('Không thể tải QR code')
}
```

### 3. Loading State
```typescript
const [isDownloading, setIsDownloading] = useState(false)

// Disable button while downloading
<Button disabled={isDownloading}>
  {isDownloading ? 'Đang tải...' : 'Tải mã QR'}
</Button>
```

### 4. File Naming
```typescript
// Good: Descriptive + timestamp
const fileName = `qr-${qrType}-${Date.now()}`
// → qr-wifi-1699012345678.png

// Bad: Generic
const fileName = 'qr-code'  // Overwrite previous downloads
```

---

## 🚀 MỞ RỘNG

### Thêm Format mới (JPEG)

```typescript
// 1. Update type
export type DownloadFormat = 'svg' | 'png' | 'pdf' | 'jpeg'

// 2. Add handler
const downloadAsJPEG = async (svgElement, fileName, scale) => {
  const canvas = await svgToCanvas(svgElement, scale)
  
  canvas.toBlob((blob) => {
    triggerDownload(blob, `${fileName}.jpeg`)
  }, 'image/jpeg', 0.9)  // Quality: 0.9
}

// 3. Update switch
case 'jpeg':
  await downloadAsJPEG(svgElement, fileName, scale)
  break
```

### Batch Download (Multi-format)

```typescript
const downloadAll = async () => {
  const formats: DownloadFormat[] = ['svg', 'png', 'pdf']
  
  for (const format of formats) {
    await downloadQRCode(svg, { format, fileName })
    await delay(500)  // Prevent browser blocking
  }
}
```

---

## 📊 TESTING

### Manual Testing Checklist
```
✅ SVG download works
✅ PNG download works (check size ~900x900)
✅ PDF download works (check centered on A4)
✅ Loading state shows correctly
✅ Error handling works
✅ File naming is correct
✅ Multiple downloads work
✅ Cancel works (close before complete)
```

### Browser Compatibility
```
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
❌ IE11 (not supported)
```

---

## 🎓 KẾT LUẬN

Download QR Code system với **3 format** cho phép:

- ✅ **Linh hoạt**: User chọn format phù hợp
- ✅ **Chất lượng cao**: PNG 900x900, PDF A4
- ✅ **Professional**: PDF centered, có text
- ✅ **Optimized**: Lazy load jsPDF, memory safe
- ✅ **Type-safe**: Full TypeScript support

**Recommended usage:**
- 📱 Social media: PNG (scale 2)
- 🖨️ Print: PDF
- 🎨 Design: SVG

Happy downloading! 🚀
