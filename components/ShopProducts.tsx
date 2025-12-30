'use client'

import { useCartStore, PayPalProduct } from './cart/useCartStore'

type ShopProduct = PayPalProduct & {
  create_time?: string | number | Date
  price?: number
}

interface ShopProductsProps {
  products: ShopProduct[]
}

const formatDate = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  }
  return '—'
}

export function ShopProducts({ products }: ShopProductsProps) {
  const addToCart = useCartStore((state) => state.addToCart)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                {product.name || 'Untitled product'}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400 line-clamp-3">
                {product.description || 'No description provided.'}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-zinc-800 dark:text-zinc-200">
              {product.type || 'Item'}
            </span>
          </div>

          <div className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Category</span>
              <span className="font-medium text-gray-800 dark:text-zinc-200">
                {product.category || '—'}
              </span>
            </div>
            {product.create_time && (
              <div className="mt-1 flex items-center justify-between">
                <span>Created</span>
                <span className="font-medium text-gray-800 dark:text-zinc-200">
                  {formatDate(product.create_time)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500 dark:text-zinc-400">ID: {product.id}</span>
              <span className="mt-1 text-lg font-semibold text-gray-900 dark:text-zinc-100">
                ${(product.price ?? 10).toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                addToCart({
                  id: product.id,
                  name: product.name || 'Untitled product',
                  description: product.description,
                  category: product.category as 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | undefined,
                  type: product.type,
                  price: product.price ?? 10,
                })
              }
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Add to cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
