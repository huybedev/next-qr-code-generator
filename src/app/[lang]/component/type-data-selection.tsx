'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QR_TYPES_DATA, QR_TYPE_FIELDS } from '@/constants/qr-types.constant'
import { getFieldLabel, getFieldPlaceholder } from '@/lib/qr-formatter'
import { cn } from '@/lib/utils'
import { useQRDataStore } from '@/store/qr-data.store'
import { useQrTypeStore } from '@/store/qr-type.store'
import { BankSelect } from './bank-select'

type Dict = {
  qr: { selectType: string };
  qrTypes: Record<string, string>;
  fields: Record<string, string>;
  [key: string]: any;
}

/**
 * COMPONENT: TypeSelection
 * 
 * CHỨC NĂNG:
 * 1. Hiển thị các nút chọn loại QR (Text, URL, WiFi...)
 * 2. Render dynamic form inputs dựa trên loại QR được chọn
 * 3. Cập nhật dữ liệu vào Zustand store khi user nhập liệu (với debounce 350ms)
 * 4. Fetch banks data từ VietQR API với React Query (auto-caching)
 * 
 * FLOW DỮ LIỆU:
 * User chọn loại QR -> setQrType() & resetData()
 * -> Component re-render với form inputs tương ứng
 * -> User nhập liệu -> update LOCAL state (instant)
 * -> Sau 350ms -> setField() cập nhật vào store (debounced)
 * -> QrGenerated component tự động nhận được data mới và re-render QR
 * 
 * OPTIMIZATION:
 * ✅ Debounce 350ms để tránh re-render QR quá nhiều
 * ✅ Local state cho input để typing mượt mà
 * ✅ Select không debounce vì user chọn 1 lần
 */
function TypeSelection({ dict }: { dict: Dict }) {
  // Lấy state và actions từ stores
  const { setQrType, qrType } = useQrTypeStore()
  const { qrData, setField, resetData } = useQRDataStore()

  /**
   * LOCAL STATE: Lưu giá trị input tạm thời (instant update)
   * - Key: field name
   * - Value: user input
   * - Sync với qrData từ store
   */
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({})

  /**
   * SYNC: Khi qrType thay đổi, sync localInputs với qrData từ store
   * - Reset local state khi đổi type
   * - Load data từ store nếu có (ví dụ: user quay lại type cũ)
   */
  useEffect(() => {
    setLocalInputs(qrData)
  }, [qrType, qrData])

  /**
   * DEBOUNCE EFFECT: Tự động lưu vào store sau 350ms khi user ngừng nhập
   * - Chỉ chạy khi localInputs thay đổi
   * - Clear timeout nếu user tiếp tục nhập (debounce)
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Chỉ update những field có thay đổi
      Object.entries(localInputs).forEach(([fieldName, value]) => {
        if (qrData[fieldName] !== value) {
          setField(fieldName, value)
        }
      })
    }, 350)

    // Cleanup: Clear timeout khi component unmount hoặc localInputs thay đổi
    return () => clearTimeout(timeoutId)
  }, [localInputs]) // Chỉ depend vào localInputs, không depend vào qrData để tránh loop

  /**
   * HANDLER: Xử lý khi user chọn loại QR
   */
  const handleTypeChange = (type: typeof qrType) => {
    if (type) {
      setQrType(type)
      resetData() // Xóa dữ liệu cũ khi đổi type
      setLocalInputs({}) // Reset local state
    }
  }

  /**
   * HANDLER: Xử lý khi user nhập liệu vào INPUT
   * - Cập nhật LOCAL state ngay lập tức (no lag)
   * - useEffect sẽ tự động debounce và lưu vào store
   */
  const handleInputChange = useCallback((fieldName: string, value: string) => {
    setLocalInputs(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }, [])

  /**
   * HANDLER: Xử lý khi user chọn SELECT
   * - Không debounce vì user chỉ chọn 1 lần
   * - Update trực tiếp vào store
   */
  const handleSelectChange = useCallback((fieldName: string, value: string) => {
    setField(fieldName, value)
    setLocalInputs(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }, [setField])

  // Lấy danh sách fields cần hiển thị dựa vào qrType hiện tại
  const currentFields = qrType ? (QR_TYPE_FIELDS[qrType as keyof typeof QR_TYPE_FIELDS] || []) : []

  return (
    <Card className='p-4 h-full shadow-lg'>
      <span className='font-medium text-lg block mb-4'>
        {dict.qr.selectType}
      </span>

      {/* SECTION 1: Buttons chọn loại QR */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {QR_TYPES_DATA.map((item, idx) => {
          const Logo = item.icon;
          const typeKey = item.type.toLowerCase();
          return (
            <Button
              key={idx}
              className={cn(
                'flex flex-col h-auto w-24 items-center justify-center transition-all',
              )}
              variant={qrType === item.type ? 'default' : 'outline'}
              onClick={() => handleTypeChange(item.type)}
            >
              <Logo className='size-10' />
              {dict.qrTypes[typeKey] || item.label}
            </Button>
          )
        })}
      </div>

      {/* SECTION 2: Dynamic form inputs dựa trên loại QR được chọn */}
      {qrType && currentFields.length > 0 && (
        <div className="grid w-full max-w-md gap-4">
          {currentFields.map((field: any, index: number) => (
            <div key={index} className="grid items-center gap-2">
              <Label htmlFor={field.name}>
                {dict.fields[field.labelKey] || getFieldLabel(field.labelKey)}
                {field?.required && (<span className="text-red-500 ml-1">*</span>)}
              </Label>

              {/* Render Input hoặc Select dựa vào field.type */}
              {field.type === 'select' && field.options ? (
                // Check if options is dynamic (from API)
                field.options === 'dynamic-banks' ? (
                  // Render Bank Select với data từ API (MEMOIZED COMPONENT)
                  <BankSelect
                    value={localInputs[field.name] || qrData[field.name] || ''}
                    onChange={handleSelectChange}
                    fieldName={field.name}
                    dict={dict}
                  />
                ) : (
                  // Render Select static (WiFi security...)
                  <Select
                    value={localInputs[field.name] || qrData[field.name] || field.options[0]}
                    onValueChange={(value) => handleSelectChange(field.name, value)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : (
                // Render Input cho text, url, password...
                <Input
                  type={field.type}
                  id={field.name}
                  placeholder={dict.fields[field.placeholderKey] || getFieldPlaceholder(field.placeholderKey || '')}
                  value={localInputs[field.name] ?? qrData[field.name] ?? ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default TypeSelection