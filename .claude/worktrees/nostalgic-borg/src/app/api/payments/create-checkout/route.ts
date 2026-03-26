import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, userId } = body
    if (!plan || !userId) return NextResponse.json({ success: false, message: '缺少必要參數' }, { status: 400 })
    // TODO: switch on PAYMENT_PROVIDER env var: ecpay | newebpay | linepay | stripe
    return NextResponse.json({ success: false, message: '付款功能即將開放，敬請期待', provider: null })
  } catch {
    return NextResponse.json({ success: false, message: '伺服器錯誤' }, { status: 500 })
  }
}
