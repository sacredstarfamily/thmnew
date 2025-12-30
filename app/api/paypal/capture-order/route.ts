import { NextRequest, NextResponse } from 'next/server'
import { PayPalInterface } from '@/app/actions/paypalActions'

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json()

    if (!orderID) {
      return NextResponse.json(
        { error: 'Missing orderID' },
        { status: 400 }
      )
    }

    const paypal = new PayPalInterface()
    const result = await paypal.captureOrder(orderID)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Capture order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture order' },
      { status: 500 }
    )
  }
}
