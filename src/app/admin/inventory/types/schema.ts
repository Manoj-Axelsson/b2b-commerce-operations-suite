import { z } from "zod";

export const DiscountTypeSchema = z.enum(["SPECIAL_OFFER", "PROMOTION", "CLEARANCE"]);

// Base Product Schema 
// Defines the core fields for a Rajput Foods product.
// This replaces missing generated schemas to ensure build stability.

export const BaseProductSchema = z.object({
  id: z.string().uuid().optional(),
  articleNo: z.string().min(1, "Article number is required"),
  barcode: z.string().nullable().optional(),
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand name is required"),
  weightValue: z.number().int().positive("Weight must be positive"),
  weightUnit: z.string().min(1, "Weight unit is required"),
  ingredients: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  price: z.number().int().min(0, "Price cannot be negative"),
  discountPrice: z.number().int().min(0, "Discount price cannot be negative").nullable().optional(),
  discountStart: z.date().nullable().optional(),
  discountEnd: z.date().nullable().optional(),
  expiryDate: z.date().nullable().optional(),
  discountType: DiscountTypeSchema.nullable().optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  minQuantity: z.number().int().min(0, "Minimum quantity cannot be negative"),
  categoryId: z.string().min(1, "Category ID is required"),
  supplierId: z.string().nullable().optional(),
});

// AdminProductUpdateSchema

export const AdminProductUpdateSchema = BaseProductSchema.superRefine((data, ctx) => {
  const { price, discountPrice, discountStart, discountEnd } = data;

  // Logic 1: Discount Price validation
  if (discountPrice !== undefined && discountPrice !== null) {
    // Must be lower than regular price
    if (discountPrice >= price) {
      ctx.addIssue({
        code: "custom",
        message: "Discount price must be lower than the regular price",
        path: ["discountPrice"],
      });
    }

    // Mandatory dates if discount price is set
    if (!discountStart) {
      ctx.addIssue({
        code: "custom",
        message: "Discount start date is required when a discount price is set",
        path: ["discountStart"],
      });
    }

    if (!discountEnd) {
      ctx.addIssue({
        code: "custom",
        message: "Discount end date is required when a discount price is set",
        path: ["discountEnd"],
      });
    }
  }

  // Logic 2: Date cross-validation (End > Start and End in Future)
  if (discountStart && discountEnd) {

    // End must be after Start
    if (discountEnd <= discountStart) {
      ctx.addIssue({
        code: "custom",
        message: "Discount end date must be after the start date",
        path: ["discountEnd"],
      });
    }
  }
});

// NotificationStatus Type for the 3-day rule.
export type NotificationStatus = 'STABLE' | 'STARTING_SOON' | 'ENDING_SOON' | 'EXPIRED';

// Detailed alert structure for promotions
export interface PromotionAlert {
  status: NotificationStatus;
  msRemaining?: number;
  isUrgent?: boolean; // True if < 8 hours
}

// Client-side interface for Product data.
export interface ProductWithNotifications extends z.infer<typeof AdminProductUpdateSchema> {
  promotionAlert: PromotionAlert;
}

// Inferred TypeScript type for use in forms and server actions.

export type AdminProductUpdate = z.infer<typeof AdminProductUpdateSchema>;