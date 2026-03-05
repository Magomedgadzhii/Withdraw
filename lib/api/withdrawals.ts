import type {
  CreateWithdrawalRequest,
  CreateWithdrawalResponse,
  Withdrawal,
} from '@/lib/types/withdrawal'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export class WithdrawalAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'WithdrawalAPIError'
  }
}

/**
 * Create a new withdrawal request
 */
export async function createWithdrawal(
  data: CreateWithdrawalRequest
): Promise<CreateWithdrawalResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/withdrawals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': data.idempotencyKey,
    },
    body: JSON.stringify({
      amount: data.amount,
      destination: data.destination,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    
    if (response.status === 409) {
      throw new WithdrawalAPIError(
        'A withdrawal with this request already exists. Please check your recent transactions.',
        409,
        'DUPLICATE_REQUEST'
      )
    }
    
    throw new WithdrawalAPIError(
      errorData.message || 'Failed to create withdrawal',
      response.status,
      errorData.code
    )
  }

  return response.json()
}

/**
 * Get withdrawal by ID
 */
export async function getWithdrawal(id: string): Promise<Withdrawal> {
  const response = await fetch(`${API_BASE_URL}/v1/withdrawals/${id}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new WithdrawalAPIError(
      errorData.message || 'Failed to fetch withdrawal',
      response.status,
      errorData.code
    )
  }

  return response.json()
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on 4xx errors (except 409 which might be transient)
      if (error instanceof WithdrawalAPIError) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 409) {
          throw error
        }
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
