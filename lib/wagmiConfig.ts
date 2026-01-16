import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { mainnet, sepolia } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_PROJECT_ID is not defined. Wallet connection may not work.')
}

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, sepolia],
  ssr: true
})
export const solanaAdapter = new SolanaAdapter({})

const metadata = {
  name: 'themiracle.love',
  description: 'themiracle.love dApp',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://themiracle.love',
  icons: ['https://www.w3.org/favicon.ico']
}

export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  projectId,
  metadata,
  themeMode: 'light',
  networks: [mainnet, sepolia]
})
