'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

export function WalletConnect() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  return (
    <div className="w-full">
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">Wallet Connected</p>
            <p className="text-xs text-green-600 mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => open()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Manage Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={() => open()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}
