import { z } from 'zod'

export const withdrawalFormSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  destination: z.string().min(1, 'Destination address is required'),
  confirm: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the withdrawal',
  }),
})

export type WithdrawalFormData = z.infer<typeof withdrawalFormSchema>

export type WithdrawalStatus = 'pending' | 'completed' | 'failed'

export interface Withdrawal {
  id: string
  amount: number
  destination: string
  status: WithdrawalStatus
  createdAt: string
  idempotencyKey: string
}

export interface CreateWithdrawalRequest {
  amount: number
  destination: string
  idempotencyKey: string
}

export interface CreateWithdrawalResponse {
  id: string
  amount: number
  destination: string
  status: WithdrawalStatus
  createdAt: string
}

export type UIState = 'idle' | 'loading' | 'success' | 'error'
