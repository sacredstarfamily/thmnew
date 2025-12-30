import { NextRequest, NextResponse } from 'next/server'
import { PayPalInterface, PayPalOrderRequest } from '@/app/actions/paypalActions'

export async function POST(req: NextRequest) {
  try {
    const { items, total } = await req.json()

    if (!items || !total) {
      return NextResponse.json(
        { error: 'Missing items or total' },
        { status: 400 }
      )
    }

    const orderRequest: PayPalOrderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: total,
              },
            },
          },
          items: items.map((item: { name: string; quantity: string; unit_amount: { currency_code: string; value: string } }) => ({
            name: item.name,
            quantity: item.quantity,
            category: 'DIGITAL_GOODS',
            unit_amount: item.unit_amount,
          })),
        },
      ],
      application_context: {
        brand_name: 'The Miracle',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop`,
      },
    }

    const paypal = new PayPalInterface()
    const order = await paypal.createOrder(orderRequest)

    return NextResponse.json({ id: order.id })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
