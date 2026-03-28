"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tag, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromotionApiRequest } from "@/api-request/promotion";
import { Promotion, PromotionStatus } from "@/types/promotion";
import { toast } from "sonner";
import { useCurrentUser } from "@/contexts/user-context";

interface DiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  onSelectCode: (code: string, discount: number) => void;
}

export function DiscountModal({
  open,
  onOpenChange,
  subtotal,
  onSelectCode,
}: DiscountModalProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Promotion | null>(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (open) {
      fetchPromotions();
    }
  }, [open]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await PromotionApiRequest.getPromotionList({
        status: PromotionStatus.ACTIVE,
        limit: 50,
      });
      const payload = response?.payload as any;
      if (payload?.success && payload?.data?.items) {
        setPromotions(payload.data.items);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Could not load promotions");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasUserUsedPromotion = (promotion: Promotion): boolean => {
    // Check if user ID is in the usedByUsers array
    if (!currentUser?._id || !promotion.usedByUsers) {
      return false;
    }
    return promotion.usedByUsers.includes(currentUser._id);
  };

  const isPromotionAvailable = (promotion: Promotion) => {
    // Check if user has already used this promotion
    if (hasUserUsedPromotion(promotion)) {
      return false;
    }

    // Check if order value meets minimum requirement
    if (promotion.minOrderValue && subtotal < promotion.minOrderValue) {
      return false;
    }

    // Check if promotion is not expired
    const endDate = new Date(promotion.endDate);
    if (endDate < new Date()) {
      return false;
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return false;
    }

    return true;
  };

  const getUnavailableReason = (promotion: Promotion): string | null => {
    // Check if user has already used this promotion
    if (hasUserUsedPromotion(promotion)) {
      return "You have already used this promotion";
    }

    // Check if order value meets minimum requirement
    if (promotion.minOrderValue && subtotal < promotion.minOrderValue) {
      return `Add ${formatPrice(promotion.minOrderValue - subtotal)} to use this code`;
    }

    // Check if promotion is not expired
    const endDate = new Date(promotion.endDate);
    if (endDate < new Date()) {
      return "This promotion has expired";
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return "This promotion has reached its usage limit";
    }

    return null;
  };

  const getDiscountDisplay = (promotion: Promotion) => {
    if (promotion.discountType === "PERCENT") {
      return `-${promotion.discountValue}%`;
    } else {
      return `-${formatPrice(promotion.discountValue)}`;
    }
  };

  const handleSelectCode = (promotion: Promotion) => {
    let discountAmount = 0;
    if (promotion.discountType === "PERCENT") {
      discountAmount = (subtotal * promotion.discountValue) / 100;
    } else {
      discountAmount = promotion.discountValue;
    }

    // Cap discount at maxDiscount if specified
    if (promotion.maxDiscount) {
      discountAmount = Math.min(discountAmount, promotion.maxDiscount);
    }

    onSelectCode(promotion.code, discountAmount);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Select Discount Code
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading promotions...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No active promotions available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions
              .filter((p) => !hasUserUsedPromotion(p))
              .map((promotion) => {
                const available = isPromotionAvailable(promotion);

                return (
                  <div key={promotion._id}>
                    <div
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        available
                          ? "hover:border-primary hover:bg-accent"
                          : "opacity-60 cursor-not-allowed",
                      )}
                      onClick={() => available && handleSelectCode(promotion)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white shrink-0">
                          <Tag className="h-8 w-8" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-balance">
                                {promotion.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {promotion.description || "No description"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetail(
                                  selectedDetail?._id === promotion._id
                                    ? null
                                    : promotion,
                                );
                              }}
                              className="p-1"
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  selectedDetail?._id === promotion._id
                                    ? "rotate-180"
                                    : "",
                                )}
                              />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="font-mono">
                              {promotion.code}
                            </Badge>
                            <span className="text-sm font-medium text-primary">
                              {getDiscountDisplay(promotion)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {promotion.minOrderValue &&
                              promotion.minOrderValue > 0 && (
                                <span>
                                  Min. order:{" "}
                                  {formatPrice(promotion.minOrderValue)}
                                </span>
                              )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Valid until{" "}
                                {new Date(
                                  promotion.endDate,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {!available && (
                            <p className="text-xs text-red-500">
                              {getUnavailableReason(promotion)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Promotion Details */}
                    {selectedDetail?._id === promotion._id && (
                      <div className="bg-muted/50 rounded-b-lg p-4 space-y-2 text-sm border border-t-0">
                        <div>
                          <span className="font-medium">Discount Type:</span>
                          <span className="ml-2">
                            {promotion.discountType === "PERCENT"
                              ? "Percentage"
                              : "Fixed Amount"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Applies To:</span>
                          <span className="ml-2">
                            {promotion.applyScope === "ORDER"
                              ? "Entire Order"
                              : promotion.applyScope === "SPECIFIC_BOOKS"
                                ? "Specific Books"
                                : "Category"}
                          </span>
                        </div>
                        {promotion.maxDiscount && (
                          <div>
                            <span className="font-medium">Max Discount:</span>
                            <span className="ml-2">
                              {formatPrice(promotion.maxDiscount)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Usage:</span>
                          <span className="ml-2">
                            {promotion.usedCount}
                            {promotion.usageLimit
                              ? ` / ${promotion.usageLimit}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
