import { NextRequest, NextResponse } from 'next/server'

// This would be shared with the POST route in a real app
const withdrawals = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200))

    const withdrawal = withdrawals.get(params.id)

    if (!withdrawal) {
      return NextResponse.json(
        {
          message: 'Withdrawal not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(withdrawal)
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
