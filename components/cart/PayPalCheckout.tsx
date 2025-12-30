'use client'

import { useEffect, useState } from 'react'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useCartStore } from './useCartStore'

export function PayPalCheckout() {
  const { 
    cart,
    getTotalValue,
    clearCart
  } = useCartStore()
  
  const [{ isPending, isResolved }] = usePayPalScriptReducer()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const totalValue = getTotalValue()

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || cart.length === 0) return null

  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🔄 Loading PayPal...
          </p>
        </div>
      </div>
    )
  }

  if (!isResolved) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-xs text-red-700 dark:text-red-300">
            ⚠️ PayPal failed to load. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {isProcessing ? (
            <>🔄 Processing payment...</>
          ) : (
            <>🔒 Secure checkout powered by PayPal</>
          )}
        </p>
      </div>
      
      <PayPalButtons
        style={{
          shape: 'pill',
          color: 'blue',
          layout: 'vertical',
          label: 'checkout',
        }}
        disabled={isProcessing}
        createOrder={async () => {
          if (isProcessing) {
            throw new Error('Order creation already in progress')
          }
          
          setIsProcessing(true)
          
          try {
            console.log('Creating PayPal order with items:', cart.length)
            
            // Map cart items to PayPal format
            const paypalItems = cart.map((cartItem) => ({
              name: cartItem.name || 'Unknown Item',
              quantity: '1', // Always 1 since each cart item is a separate instance
              category: cartItem.category || 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: 'USD',
                value: (cartItem.price || 0).toFixed(2),
              },
            }))

            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: paypalItems,
                total: totalValue.toFixed(2),
              }),
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.error || 'Failed to create order')
            }

            const { id } = await response.json()
            console.log('PayPal order created:', id)
            return id
          } catch (err) {
            console.error('Order creation error:', err)
            setIsProcessing(false)
            throw err
          }
        }}
        onApprove={async (data) => {
          try {
            console.log('Capturing PayPal order:', data.orderID)
            
            const response = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID }),
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.error || 'Failed to capture order')
            }

            const result = await response.json()
            console.log('Order captured successfully:', result)

            // Clear cart and redirect
            clearCart()
            setIsProcessing(false)
            window.location.href = '/shop?order=success'
          } catch (err) {
            console.error('Capture error:', err)
            setIsProcessing(false)
            alert('Payment failed. Please try again.')
          }
        }}
        onError={(err) => {
          console.error('PayPal error:', err)
          setIsProcessing(false)
          alert('An error occurred during checkout. Please try again.')
        }}
        onCancel={() => {
          console.log('Payment cancelled')
          setIsProcessing(false)
        }}
      />
    </div>
  )
}
