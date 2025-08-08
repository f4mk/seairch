import type { ErrorResponse, SuccessResponse } from './types'

export function successResponse(data?: unknown): SuccessResponse {
  return { success: true, data }
}

export function errorResponse(message: string, originalError?: unknown): ErrorResponse {
  const errorMessage = originalError instanceof Error ? originalError.message : message
  return { success: false, error: errorMessage }
}
export const isAdditionalParamsAllowed = (model: string): boolean => {
  // Models that disallow max_tokens: gpt-4o, gpt-4.5*, gpt-5*, etc.
  return !/^(gpt-4o|gpt-4\.5|gpt-5|o3-)/.test(model)
}
