import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) return NextResponse.json({ error: 'Webhook Stripe não configurado.' }, { status: 503 })
  const stripe = new Stripe(secretKey)
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.id) await db.update(orders).set({ status: session.payment_status === 'paid' ? 'paid' : 'processing', stripeSessionId: session.id }).where(eq(orders.stripeSessionId, session.id))
    }
    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.id) await db.update(orders).set({ status: 'failed' }).where(eq(orders.stripeSessionId, session.id))
    }
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }
}
