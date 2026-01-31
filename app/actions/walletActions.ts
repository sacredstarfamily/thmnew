'use server'

import { cookies } from 'next/headers'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  const payload = AuthService.verifyToken(token)
  if (!payload) return null

  return AuthService.getUserById(payload.id)
}

export async function connectWallet(walletData: {
  address: string
  chainId?: number
}) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    // Check if wallet is already connected to this user
    const existingWallet = await prisma.wallet.findUnique({
      where: {
        userId_address: {
          userId: currentUser.id,
          address: walletData.address.toLowerCase(),
        },
      },
    })

    if (existingWallet) {
      // Update existing wallet connection
      const updatedWallet = await prisma.wallet.update({
        where: {
          userId_address: {
            userId: currentUser.id,
            address: walletData.address.toLowerCase(),
          },
        },
        data: {
          chainId: walletData.chainId,
          isConnected: true,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        wallet: updatedWallet,
      }
    } else {
      // Create new wallet connection
      const newWallet = await prisma.wallet.create({
        data: {
          userId: currentUser.id,
          address: walletData.address.toLowerCase(),
          chainId: walletData.chainId,
          isConnected: true,
        },
      })

      return {
        success: true,
        wallet: newWallet,
      }
    }
  } catch (error) {
    console.error('Error connecting wallet:', error)
    return {
      success: false,
      error: 'Failed to connect wallet',
    }
  }
}

export async function disconnectWallet(address: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    const updatedWallet = await prisma.wallet.update({
      where: {
        userId_address: {
          userId: currentUser.id,
          address: address.toLowerCase(),
        },
      },
      data: {
        isConnected: false,
        updatedAt: new Date(),
      },
    })

    return {
      success: true,
      wallet: updatedWallet,
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
    return {
      success: false,
      error: 'Failed to disconnect wallet',
    }
  }
}

export async function getUserWallets() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        connectedAt: 'desc',
      },
    })

    return {
      success: true,
      wallets,
    }
  } catch (error) {
    console.error('Error fetching user wallets:', error)
    return {
      success: false,
      error: 'Failed to fetch wallets',
    }
  }
}