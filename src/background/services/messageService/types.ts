export type SuccessResponse = {
  success: true
  data?: unknown
}

export type ErrorResponse = {
  success: false
  error: string
}

export type BackgroundResponse = SuccessResponse | ErrorResponse
