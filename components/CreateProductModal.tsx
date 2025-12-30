'use client'

import { useState } from 'react'
import { createPayPalProduct } from '@/app/actions/paypalServerActions'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const PRODUCT_TYPES = ['PHYSICAL', 'DIGITAL', 'SERVICE']
const PRODUCT_CATEGORIES = [
  'SOFTWARE',
  'DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC',
  'BOOKS_PERIODICALS_AND_NEWSPAPERS',
  'ENTERTAINMENT',
  'MUSIC',
  'GAMES',
  'EDUCATION_AND_TEXTBOOKS',
  'ART_AND_CRAFTS',
  'COLLECTIBLES',
  'CLOTHING_SHOES_AND_ACCESSORIES',
  'ELECTRONICS_AND_COMPUTERS',
  'TOYS_AND_HOBBIES',
  'OTHER',
]

export function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: 'https://example.com/image.jpg',
    type: 'SERVICE',
    category: 'SOFTWARE',
    homeUrl: 'https://themiracle.love',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await createPayPalProduct({
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        type: formData.type,
        category: formData.category,
        homeUrl: formData.homeUrl,
      })

      setSuccess(true)
      setFormData({
        name: '',
        description: '',
        imageUrl: 'https://example.com/image.jpg',
        type: 'SERVICE',
        category: 'SOFTWARE',
        homeUrl: 'https://themiracle.love',
      })

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-zinc-900 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create PayPal Product</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
              Product created successfully! Closing...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              maxLength={127}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md dark:bg-zinc-800 dark:text-white"
              placeholder="e.g., Premium Software License"
            />
            <p className="text-xs text-zinc-500 mt-1">{formData.name.length}/127 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              required
              maxLength={256}
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md dark:bg-zinc-800 dark:text-white"
              placeholder="Describe the product..."
            />
            <p className="text-xs text-zinc-500 mt-1">{formData.description.length}/256 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md dark:bg-zinc-800 dark:text-white text-sm"
              placeholder="https://..."
            />
            <p className="text-xs text-zinc-500 mt-1">Must be HTTPS</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Product Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md dark:bg-zinc-800 dark:text-white"
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md dark:bg-zinc-800 dark:text-white text-sm"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Home URL
            </label>
            <input
              type="url"
              required
              value={formData.homeUrl}
              onChange={(e) => setFormData({ ...formData, homeUrl: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md dark:bg-zinc-800 dark:text-white text-sm"
              placeholder="https://..."
            />
            <p className="text-xs text-zinc-500 mt-1">Must be HTTPS</p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
