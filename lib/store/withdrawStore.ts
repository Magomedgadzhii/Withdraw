import { create } from 'zustand'
import type { Withdrawal, UIState } from '@/lib/types/withdrawal'
import {
  createWithdrawal,
  withRetry,
  WithdrawalAPIError,
} from '@/lib/api/withdrawals'
import {
  generateIdempotencyKey,
  storeIdempotencyKey,
  clearStoredIdempotencyKey,
} from '@/lib/utils/idempotency'

interface WithdrawStore {
  // State
  status: UIState
  error: string | null
  withdrawal: Withdrawal | null
  isSubmitting: boolean

  // Actions
  submitWithdrawal: (amount: number, destination: string) => Promise<void>
  reset: () => void
  clearError: () => void
}

export const useWithdrawStore = create<WithdrawStore>((set, get) => ({
  // Initial state
  status: 'idle',
  error: null,
  withdrawal: null,
  isSubmitting: false,

  // Submit withdrawal with retry logic and double-submit protection
  submitWithdrawal: async (amount: number, destination: string) => {
    const { isSubmitting } = get()

    // Prevent double submit
    if (isSubmitting) {
      console.warn('Withdrawal already in progress')
      return
    }

    set({ isSubmitting: true, status: 'loading', error: null })

    try {
      const idempotencyKey = generateIdempotencyKey()
      storeIdempotencyKey(idempotencyKey)

      // Use retry wrapper for network resilience
      const response = await withRetry(() =>
        createWithdrawal({
          amount,
          destination,
          idempotencyKey,
        })
      )

      const withdrawal: Withdrawal = {
        ...response,
        idempotencyKey,
      }

      set({
        status: 'success',
        withdrawal,
        error: null,
        isSubmitting: false,
      })

      clearStoredIdempotencyKey()
    } catch (error) {
      let errorMessage = 'An unexpected error occurred'

      if (error instanceof WithdrawalAPIError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      set({
        status: 'error',
        error: errorMessage,
        isSubmitting: false,
      })
    }
  },

  // Reset to initial state
  reset: () => {
    set({
      status: 'idle',
      error: null,
      withdrawal: null,
      isSubmitting: false,
    })
  },

  // Clear error message
  clearError: () => {
    set({ error: null })
  },
}))
