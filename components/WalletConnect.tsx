'use client'

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useRef } from 'react'
import { connectWallet, disconnectWallet } from '@/app/actions/walletActions'

export function WalletConnect({ onWalletUpdate }: { onWalletUpdate?: () => void }) {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const onWalletUpdateRef = useRef(onWalletUpdate)

  // Update the ref when onWalletUpdate changes
  useEffect(() => {
    onWalletUpdateRef.current = onWalletUpdate
  }, [onWalletUpdate])

  useEffect(() => {
    if (isConnected && address) {
      // Store wallet data in database when connected
      connectWallet({
        address,
        chainId: chainId ? Number(chainId) : undefined,
      }).then((result) => {
        if (result.success) {
          console.log('Wallet connected and stored:', result.wallet)
          onWalletUpdateRef.current?.()
        } else {
          console.error('Failed to store wallet:', result.error)
        }
      })
    } else if (!isConnected && address) {
      // Update wallet as disconnected when user disconnects
      disconnectWallet(address).then((result) => {
        if (result.success) {
          console.log('Wallet disconnected:', result.wallet)
          onWalletUpdateRef.current?.()
        } else {
          console.error('Failed to update wallet disconnect:', result.error)
        }
      })
    }
  }, [isConnected, address, chainId])

  return (
    <div className="w-full">
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">Wallet Connected</p>
            <p className="text-xs text-green-600 mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            {chainId && (
              <p className="text-xs text-green-600 mt-1">
                Chain ID: {chainId}
              </p>
            )}
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
