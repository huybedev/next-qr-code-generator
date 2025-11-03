/**
 * UTILITY: QR Code Download
 * 
 * Hỗ trợ download QR Code với nhiều format:
 * - SVG: Vector, chất lượng cao, file nhỏ
 * - PNG: Raster, tương thích tốt
 * - PDF: In ấn chuyên nghiệp
 */

export type DownloadFormat = 'svg' | 'png' | 'pdf'

export interface DownloadOptions {
  format: DownloadFormat
  fileName: string
  scale?: number // Chỉ dùng cho PNG (1 = 300px, 2 = 600px, 3 = 900px)
}

/**
 * Download QR Code theo format được chọn
 */
export const downloadQRCode = async (
  svgElement: SVGElement,
  options: DownloadOptions
): Promise<void> => {
  const { format, fileName, scale = 3 } = options

  try {
    switch (format) {
      case 'svg':
        await downloadAsSVG(svgElement, fileName)
        break
      case 'png':
        await downloadAsPNG(svgElement, fileName, scale)
        break
      case 'pdf':
        await downloadAsPDF(svgElement, fileName)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  } catch (error) {
    console.error('Download error:', error)
    throw new Error(`Không thể tải QR code dưới dạng ${format.toUpperCase()}`)
  }
}

/**
 * Download SVG
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Serialize SVG element thành string
 * 2. Tạo Blob từ SVG string
 * 3. Tạo download link và trigger
 * 
 * ƯU ĐIỂM:
 * - Vector, scale vô hạn
 * - File nhỏ (< 5KB)
 * - Chỉnh màu dễ dàng
 */
const downloadAsSVG = async (
  svgElement: SVGElement,
  fileName: string
): Promise<void> => {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, `${fileName}.svg`)
}

/**
 * Download PNG
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Convert SVG -> Canvas
 * 2. Canvas -> PNG Blob
 * 3. Trigger download
 * 
 * ƯU ĐIỂM:
 * - Tương thích tốt nhất
 * - Hiển thị trực tiếp được
 * - Chất lượng cao với scale
 */
const downloadAsPNG = async (
  svgElement: SVGElement,
  fileName: string,
  scale: number
): Promise<void> => {
  // Get SVG dimensions
  const rect = svgElement.getBoundingClientRect()
  const width = rect.width * scale
  const height = rect.height * scale

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Cannot get canvas context')
  }

  // Fill white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // Convert SVG to Image
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert canvas to PNG blob
      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, `${fileName}.png`)
          URL.revokeObjectURL(url)
          resolve()
        } else {
          reject(new Error('Failed to create PNG blob'))
        }
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Download PDF
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Convert SVG -> Canvas (high resolution)
 * 2. Tạo PDF document với jsPDF
 * 3. Add canvas as image vào PDF
 * 4. Trigger download
 * 
 * LƯU Ý:
 * - Cần cài đặt: npm install jspdf
 * - File size lớn hơn SVG/PNG
 * - Phù hợp cho in ấn
 */
const downloadAsPDF = async (
  svgElement: SVGElement,
  fileName: string
): Promise<void> => {
  // Dynamic import jsPDF (để tránh bundle size lớn)
  const { default: jsPDF } = await import('jspdf')

  // Get SVG dimensions
  const rect = svgElement.getBoundingClientRect()
  const scale = 4 // High resolution cho PDF
  const width = rect.width * scale
  const height = rect.height * scale

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Cannot get canvas context')
  }

  // Fill white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // Convert SVG to Image
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Get canvas data URL
      const imgData = canvas.toDataURL('image/png')

      // Create PDF
      // A4 size in mm: 210 x 297
      // Tính toán size để QR code vừa trang A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // QR code size trong PDF (mm)
      const qrSize = 100 // 10cm x 10cm
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Center QR code
      const x = (pageWidth - qrSize) / 2
      const y = (pageHeight - qrSize) / 2

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize)

      // Add text (optional)
      pdf.setFontSize(10)
      pdf.text('QR Code', pageWidth / 2, y - 10, { align: 'center' })

      // Save PDF
      pdf.save(`${fileName}.pdf`)

      URL.revokeObjectURL(url)
      resolve()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Helper: Trigger download
 */
const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
