import { http, HttpResponse, delay } from 'msw'

interface WithdrawalRequest {
  amount: number
  destination: string
}

// In-memory storage for testing idempotency
const processedKeys = new Set<string>()
const withdrawals = new Map<string, any>()

export const handlers = [
  // POST /v1/withdrawals
  http.post('/api/v1/withdrawals', async ({ request }) => {
    const idempotencyKey = request.headers.get('Idempotency-Key')
    const body = (await request.json()) as WithdrawalRequest

    // Simulate network delay
    await delay(500)

    // Check for duplicate idempotency key (409 Conflict)
    if (idempotencyKey && processedKeys.has(idempotencyKey)) {
      return HttpResponse.json(
        {
          message: 'A withdrawal with this request already exists',
          code: 'DUPLICATE_REQUEST',
        },
        { status: 409 }
      )
    }

    // Validate request
    if (!body.amount || body.amount <= 0) {
      return HttpResponse.json(
        {
          message: 'Amount must be greater than 0',
          code: 'INVALID_AMOUNT',
        },
        { status: 400 }
      )
    }

    if (!body.destination) {
      return HttpResponse.json(
        {
          message: 'Destination address is required',
          code: 'INVALID_DESTINATION',
        },
        { status: 400 }
      )
    }

    // Create withdrawal
    const id = `wdr_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const withdrawal = {
      id,
      amount: body.amount,
      destination: body.destination,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    if (idempotencyKey) {
      processedKeys.add(idempotencyKey)
    }
    withdrawals.set(id, withdrawal)

    return HttpResponse.json(withdrawal, { status: 201 })
  }),

  // GET /v1/withdrawals/:id
  http.get('/api/v1/withdrawals/:id', async ({ params }) => {
    const { id } = params

    await delay(200)

    const withdrawal = withdrawals.get(id as string)

    if (!withdrawal) {
      return HttpResponse.json(
        {
          message: 'Withdrawal not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(withdrawal)
  }),
]

// Helper to reset mock state (useful for tests)
export function resetMockState() {
  processedKeys.clear()
  withdrawals.clear()
}
