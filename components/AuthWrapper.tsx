'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requiredRole?: string
  onAuthSuccess?: (user: User) => void
  onAuthError?: (error: string) => void
}

interface AuthState {
  isAuthenticated: boolean | null
  user: User | null
  isLoading: boolean
  error: string | null
}

export function AuthWrapper({
  children,
  fallback = <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>,
  redirectTo,
  requiredRole,
  onAuthSuccess,
  onAuthError
}: AuthWrapperProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    user: null,
    isLoading: true,
    error: null
  })

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

        // Get token from cookie
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1]

        if (!token) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
          })

          if (redirectTo) {
            router.push(`${redirectTo}?redirect=${pathname}`)
          }
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()

          // Check role if required
          if (requiredRole && userData.role !== requiredRole) {
            setAuthState({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: `Access denied. Required role: ${requiredRole}`
            })

            if (redirectTo) {
              router.push(`${redirectTo}?redirect=${pathname}&error=insufficient_permissions`)
            }
            onAuthError?.('Insufficient permissions')
            return
          }

          setAuthState({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
            error: null
          })

          onAuthSuccess?.(userData)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }))

          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: errorData.error || 'Authentication failed'
          })

          if (redirectTo) {
            router.push(`${redirectTo}?redirect=${pathname}`)
          }
          onAuthError?.(errorData.error || 'Authentication failed')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Network error'

        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: errorMessage
        })

        if (redirectTo) {
          router.push(`${redirectTo}?redirect=${pathname}`)
        }
        onAuthError?.(errorMessage)
      }
    }

    checkAuth()
  }, [router, pathname, redirectTo, requiredRole, onAuthSuccess, onAuthError])

  if (authState.isLoading) {
    return <>{fallback}</>
  }

  if (!authState.isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}

// Higher-order component version with enhanced features
export function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: User }>,
  options: {
    redirectTo?: string
    requiredRole?: string
    fallback?: React.ReactNode
    onAuthSuccess?: (user: User) => void
    onAuthError?: (error: string) => void
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const [user, setUser] = useState<User | null>(null)

    return (
      <AuthWrapper
        {...options}
        onAuthSuccess={(userData) => {
          setUser(userData)
          options.onAuthSuccess?.(userData)
        }}
      >
        {user && <Component {...props} user={user} />}
      </AuthWrapper>
    )
  }
}

// Hook version for custom auth logic
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    user: null,
    isLoading: true,
    error: null
  })

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        })
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setAuthState({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
          error: null
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: response.status === 401 ? null : 'Authentication failed'
        })
      }
    } catch {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Network error'
      })
    }
  }

  const logout = () => {
    document.cookie = 'auth-token=; path=/; max-age=0'
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    })
  }

  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1]

        if (!token) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
          })
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setAuthState({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
            error: null
          })
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: response.status === 401 ? null : 'Authentication failed'
          })
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Network error'
        })
      }
    }

    performAuthCheck()
  }, [])

  return {
    ...authState,
    checkAuth,
    logout
  }
}

// Admin-only wrapper
export function AdminWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper
      requiredRole="admin"
      redirectTo="/login"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking admin access...</p>
          </div>
        </div>
      }
    >
      {children}
    </AuthWrapper>
  )
}