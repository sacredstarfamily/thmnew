'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from './useCartStore'
import { PayPalCheckout } from './PayPalCheckout'

export function CartSummary() {
  const { 
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalValue,
    getItemCount,
    getDisplayCart
  } = useCartStore()

  const [hasMounted, setHasMounted] = useState(false)

  // Prevent hydration mismatch by only rendering cart data after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
  }, [])

  const totalValue = getTotalValue()
  const itemCount = getItemCount()
  const displayCart = getDisplayCart()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Cart ({hasMounted ? displayCart.length : 0})
        </h2>
        {hasMounted && itemCount > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Clear
          </button>
        )}
      </div>

      {(!hasMounted || itemCount === 0) && (
        <p className="text-sm text-gray-600 dark:text-zinc-400">Your cart is empty.</p>
      )}

      {hasMounted && itemCount > 0 && (
        <div className="space-y-3">
          {displayCart.map((displayItem) => (
            <div key={displayItem.productId} className="rounded-lg border border-gray-100 p-3 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                    {displayItem.name}
                  </div>
                  {displayItem.description && (
                    <div className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2">
                      {displayItem.description}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                    {displayItem.category || 'General'}
                  </div>
                  <div className="mt-1 text-xs font-medium text-gray-700 dark:text-zinc-300">
                    ${displayItem.price.toFixed(2)} each
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(displayItem.productId, true)}
                  className="text-xs text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${displayItem.name}`}
                >
                  ✕
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-gray-700 dark:text-zinc-300">
                <span className="font-medium">Qty: {displayItem.quantity}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(displayItem.productId, displayItem.quantity - 1)}
                    className="h-7 w-7 rounded-full border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center">{displayItem.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(displayItem.productId, displayItem.quantity + 1)}
                    className="h-7 w-7 rounded-full border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-2 text-right text-sm font-semibold text-gray-900 dark:text-zinc-100">
                Subtotal: ${(displayItem.price * displayItem.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-sm font-semibold text-gray-900 dark:border-zinc-800 dark:text-zinc-100">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-zinc-100">
            <span>Total</span>
            <span>${totalValue.toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-zinc-800">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
              Checkout
            </h3>
            <PayPalCheckout />
          </div>
        </div>
      )}
    </div>
  )
}
