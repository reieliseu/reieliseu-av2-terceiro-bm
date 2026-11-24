import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { prisma } from '@/backend/src/lib/prisma'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'

export const runtime = 'nodejs'

function customerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
}

async function syncSubscription(subscription: Stripe.Subscription, fallbackUserId?: string | null) {
  const userId = subscription.metadata.userId ?? fallbackUserId
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    : await prisma.user.findFirst({ where: { stripeSubscriptionId: subscription.id }, select: { id: true } })
  if (!user) return

  const periodEnd = subscription.items.data.reduce((latest, item) => Math.max(latest, item.current_period_end), 0)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId(subscription),
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCheckoutSessionId: null,
      stripeCheckoutAttemptKey: null,
    },
  })
}

function sessionSubscriptionId(session: Stripe.Checkout.Session) {
  const subscription = session.subscription
  return typeof subscription === 'string' ? subscription : subscription?.id ?? null
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) return NextResponse.json({ error: 'Webhook Stripe não configurado.' }, { status: 503 })
  const stripe = new Stripe(secretKey)
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription') {
        const subscriptionId = sessionSubscriptionId(session)
        if (subscriptionId) {
          const subscription = typeof session.subscription === 'object' && session.subscription
            ? session.subscription
            : await stripe.subscriptions.retrieve(subscriptionId)
          await syncSubscription(subscription, session.metadata?.userId ?? session.client_reference_id)
        }
      } else if (session.id && (event.type !== 'checkout.session.async_payment_failed')) {
        await db.update(orders).set({ status: session.payment_status === 'paid' ? 'paid' : 'processing', stripeSessionId: session.id }).where(eq(orders.stripeSessionId, session.id))
      } else if (session.id) {
        await db.update(orders).set({ status: 'failed' }).where(eq(orders.stripeSessionId, session.id))
      }
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncSubscription(event.data.object as Stripe.Subscription)
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Não foi possível sincronizar o evento.' }, { status: 500 })
  }
}
