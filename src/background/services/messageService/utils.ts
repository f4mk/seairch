import type { ErrorResponse, SuccessResponse } from './types'

export function successResponse(data?: unknown): SuccessResponse {
  return { success: true, data }
}

export function errorResponse(message: string, originalError?: unknown): ErrorResponse {
  const errorMessage = originalError instanceof Error ? originalError.message : message
  return { success: false, error: errorMessage }
}
