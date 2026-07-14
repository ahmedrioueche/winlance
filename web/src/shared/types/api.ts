export type ApiError = {
  code: string
  message: string
  status: number
  details?: unknown
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'status' in value
  )
}
