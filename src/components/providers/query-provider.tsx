'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

/**
 * REACT QUERY PROVIDER
 * 
 * Wrapper component để provide QueryClient cho toàn bộ app
 * Phải wrap ở root level (layout.tsx hoặc app component)
 * 
 * FEATURES:
 * - Automatic caching
 * - Background refetching
 * - Request deduplication
 * - Optimistic updates
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Tạo QueryClient với default options
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thời gian cache data (5 phút)
            staleTime: 5 * 60 * 1000,

            // Thời gian giữ data trong cache khi không dùng (10 phút)
            gcTime: 10 * 60 * 1000,

            // Retry failed requests
            retry: 1,

            // Refetch khi window focus
            refetchOnWindowFocus: false,

            // Refetch khi reconnect
            refetchOnReconnect: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
