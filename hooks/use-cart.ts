"use client"

import { useState } from "react"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  stock_quantity: number
}

interface CartItem extends MenuItem {
  quantity: number
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId)
    })
  }

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find((item) => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const clearCart = () => setCart([])

  return {
    cart,
    addToCart,
    removeFromCart,
    getCartItemQuantity,
    clearCart,
  }
}
