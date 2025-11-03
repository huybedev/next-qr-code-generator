'use client';

import React, { useMemo, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { Card } from '@/components/ui/card'
import { useQrTypeStore } from '@/store/qr-type.store'
import { useQRDataStore } from '@/store/qr-data.store'
import { formatQRData } from '@/lib/qr-formatter'
import { Button } from '@/components/ui/button'
import { Download, FileImage, FileCode, FileText, QrCode } from 'lucide-react'
import { downloadQRCode, type DownloadFormat } from '@/lib/qr-download'
import { QRType } from '@/enums/qr.enum';
import Image from 'next/image';
import { toast } from 'sonner';

/**
 * COMPONENT: QrGenerated
 * 
 * CHỨC NĂNG:
 * - Subscribe vào 2 Zustand stores: qrType và qrData
 * - Tự động re-render khi có thay đổi từ stores
 * - Format dữ liệu thành chuỗi QR phù hợp với từng loại
 * - Hiển thị QR Code
 * 
 * REACT 19 FEATURES:
 * 1. useMemo: Cache lại qrValue, chỉ tính lại khi qrType hoặc qrData thay đổi
 * 2. Automatic batching: React 19 tự động batch nhiều state updates
 * 3. Concurrent rendering: Component render không block UI
 * 
 * FLOW DỮ LIỆU:
 * TypeSelection thay đổi qrData -> useQRDataStore notify subscribers
 * -> QrGenerated re-render -> useMemo tính lại qrValue -> QRCode re-render
 */
function QrGenerated() {
  // Subscribe vào stores - React tự động re-render khi có thay đổi
  const { qrType } = useQrTypeStore()
  const { qrData } = useQRDataStore()

  // Ref để truy cập SVG element
  const qrRef = useRef<HTMLDivElement>(null)

  // State cho loading và format được chọn
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('png')

  /**
   * useMemo - OPTIMIZATION
   * 
   * Chỉ tính toán lại qrValue khi qrType hoặc qrData thay đổi
   * Tránh format lại không cần thiết khi component re-render vì lý do khác
   * 
   * VÍ DỤ:
   * - qrType = WIFI, qrData = { ssid: "MyWiFi", password: "123", security: "WPA" }
   * - qrValue = "WIFI:T:WPA;S:MyWiFi;P:123;H:false;;"
   */
  const qrValue = useMemo(() => {
    return formatQRData(qrType, qrData)
  }, [qrType, qrData])

  /**
   * HANDLER: Download QR Code với format được chọn
   * 
   * CÁCH HOẠT ĐỘNG:
   * 1. Lấy SVG element từ DOM
   * 2. Gọi downloadQRCode() với format (svg/png/pdf)
   * 3. Hiển thị loading state
   * 4. Download file về máy
   * 
   * FORMAT HỖ TRỢ:
   * - SVG: Vector, file nhỏ, scale vô hạn
   * - PNG: Raster, chất lượng cao (900x900px)
   * - PDF: In ấn chuyên nghiệp, A4 size
   */
  const handleDownload = async () => {
    const svg = qrRef.current?.querySelector('svg')

    if (!svg || !qrType || !qrValue) {
      return toast.error("Vui lòng nhập đầy đủ thông tin để tạo mã QR", {
        duration: 4000,

      })

    }

    try {
      setIsDownloading(true)

      const fileName = `qr-code-${qrType?.toLowerCase()}`

      await downloadQRCode(svg, {
        format: selectedFormat,
        fileName,
        scale: 3 // PNG: 300px * 3 = 900px (high quality)
      })

      console.log('Download completed successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      alert(error instanceof Error ? error.message : 'Không thể tải QR code')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="p-4 flex flex-col items-center gap-4 h-full shadow-lg">
      <h2 className="text-lg font-semibold">Mã QR được tạo</h2>

      {/* 
        QRCode Component với ref
        - value: Chuỗi đã format sẵn
        - size: Kích thước QR (pixels)
        - level: Error correction level (L, M, Q, H)
        - ref: Dùng để truy cập SVG element khi download
      */}
      <div ref={qrRef} className="border p-4 rounded-lg">
        {!qrValue ?
          <div className='size-[300px] items-center justify-center flex flex-col gap-2'>
            <QrCode className='size-20 text-muted-foreground' />
            <span className="text-muted-foreground">
              Mã QR sẽ hiển thị ở đây
            </span>
          </div>
          : qrType === QRType.BANK ?
            <Image
              src={qrValue}
              alt="QR Code"
              width={300}
              height={300}
              quality={75}
            />
            :
            <QRCode
              value={qrValue}
              size={300}
              level="H"
            />
        }
      </div>

      {/* Download Section với format selector */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Format Selector */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setSelectedFormat('svg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${selectedFormat === 'svg'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
              }`}
          >
            <FileCode className="w-4 h-4" />
            SVG
          </button>

          <button
            onClick={() => setSelectedFormat('png')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${selectedFormat === 'png'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
              }`}
          >
            <FileImage className="w-4 h-4" />
            PNG
          </button>

          <button
            onClick={() => setSelectedFormat('pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${selectedFormat === 'pdf'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
              }`}
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full gap-2"
        >
          <Download className="w-4 h-4" />
          {isDownloading
            ? 'Đang tải...'
            : `Tải mã QR (${selectedFormat.toUpperCase()})`
          }
        </Button>
      </div>
    </Card>
  )
}

export default QrGenerated