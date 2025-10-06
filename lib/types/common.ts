export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}
