import { AdjustmentType, OrderStatus } from "@/generated/prisma/client";
import { z } from "zod";

// Base schemas for reusable validation patterns
const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });
const positiveNumberSchema = z.number().positive("Must be a positive number");
const nonNegativeNumberSchema = z.number().min(0, "Cannot be negative");

// Order Status Validation
export const orderStatusSchema = z.nativeEnum(OrderStatus, {
  error: () => ({
    message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`
  })
});

// Adjustment Type Validation
export const adjustmentTypeSchema = z.nativeEnum(AdjustmentType, {
  error: () => ({
    message: `Adjustment type must be one of: ${Object.values(AdjustmentType).join(', ')}`
  })
});

// Create Order Schema
export const createOrderSchema = z.object({
  customerId: uuidSchema.optional(),
  customerEmail: z.string().email("Invalid email format").optional(),
  customerPhone: z.string().min(1, "Phone number is required").optional(),
  deliveryAddress: z.string().min(1, "Delivery address is required").optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: uuidSchema,
    quantity: positiveNumberSchema.int("Quantity must be a whole number"),
    unitPrice: nonNegativeNumberSchema,
  })).min(1, "Order must have at least one item"),
});

// Update Order Schema
export const updateOrderSchema = z.object({
  customerId: uuidSchema.optional(),
  customerEmail: z.string().email("Invalid email format").optional(),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  status: orderStatusSchema.optional(),
});

// Update Order Status Schema
export const updateOrderStatusSchema = z.object({
  orderId: uuidSchema,
  status: orderStatusSchema,
  notes: z.string().optional(),
});

// Add Adjustment Schema
export const addAdjustmentSchema = z.object({
  orderId: uuidSchema,
  type: adjustmentTypeSchema,
  amount: z.number().refine(
    (val) => !isNaN(val) && isFinite(val),
    { message: "Amount must be a valid number" }
  ),
  description: z.string().optional(),
});

// Remove Adjustment Schema
export const removeAdjustmentSchema = z.object({
  orderId: uuidSchema,
  adjustmentId: uuidSchema,
});

// Add Order Item Schema
export const addOrderItemSchema = z.object({
  orderId: uuidSchema,
  productId: uuidSchema,
  quantity: positiveNumberSchema.int("Quantity must be a whole number"),
  unitPrice: nonNegativeNumberSchema,
});

// Update Order Item Schema
export const updateOrderItemSchema = z.object({
  orderId: uuidSchema,
  itemId: uuidSchema,
  quantity: positiveNumberSchema.int("Quantity must be a whole number").optional(),
  unitPrice: nonNegativeNumberSchema.optional(),
});

// Remove Order Item Schema
export const removeOrderItemSchema = z.object({
  orderId: uuidSchema,
  itemId: uuidSchema,
});

// Order Query/Filter Schema
export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  customerId: uuidSchema.optional(),
  customerEmail: z.string().email().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional(),
});
