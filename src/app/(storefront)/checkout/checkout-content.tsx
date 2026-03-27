"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Ticket,
  CreditCard,
  Banknote,
  MapPin,
  Edit,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderApiRequest } from "@/api-request/order-request";
import { CartApiRequest } from "@/api-request/cart";
import { DiscountModal } from "@/components/storefront/discount-modal";
import { toast } from "sonner";
import { CartItem } from "@/types/cart";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function CheckoutContent() {
  const isLoggedIn = true;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    address: "",
    notes: "",
  });

  const handleInputChange = (e: any) => {
    setAddressForm({
      ...addressForm,
      [e.target.id]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await CartApiRequest.getCart();
        const payload = res?.payload as any;
        if (payload?.data?.items) {
          const selected = payload.data.items.filter(
            (item: CartItem) => item.isSelected,
          );
          setCartItems(selected);

          const getEffectivePrice = (item: CartItem) => {
            return item.stock?.price ?? item.book?.basePrice ?? 0;
          };

          const calculatedSubtotal = selected.reduce(
            (sum: number, item: CartItem) =>
              sum + getEffectivePrice(item) * item.quantity,
            0,
          );
          setSubtotal(calculatedSubtotal);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  const shipping = subtotal > 200000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shipping - discountAmount;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectDiscount = (code: string, discount: number) => {
    setDiscountCode(code);
    setDiscountAmount(discount);
    toast.success(`Discount code "${code}" applied!`);
  };

  const handleRemoveDiscount = () => {
    setDiscountCode("");
    setDiscountAmount(0);
  };

  const handlePlaceOrder = async () => {
    // Validate address
    if (!addressForm.address || addressForm.address.trim() === "") {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        selectedCartItemIds: cartItems.map((item) => item._id),
        shippingAddress: addressForm.address.trim(),
        paymentMethod: "COD" as const,
        note: addressForm.notes.trim() || "Giao hàng trong giờ hành chính",
      };

      // Add promotion code if selected
      if (discountCode) {
        payload.promotionCode = discountCode;
      }

      const res = await OrderApiRequest.createOrder(payload);
      const result = res?.payload as any;

      if (
        result?.statusCode === 201 ||
        result?.statusCode === 200 ||
        result?.success
      ) {
        toast.success(result?.message || "Order Success!");
        router.push("/profile?tab=orders");
      } else {
        // Extract detailed error information
        let errorMessage = "Tạo đơn hàng thất bại";

        if (result?.message) {
          errorMessage = result.message;
        }

        if (result?.details && Array.isArray(result.details)) {
          // If there are field-level validation errors
          const details = result.details
            .map((d: any) => `${d.field || "Error"}: ${d.message}`)
            .join("\n");
          errorMessage = `${errorMessage}\n\n${details}`;
        }

        if (result?.errorCode) {
          errorMessage = `${errorMessage} (${result.errorCode})`;
        }

        console.error("Order creation error:", {
          statusCode: result?.statusCode,
          message: result?.message,
          errorCode: result?.errorCode,
          details: result?.details,
          fullResponse: result,
        });

        toast.error(errorMessage);
      }
    } catch (error) {
      let errorMsg = "Không thể kết nối đến server";
      let errorDetails: any = {};

      if (error instanceof Error) {
        errorMsg = error.message;
        const errObj = error as any;
        if (errObj.status === 400) {
          // Handle Bad Request specifically
          const payload = errObj.payload || {};
          errorMsg = payload.message || "Dữ liệu không hợp lệ";

          if (payload.details && Array.isArray(payload.details)) {
            const fieldErrors = payload.details
              .map((d: any) => `${d.field || "Field"}: ${d.message}`)
              .join("\n");
            errorMsg = `${errorMsg}\n\n${fieldErrors}`;
            errorDetails.details = payload.details;
          }

          if (payload.errorCode) {
            errorMsg = `${errorMsg}\n(Code: ${payload.errorCode})`;
          }
        } else if (errObj.payload?.message) {
          errorMsg = errObj.payload.message;
        }
      } else if (typeof error === "object" && error !== null) {
        // Handle response errors
        const errObj = error as any;
        if (errObj.payload?.message) {
          errorMsg = errObj.payload.message;
          if (errObj.payload?.details) {
            errorDetails.details = errObj.payload.details;
          }
        } else if (errObj.message) {
          errorMsg = errObj.message;
        }
      }

      console.error("Order creation error details:", {
        errorType: error instanceof Error ? "Error" : typeof error,
        statusCode: (error as any)?.status,
        errorMessage: errorMsg,
        ...errorDetails,
        fullError: error,
      });

      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">Complete your order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Shipping Information</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={addressForm.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery..."
                    rows={3}
                    value={addressForm.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Loading...
                  </p>
                ) : cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No products were found.
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="relative w-16 h-20 shrink-0 bg-muted rounded overflow-hidden">
                        <Image
                          src={
                            item.book?.coverUrl ||
                            item.book?.thumbnailUrl ||
                            "/placeholder.svg"
                          }
                          alt={item.book?.title || "Book cover"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.book?.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-sm font-medium">
                            {formatPrice(
                              (item.book?.basePrice || 0) * item.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>

                {/* Discount Code Section */}
                <div className="pt-2 border-t">
                  {discountCode ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {discountCode}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveDiscount}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setDiscountModalOpen(true)}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Add Discount Code
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || loading || cartItems.length === 0}
              >
                {isSubmitting ? "Đang xử lý..." : "Place Order"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <DiscountModal
        open={discountModalOpen}
        onOpenChange={setDiscountModalOpen}
        subtotal={subtotal}
        onSelectCode={handleSelectDiscount}
      />
    </div>
  );
}
