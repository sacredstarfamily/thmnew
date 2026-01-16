'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  return (
    <button
      onClick={() => open()}
      className={`
        px-3 py-1.5 rounded-md text-sm font-medium transition-colors
        ${isConnected 
          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
      `}
    >
      {isConnected ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  )
}
