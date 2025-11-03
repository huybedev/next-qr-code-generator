import { useQuery } from '@tanstack/react-query'

/**
 * INTERFACE: Bank Data từ VietQR API
 */
export interface Bank {
  id: number
  name: string
  code: string
  bin: string
  shortName: string
  logo: string
  transferSupported: number
  lookupSupported: number
}

/**
 * API Response structure từ VietQR
 */
interface VietQRResponse {
  code: string
  desc: string
  data: Bank[]
}

/**
 * API SERVICE: Fetch banks từ VietQR
 * 
 * @returns Promise<Bank[]>
 */
const fetchBanks = async (): Promise<Bank[]> => {
  const response = await fetch('https://api.vietqr.io/v2/banks')

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data: VietQRResponse = await response.json()

  if (data.code !== "00" || !Array.isArray(data.data)) {
    throw new Error('Invalid API response format')
  }

  return data.data
}

/**
 * CUSTOM HOOK: useBanks
 * 
 * React Query hook để fetch và cache danh sách banks
 * 
 * FEATURES:
 * ✅ Auto-caching (5 phút)
 * ✅ Auto-refetch on stale
 * ✅ Loading states
 * ✅ Error handling
 * ✅ Request deduplication
 * 
 * USAGE:
 * ```tsx
 * const { data: banks, isLoading, error } = useBanks()
 * ```
 */
export function useBanks() {
  return useQuery({
    // Query key - unique identifier cho cache
    queryKey: ['banks'],

    // Query function - fetch data
    queryFn: fetchBanks,

    // Thời gian data được coi là fresh (1 giờ)
    staleTime: 60 * 60 * 1000,

    // Cache time khi không có component nào dùng (2 giờ)
    gcTime: 120 * 60 * 1000,

    // Retry 2 lần nếu fail
    retry: 2,

    // Refetch khi window focus (disable vì data ít thay đổi)
    refetchOnWindowFocus: false,
  })
}

/**
 * HELPER: Get bank by code
 * 
 * @param banks - Danh sách banks
 * @param code - Bank code (VD: "970422")
 * @returns Bank object hoặc undefined
 */
export function getBankByCode(banks: Bank[] | undefined, code: string): Bank | undefined {
  if (!banks) return undefined
  return banks.find(bank => bank.code === code || bank.bin === code)
}
