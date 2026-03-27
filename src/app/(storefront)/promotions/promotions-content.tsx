"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PromotionApiRequest } from "@/api-request/promotion";
import { Promotion, PromotionStatus } from "@/types/promotion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Tag,
  Clock,
  TrendingDown,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export function PromotionsContent() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await PromotionApiRequest.getPromotionList({
        status: PromotionStatus.ACTIVE,
        limit: 100,
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

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const endDate = new Date(promotion.endDate);
    return endDate > now;
  };

  const getDiscountDisplay = (promotion: Promotion) => {
    if (promotion.discountType === "PERCENT") {
      return `${promotion.discountValue}% Off`;
    } else {
      return `${formatPrice(promotion.discountValue)} Off`;
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Available Promotions</h1>
        <p className="text-muted-foreground text-lg">
          Browse our exclusive discount codes and special offers
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="h-6 w-6 bg-primary rounded-full animate-bounce"></div>
            <p className="text-muted-foreground">Loading promotions...</p>
          </div>
        </div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Promotions</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Check back soon for new deals and special offers!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => {
            const isActive = isPromotionActive(promotion);
            const isExpanded = selectedPromotion === promotion._id;

            return (
              <div key={promotion._id}>
                <Card
                  className={`cursor-pointer transition-all ${
                    isActive ? "hover:shadow-lg" : "opacity-60"
                  }`}
                  onClick={() =>
                    setSelectedPromotion(isExpanded ? null : promotion._id)
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white shrink-0">
                        <Tag className="h-8 w-8" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {promotion.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {promotion.description ||
                                "Special discount offer"}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <Badge
                            variant="secondary"
                            className="font-mono text-sm cursor-pointer hover:bg-secondary/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(promotion.code);
                            }}
                          >
                            {copiedCode === promotion.code ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                {promotion.code}
                              </>
                            )}
                          </Badge>
                          <span className="text-lg font-bold text-primary">
                            {getDiscountDisplay(promotion)}
                          </span>
                          {!isActive && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>

                        {/* Quick Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          {promotion.minOrderValue && (
                            <span>
                              Min. order: {formatPrice(promotion.minOrderValue)}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Valid until{" "}
                              {new Date(promotion.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Discount Display */}
                      <div className="text-right shrink-0">
                        <div className="text-3xl font-bold text-primary">
                          {promotion.discountType === "PERCENT"
                            ? `${promotion.discountValue}%`
                            : formatPrice(promotion.discountValue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {promotion.discountType === "PERCENT"
                            ? "Discount"
                            : "Off"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expanded Details */}
                {isExpanded && (
                  <Card className="border-t-0 rounded-t-none">
                    <CardContent className="p-6 bg-muted/30 space-y-4">
                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Discount Type:
                          </span>
                          <p className="mt-1 font-semibold">
                            {promotion.discountType === "PERCENT"
                              ? "Percentage"
                              : "Fixed Amount"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Applies To:
                          </span>
                          <p className="mt-1 font-semibold">
                            {promotion.applyScope === "ORDER"
                              ? "Entire Order"
                              : promotion.applyScope === "SPECIFIC_BOOKS"
                                ? "Specific Books"
                                : "Category"}
                          </p>
                        </div>
                        {promotion.maxDiscount && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Max Discount:
                            </span>
                            <p className="mt-1 font-semibold">
                              {formatPrice(promotion.maxDiscount)}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Usage:
                          </span>
                          <p className="mt-1 font-semibold">
                            {promotion.usedCount}
                            {promotion.usageLimit
                              ? ` / ${promotion.usageLimit}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            handleCopyCode(promotion.code);
                            setSelectedPromotion(null);
                            toast.info(
                              "Go to checkout to use this promotion code",
                            );
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                          <Link href="/products">Shop Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
