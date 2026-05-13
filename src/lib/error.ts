import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Custom error class for business logic violations that are safe to show to the user.
 */
export class BusinessError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "BusinessError";
  }
}

/**
 * Standardizes error responses for Server Actions and API Routes.
 * Masking internal system details while exposing safe business errors.
 */
export function formatSafeError(err: unknown): 
  { success: false; error: string; status: number; details?: any } 
{
  // Log the full error on the server for debugging
  console.error("[SERVER_ERROR]:", err);

  if (err instanceof BusinessError) {
    return { success: false, error: err.message, status: err.statusCode };
  }

  // Handle Prisma Unique Constraint (e.g., Idempotency Key violation)
  if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
    return { 
      success: false, 
      error: "This order has already been processed. Please check your order history.", 
      status: 409 
    };
  }

  if (err instanceof ZodError) {
    return { success: false, error: "Invalid request data", details: err.issues, status: 400 };
  }

  // Mask all other internal system errors
  return { success: false, error: "An internal system error occurred. Please try again later.", status: 500 };
}

/**
 * Helper specifically for Route Handlers (NextResponse)
 */
export function formatSafeResponse(err: unknown) {
  const formatted = formatSafeError(err);
  return NextResponse.json(
    { 
      error: formatted.error, 
      details: formatted.details 
    },
    { status: formatted.status }
  );
}
