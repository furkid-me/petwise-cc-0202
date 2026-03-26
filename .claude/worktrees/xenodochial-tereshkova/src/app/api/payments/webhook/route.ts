import { NextRequest, NextResponse } from 'next/server'

// TODO: On payment success, update user subscriptionPlan = PREMIUM
export async function POST(_request: NextRequest) {
  try { return NextResponse.json({ received: true, status: 'stub' }) }
  catch { return NextResponse.json({ error: 'Webhook error' }, { status: 500 }) }
}
