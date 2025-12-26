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

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !AuthService.isAdmin(currentUser)) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Prevent removing last admin
    if (role === 'user') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      })

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (adminCount === 1 && targetUser?.role === 'admin') {
        return {
          success: false,
          error: 'Cannot remove the last admin',
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    }
  }
}

export async function updateUserDetails(
  userId: string,
  data: { name?: string; email?: string }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !AuthService.isAdmin(currentUser)) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Check if email is already taken
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          NOT: { id: userId },
        },
      })

      if (existingUser) {
        return {
          success: false,
          error: 'Email already in use',
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email.toLowerCase() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    })

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error('Failed to update user details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user details',
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !AuthService.isAdmin(currentUser)) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Prevent self-deletion
    if (currentUser.id === userId) {
      return {
        success: false,
        error: 'Cannot delete your own account',
      }
    }

    // Prevent deleting last admin
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (userToDelete?.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      })

      if (adminCount === 1) {
        return {
          success: false,
          error: 'Cannot delete the last admin',
        }
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    }
  }
}
