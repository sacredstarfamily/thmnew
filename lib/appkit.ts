import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon } from '@reown/appkit/networks'

// Get project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'your-project-id-here'

// Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum, polygon],
  projectId,
})

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, polygon],
  projectId,
  features: {
    analytics: true, // Optional: Enable analytics
  },
  themeMode: 'light', // or 'dark'
})
