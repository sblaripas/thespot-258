import type { ApiResponse, ApiError } from "@/lib/types/common"

/**
 * Create a success response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    success: true,
  }
}

/**
 * Create an error response
 */
export function errorResponse<T = null>(error: string | ApiError): ApiResponse<T> {
  return {
    data: null,
    error: typeof error === "string" ? error : error.message,
    success: false,
  }
}

/**
 * Handle database errors with user-friendly messages
 */
export function handleDbError(error: any): string {
  if (error?.code === "PGRST116") {
    return "Item not found"
  }

  if (error?.code === "42P17") {
    return "Database configuration error. Please contact support."
  }

  if (error?.message) {
    return error.message
  }

  return "An unexpected error occurred"
}
