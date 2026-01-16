'use client'

import React, { type ReactNode } from 'react'
import { WagmiProvider, type Config } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter } from '@/lib/wagmiConfig'

const queryClient = new QueryClient()

export function WalletProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
