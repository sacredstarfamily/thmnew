'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Base product type
export type PayPalProduct = {
  id: string
  name: string
  price?: number
  description?: string
  type?: string
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS'
  image_url?: string
  [key: string]: unknown
}

// Individual cart item with unique instance ID
export interface CartItem extends PayPalProduct {
  cartItemId: string // Unique ID for each cart item instance
  quantity: 1 // Always 1 since we're creating separate instances
}

// Display version of cart item for UI
export interface DisplayCartItem {
  productId: string
  name: string
  price: number
  image_url?: string
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS'
  description?: string
  quantity: number // Total quantity for this product
  cartItemIds: string[] // Array of individual cart item IDs
}

interface CartState {
  cart: CartItem[]
  addToCart: (product: PayPalProduct) => void
  removeFromCart: (productId: string, removeAll?: boolean) => void
  updateQuantity: (productId: string, newQuantity: number) => void
  clearCart: () => void
  getTotalValue: () => number
  getItemCount: () => number
  getDisplayCart: () => DisplayCartItem[]
  isEmpty: () => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        set((state) => {
          // Always create a new cart item instance with unique ID
          const cartItemId = `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const newCartItem: CartItem = {
            ...product,
            cartItemId,
            quantity: 1 // Always 1 for individual instances
          }

          console.log(`Adding new item instance to cart: ${product.name}, cart item ID: ${cartItemId}`)

          return {
            cart: [...state.cart, newCartItem]
          }
        })
      },

      removeFromCart: (productId, removeAll = false) => {
        set((state) => {
          if (removeAll) {
            // Remove all instances of this product
            return {
              cart: state.cart.filter((cartItem) => cartItem.id !== productId)
            }
          } else {
            // Remove only one instance of this product
            const itemIndex = state.cart.findIndex((cartItem) => cartItem.id === productId)
            if (itemIndex >= 0) {
              const newCart = [...state.cart]
              newCart.splice(itemIndex, 1)
              return { cart: newCart }
            }
            return state
          }
        })
      },

      updateQuantity: (productId, newQuantity) => {
        set((state) => {
          const currentItems = state.cart.filter(item => item.id === productId)
          const currentQuantity = currentItems.length

          if (newQuantity <= 0) {
            // Remove all instances of this product
            return {
              cart: state.cart.filter(item => item.id !== productId)
            }
          }

          if (newQuantity === currentQuantity) {
            // No change needed
            return state
          }

          let newCart = [...state.cart]

          if (newQuantity > currentQuantity) {
            // Add more instances
            const itemsToAdd = newQuantity - currentQuantity
            const templateItem = currentItems[0] // Use first item as template

            for (let i = 0; i < itemsToAdd; i++) {
              const cartItemId = `${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              newCart.push({
                ...templateItem,
                cartItemId,
                quantity: 1
              })
            }
          } else {
            // Remove excess instances
            const itemsToKeep = currentItems.slice(0, newQuantity)
            const itemIdsToKeep = new Set(itemsToKeep.map(item => item.cartItemId))

            newCart = newCart.filter(item =>
              item.id !== productId || itemIdsToKeep.has(item.cartItemId)
            )
          }

          console.log(`Updated quantity for ${productId}: ${currentQuantity} -> ${newQuantity}`)
          return { cart: newCart }
        })
      },

      clearCart: () => {
        set({ cart: [] })
      },

      getTotalValue: () => {
        const { cart } = get()
        const total = cart.reduce((total, item) => {
          return total + (item.price || 0) // Each item has quantity 1
        }, 0)
        return total
      },

      getItemCount: () => {
        const { cart } = get()
        return cart.length // Each item in array counts as 1
      },

      getDisplayCart: () => {
        const { cart } = get()
        const grouped = cart.reduce((acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              productId: item.id,
              name: item.name,
              price: item.price || 0,
              image_url: item.image_url,
              category: item.category,
              description: item.description,
              quantity: 0,
              cartItemIds: []
            }
          }
          acc[item.id].quantity++
          acc[item.id].cartItemIds.push(item.cartItemId)
          return acc
        }, {} as Record<string, DisplayCartItem>)

        return Object.values(grouped)
      },

      isEmpty: () => {
        const { cart } = get()
        return cart.length === 0
      }
    }),
    { name: 'tmn-cart' }
  )
)
