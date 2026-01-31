'use client'

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useEffect } from 'react'
import { connectWallet, disconnectWallet } from '@/app/actions/walletActions'

export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  useEffect(() => {
    if (isConnected && address) {
      // Store wallet data in database when connected
      connectWallet({
        address,
        chainId: chainId ? Number(chainId) : undefined,
      }).then((result) => {
        if (result.success) {
          console.log('Wallet connected and stored:', result.wallet)
        } else {
          console.error('Failed to store wallet:', result.error)
        }
      })
    } else if (!isConnected && address) {
      // Update wallet as disconnected when user disconnects
      disconnectWallet(address).then((result) => {
        if (result.success) {
          console.log('Wallet disconnected:', result.wallet)
        } else {
          console.error('Failed to update wallet disconnect:', result.error)
        }
      })
    }
  }, [isConnected, address, chainId])

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
