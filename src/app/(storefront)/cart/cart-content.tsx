"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Ticket } from "lucide-react"
import { DiscountModal } from "@/components/storefront/discount-modal"
import { CheckoutStepper } from "@/components/storefront/checkout-stepper"

interface CartItem {
  id: number
  title: string
  author: string
  price: number
  quantity: number
  imageUrl: string
}

export function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      price: 120000,
      quantity: 1,
      imageUrl: "/alchemist-book-cover.png",
    },
    {
      id: 2,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      price: 85000,
      quantity: 2,
      imageUrl: "/how-to-win-friends-book.jpg",
    },
    {
      id: 5,
      title: "Thay Đổi Tí Hon",
      author: "James Clear",
      price: 160000,
      quantity: 1,
      imageUrl: "/atomic-habits-book.png",
    },
  ])

  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 5])
  const [promoCode, setPromoCode] = useState("")
  const [showDiscountModal, setShowDiscountModal] = useState(false)

  const toggleItemSelection = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map((item) => item.id))
    }
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
  }

  const subtotal = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 200000 ? 0 : subtotal > 0 ? 30000 : 0
  const discount = 0
  const total = subtotal + shipping - discount

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Cart is Empty</h2>
            <p className="text-muted-foreground">You don't have any products in your cart</p>
            <Button asChild className="mt-4">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutStepper
        currentStep={1}
        steps={[
          { id: 1, title: "Cart", description: "Review items" },
          { id: 2, title: "Information", description: "Shipping details" },
          { id: 3, title: "Payment", description: "Complete order" },
        ]}
      />

      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground mt-2">
          You have {cartItems.length} items in your cart ({selectedItems.length} selected)
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                  onCheckedChange={toggleAllItems}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Select All ({cartItems.length} items)
                </label>
              </div>
            </CardContent>
          </Card>

          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex items-start pt-1">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                  </div>

                  <div className="relative w-24 h-32 shrink-0 bg-muted rounded-md overflow-hidden">
                    <Image src={item.imageUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-balance">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="text-lg font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <p className="text-sm text-muted-foreground">{selectedItems.length} item(s) selected</p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              {subtotal < 200000 && subtotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(200000 - subtotal)} more for free shipping
                </p>
              )}

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                  onClick={() => setShowDiscountModal(true)}
                  disabled={selectedItems.length === 0}
                >
                  <Ticket className="h-4 w-4" />
                  {promoCode ? <span className="font-medium">{promoCode}</span> : <span>Select Discount Code</span>}
                </Button>
              </div>

              <Button className="w-full" size="lg" asChild disabled={selectedItems.length === 0}>
                <Link href="/checkout">Proceed to Checkout ({selectedItems.length})</Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground">Shipping and taxes calculated at checkout</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <DiscountModal
        open={showDiscountModal}
        onOpenChange={setShowDiscountModal}
        selectedCode={promoCode}
        onSelectCode={setPromoCode}
        subtotal={subtotal}
      />
    </div>
  )
}
