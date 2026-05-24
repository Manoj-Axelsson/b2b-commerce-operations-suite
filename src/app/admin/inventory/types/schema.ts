import { z } from "zod";

export type NotificationStatus = 'STARTING_SOON' | 'ENDING_SOON' | 'ACTIVE';

export interface PromotionAlert {
  status: NotificationStatus;
  msRemaining?: number;
  isUrgent?: boolean; // True if < 8 hours
}

export const DiscountTypeSchema = z.enum(["SPECIAL_OFFER", "PROMOTION", "CLEARANCE"]);

export const AdminProductUpdateSchema = z.object({
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

  discountPrice: z
      .number()
      .int()
      .min(0, "Discount price cannot be negative")
      .nullable()
      .optional(),

  discountStart: z.date().nullable().optional(),
  discountEnd: z.date().nullable().optional(),

  expiryDate: z.date().nullable().optional(),

  discountType: DiscountTypeSchema.nullable().optional(),

  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  minQuantity: z.number().int().min(0, "Minimum quantity cannot be negative"),

  categoryId: z.string().min(1, "Category ID is required"),

  supplierId: z.string().nullable().optional(),
});

// Type inference
export type AdminProductUpdate = z.infer<typeof AdminProductUpdateSchema>;
