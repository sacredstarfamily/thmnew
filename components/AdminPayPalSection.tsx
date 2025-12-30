'use client'

import { useState } from 'react'
import { CreateProductModal } from '@/components/CreateProductModal'
import { PayPalProduct } from '@/app/actions/paypalActions'

interface AdminPayPalSectionProps {
  paypalCatalog: { products: PayPalProduct[]; total_items: number } | null
  paypalError: string | null
}

function formatDate(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  }
  return '—'
}

export function AdminPayPalSection({
  paypalCatalog,
  paypalError,
}: AdminPayPalSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">PayPal Inventory</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Live catalog fetched from PayPal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {paypalCatalog ? `${paypalCatalog.total_items} items` : '—'}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add Product
            </button>
          </div>
        </div>

        {paypalError && (
          <div className="px-6 py-4 text-sm text-red-600 dark:text-red-400">
            {paypalError}
          </div>
        )}

        {paypalCatalog && paypalCatalog.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {paypalCatalog.products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                      {p.name || 'Untitled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {p.type || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {p.category || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(p.create_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      {p.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !paypalError && (
            <div className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">No PayPal products found.</div>
          )
        )}
      </div>

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  )
}
