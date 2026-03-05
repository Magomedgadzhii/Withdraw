/**
 * Generate a unique idempotency key for withdrawal requests
 * Uses timestamp + random string for uniqueness
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `withdraw_${timestamp}_${random}`
}

/**
 * Store idempotency key in sessionStorage for recovery after page reload
 */
export function storeIdempotencyKey(key: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('lastIdempotencyKey', key)
    sessionStorage.setItem('lastIdempotencyKeyTime', Date.now().toString())
  }
}

/**
 * Retrieve stored idempotency key if it's still valid (within 5 minutes)
 */
export function getStoredIdempotencyKey(): string | null {
  if (typeof window === 'undefined') return null
  
  const key = sessionStorage.getItem('lastIdempotencyKey')
  const timeStr = sessionStorage.getItem('lastIdempotencyKeyTime')
  
  if (!key || !timeStr) return null
  
  const time = parseInt(timeStr, 10)
  const fiveMinutes = 5 * 60 * 1000
  
  if (Date.now() - time > fiveMinutes) {
    sessionStorage.removeItem('lastIdempotencyKey')
    sessionStorage.removeItem('lastIdempotencyKeyTime')
    return null
  }
  
  return key
}

/**
 * Clear stored idempotency key after successful withdrawal
 */
export function clearStoredIdempotencyKey(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('lastIdempotencyKey')
    sessionStorage.removeItem('lastIdempotencyKeyTime')
  }
}
