'use client'

import { useState } from 'react'
import { updateUserRole, updateUserDetails, deleteUser } from '@/app/actions/adminActions'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
}

interface EditUserModalProps {
  user: User
  onClose: () => void
  onUpdate: () => void
}

export function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Update user details
      const detailsResult = await updateUserDetails(user.id, {
        name: name || undefined,
        email,
      })

      if (!detailsResult.success) {
        setError(detailsResult.error || 'Failed to update user details')
        setLoading(false)
        return
      }

      // Update role if changed
      if (role !== user.role) {
        const roleResult = await updateUserRole(user.id, role as 'user' | 'admin')
        
        if (!roleResult.success) {
          setError(roleResult.error || 'Failed to update user role')
          setLoading(false)
          return
        }
      }

      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await deleteUser(user.id)

    if (!result.success) {
      setError(result.error || 'Failed to delete user')
      setLoading(false)
      return
    }

    onUpdate()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Edit User</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              placeholder="User name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 font-medium text-sm"
          >
            Delete User
          </button>
        </form>
      </div>
    </div>
  )
}
