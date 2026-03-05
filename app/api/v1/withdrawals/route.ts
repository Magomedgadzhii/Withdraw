import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo
const processedKeys = new Set<string>()
const withdrawals = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get('Idempotency-Key')
    const body = await request.json()

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check for duplicate idempotency key (409 Conflict)
    if (idempotencyKey && processedKeys.has(idempotencyKey)) {
      return NextResponse.json(
        {
          message: 'A withdrawal with this request already exists',
          code: 'DUPLICATE_REQUEST',
        },
        { status: 409 }
      )
    }

    // Validate request
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        {
          message: 'Amount must be greater than 0',
          code: 'INVALID_AMOUNT',
        },
        { status: 400 }
      )
    }

    if (!body.destination) {
      return NextResponse.json(
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

    return NextResponse.json(withdrawal, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
