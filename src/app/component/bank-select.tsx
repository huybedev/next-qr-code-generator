import { memo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBanks, type Bank } from '@/hooks/use-banks'

/**
 * COMPONENT: BankSelect (Memoized)
 * 
 * OPTIMIZATION:
 * ✅ Tách riêng thành component để React.memo có thể skip re-render
 * ✅ Chỉ re-render khi value hoặc banks data thay đổi
 * ✅ Không re-render khi user gõ vào các input khác
 * 
 * PROPS:
 * - value: BIN code của bank được chọn
 * - onChange: Callback khi user chọn bank
 * - fieldName: Tên field (để truyền vào onChange)
 */
interface BankSelectProps {
  value: string
  onChange: (fieldName: string, value: string) => void
  fieldName: string
}

function BankSelectComponent({ value, onChange, fieldName }: BankSelectProps) {
  const { data: banks = [], isLoading: isBanksLoading } = useBanks()

  console.log('🏦 BankSelect re-render') // Debug: check re-render count

  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange(fieldName, newValue)}
      disabled={isBanksLoading}
    >
      <SelectTrigger id={fieldName}>
        <SelectValue placeholder={
          isBanksLoading
            ? "Đang tải danh sách ngân hàng..."
            : "Chọn ngân hàng"
        } />
      </SelectTrigger>
      <SelectContent>
        {banks.map((bank: Bank) => (
          <SelectItem key={bank.id} value={bank.bin}>
            <div className="flex items-center gap-2">
              {/* Hiển thị logo ngân hàng */}
              {bank.logo && (
                <img
                  src={bank.logo}
                  alt={bank.shortName}
                  className="w-5 h-5 object-contain"
                />
              )}
              <span>{bank.shortName} - {bank.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * MEMOIZATION:
 * React.memo() sẽ skip re-render nếu props không thay đổi
 * - value thay đổi → re-render (cần thiết)
 * - onChange reference ổn định (useCallback) → không re-render
 * - fieldName không đổi → không re-render
 */
export const BankSelect = memo(BankSelectComponent)
