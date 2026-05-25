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

export function getFriendlyErrorMessage(err: unknown): string {
  if (err instanceof BusinessError) {
    return err.message;
  }

  if (err instanceof ZodError) {
    return "Invalid request data. Please check your inputs and try again.";
  }

  // Handle Prisma errors
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code: string; message?: string; meta?: Record<string, unknown> };

    // Unique constraint violation (e.g., duplicate order/idempotency key)
    if (prismaErr.code === "P2002") {
      return "This order has already been processed. Please check your order history.";
    }

    // Foreign key constraint failed
    if (prismaErr.code === "P2003") {
      return "A database constraint issue occurred: Some referenced details or items do not exist in the system.";
    }

    // Record not found
    if (prismaErr.code === "P2025") {
      return "The requested record could not be found. It may have been deleted or moved.";
    }

    // Connection/Server issues (P1xxx series)
    if (prismaErr.code.startsWith("P1")) {
      const rawMsg = prismaErr.message ? ` (${prismaErr.message.split("\n")[0]})` : "";
      return `Database connection failed. The server is temporarily unable to reach the database.${rawMsg}`;
    }

    // Other Prisma errors
    const rawMsg = prismaErr.message ? ` (${prismaErr.message.split("\n")[0]})` : "";
    return `A database error occurred: [Code ${prismaErr.code}]${rawMsg}`;
  }

  if (err instanceof Error) {
    const msg = err.message || "";

    // Check for common connection errors or third-party service failures
    if (
      msg.includes("fetch failed") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ETIMEDOUT")
    ) {
      return `Network connection failed. The server could not connect to an external service (e.g., email or payment provider). Details: ${msg}`;
    }

    // Authorization checks
    if (msg.toLowerCase() === "unauthorized") {
      return "You are not authorized to perform this action. Please log in.";
    }
    if (msg.toLowerCase() === "forbidden") {
      return "Access denied. You do not have permission to view or perform this action.";
    }

    // Fallback for standard Errors
    return `An unexpected system error occurred. Details: ${msg}`;
  }

  // Non-Error fallback
  return typeof err === "string" ? err : "An unknown internal system error occurred.";
}

export function getErrorStatus(err: unknown): number {
  if (err instanceof BusinessError) {
    return err.statusCode;
  }
  if (err instanceof ZodError) {
    return 400;
  }
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code: string };
    if (prismaErr.code === "P2002") return 409;
    if (prismaErr.code === "P2003") return 400;
    if (prismaErr.code === "P2025") return 404;
    if (prismaErr.code.startsWith("P1")) return 503; // Service Unavailable
  }
  if (err instanceof Error) {
    const msg = err.message || "";
    if (msg.toLowerCase() === "unauthorized") return 401;
    if (msg.toLowerCase() === "forbidden") return 403;
  }
  return 500;
}

/**
 * Standardizes error responses for Server Actions and API Routes.
 * Masking internal system details while exposing safe business errors.
 */
export function formatSafeError(err: unknown): 
  { success: false; error: string; status: number; details?: unknown } 
{
  // Log the full error on the server for debugging
  console.error("[SERVER_ERROR]:", err);

  const errorMsg = getFriendlyErrorMessage(err);
  const status = getErrorStatus(err);
  const details = err instanceof ZodError ? err.issues : undefined;

  return { success: false, error: errorMsg, status, details };
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
