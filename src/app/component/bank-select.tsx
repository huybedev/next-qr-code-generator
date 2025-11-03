import { memo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useBanks, type Bank } from '@/hooks/use-banks'

/**
 * COMPONENT: BankCombobox (Memoized)
 * 
 * FEATURES:
 * ✅ Search theo code, shortName, name
 * ✅ Virtualization tự động với CommandList
 * ✅ Hiển thị logo ngân hàng
 * ✅ Memoized để tránh re-render không cần thiết
 * 
 * OPTIMIZATION:
 * ✅ Chỉ re-render khi value hoặc banks data thay đổi
 * ✅ Không re-render khi user gõ vào các input khác
 * ✅ Command component tự động filter và virtualize
 */
interface BankSelectProps {
  value: string
  onChange: (fieldName: string, value: string) => void
  fieldName: string
}

function BankComboboxComponent({ value, onChange, fieldName }: BankSelectProps) {
  const { data: banks = [], isLoading: isBanksLoading } = useBanks()
  const [open, setOpen] = useState(false)

  // Tìm bank được chọn
  const selectedBank = banks.find((bank) => bank.bin === value)

  console.log('🏦 BankCombobox re-render') // Debug: check re-render count

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isBanksLoading}
        >
          {isBanksLoading ? (
            "Đang tải danh sách ngân hàng..."
          ) : selectedBank ? (
            <div className="flex items-center gap-2">
              {selectedBank.logo && (
                <img
                  src={selectedBank.logo}
                  alt={selectedBank.shortName}
                  className="w-5 h-5 object-contain"
                />
              )}
              <span className="truncate">{selectedBank.shortName} - {selectedBank.name}</span>
            </div>
          ) : (
            "Chọn ngân hàng..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(value: string, search: string) => {
            // Custom filter: search theo code, shortName, name
            const bank = banks.find(b => b.bin === value || b.id.toString() === value)
            if (!bank) return 0

            const searchLower = search.toLowerCase()
            const matchCode = bank.code?.toLowerCase().includes(searchLower)
            const matchShortName = bank.shortName?.toLowerCase().includes(searchLower)
            const matchName = bank.name?.toLowerCase().includes(searchLower)
            const matchBin = bank.bin?.toLowerCase().includes(searchLower)

            return (matchCode || matchShortName || matchName || matchBin) ? 1 : 0
          }}
        >
          <CommandInput
            placeholder="Tìm ngân hàng (tên, mã, shortName)..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
            <CommandGroup>
              {banks.map((bank: Bank) => (
                <CommandItem
                  key={bank.id}
                  value={bank.bin}
                  onSelect={(currentValue: string) => {
                    onChange(fieldName, currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {bank.logo && (
                      <img
                        src={bank.logo}
                        alt={bank.shortName}
                        className="w-5 h-5 object-contain shrink-0"
                      />
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">
                        {bank.shortName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {bank.name} • {bank.code}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      value === bank.bin ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * MEMOIZATION:
 * React.memo() sẽ skip re-render nếu props không thay đổi
 */
export const BankSelect = memo(BankComboboxComponent)
