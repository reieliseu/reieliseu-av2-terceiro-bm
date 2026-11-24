import { randomUUID } from "node:crypto"
import type { Request, Response } from "express"
import Stripe from "stripe"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { HttpError } from "../lib/errors"

const checkoutConfirmationSchema = z.object({ sessionId: z.string().min(1).max(255) })
const premiumStatuses = new Set<Stripe.Subscription.Status>(["active", "trialing"])
const restartableStatuses = new Set<Stripe.Subscription.Status>(["canceled", "incomplete_expired"])
const settledCheckoutStatuses = new Set(["paid", "no_payment_required"])
let stripeInstance: Stripe | null = null

type SubscriptionStatus = {
  isPremium: boolean
  status: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new HttpError("Os pagamentos ainda não estão configurados.", 503)
  if (!stripeInstance) stripeInstance = new Stripe(secretKey)
  return stripeInstance
}

function currentUserId(req: Request) {
  if (!req.userId) throw new HttpError("Sessão inválida. Entre novamente.", 401)
  return req.userId
}

function appOrigin() {
  if (process.env.FRONTEND_URL) return new URL(process.env.FRONTEND_URL).origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

function subscriptionCustomerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
}

function periodEndTimestamp(subscription: Stripe.Subscription) {
  return subscription.items.data.reduce((latest, item) => Math.max(latest, item.current_period_end), 0)
}

function serializeSubscription(subscription: Stripe.Subscription): SubscriptionStatus {
  const periodEnd = periodEndTimestamp(subscription)
  return {
    isPremium: premiumStatuses.has(subscription.status),
    status: subscription.status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  }
}

async function saveSubscription(userId: string, subscription: Stripe.Subscription) {
  const periodEnd = periodEndTimestamp(subscription)
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: subscriptionCustomerId(subscription),
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCheckoutSessionId: null,
      stripeCheckoutAttemptKey: null,
    },
  })
  return serializeSubscription(subscription)
}

function subscriptionIdFromSession(session: Stripe.Checkout.Session) {
  const subscription = session.subscription
  return typeof subscription === "string" ? subscription : subscription?.id ?? null
}

export async function startPremiumCheckout(req: Request, res: Response) {
  const userId = currentUserId(req)
  const stripe = stripeClient()
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeCheckoutSessionId: true,
      stripeCheckoutAttemptKey: true,
    },
  })
  if (!user) throw new HttpError("Conta não encontrada.", 404)

  if (user.stripeSubscriptionId) {
    const existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
    if (premiumStatuses.has(existingSubscription.status)) {
      await saveSubscription(userId, existingSubscription)
      throw new HttpError("Sua assinatura Premium já está ativa.", 409)
    }
    if (!restartableStatuses.has(existingSubscription.status)) {
      throw new HttpError("Há uma assinatura com pagamento pendente. Aguarde a atualização antes de iniciar outra.", 409)
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: null,
        subscriptionStatus: existingSubscription.status,
        subscriptionCurrentPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
      },
    })
  }

  if (user.stripeCheckoutSessionId) {
    const existingSession = await stripe.checkout.sessions.retrieve(user.stripeCheckoutSessionId)
    if (existingSession.status === "open" && existingSession.url) {
      return res.json({ url: existingSession.url })
    }
    if (existingSession.status === "complete") {
      const subscriptionId = subscriptionIdFromSession(existingSession)
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const ownerId = existingSession.metadata?.userId ?? existingSession.client_reference_id
        if (ownerId === userId) {
          await saveSubscription(userId, subscription)
          if (premiumStatuses.has(subscription.status)) {
            throw new HttpError("Sua assinatura Premium já está ativa.", 409)
          }
          if (!restartableStatuses.has(subscription.status)) {
            throw new HttpError("Há uma assinatura com pagamento pendente. Aguarde a atualização antes de iniciar outra.", 409)
          }
        }
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCheckoutSessionId: null, stripeCheckoutAttemptKey: null },
    })
    user = { ...user, stripeCheckoutSessionId: null, stripeCheckoutAttemptKey: null }
  }

  if (!user.stripeCheckoutAttemptKey) {
    await prisma.user.updateMany({
      where: { id: userId, stripeCheckoutAttemptKey: null },
      data: { stripeCheckoutAttemptKey: randomUUID() },
    })
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCheckoutSessionId: true,
        stripeCheckoutAttemptKey: true,
      },
    })
    if (!user) throw new HttpError("Conta não encontrada.", 404)
  }

  const attemptKey = user.stripeCheckoutAttemptKey ?? randomUUID()
  const origin = appOrigin()
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    line_items: [{
      price_data: {
        currency: "brl",
        unit_amount: 1990,
        recurring: { interval: "month" },
        product_data: {
          name: "Mentor Estudantil Premium",
          description: "Acesso ao Notebook e ao Estúdio de estudos.",
        },
      },
      quantity: 1,
    }],
    success_url: `${origin}/?premium=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?premium=cancelled`,
  }, { idempotencyKey: `premium-checkout-${userId}-${attemptKey}` })

  if (!session.url) throw new HttpError("Não foi possível iniciar o checkout. Tente novamente.", 502)
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCheckoutSessionId: session.id, stripeCheckoutAttemptKey: attemptKey },
  })
  return res.status(201).json({ url: session.url })
}

export async function confirmPremiumCheckout(req: Request, res: Response) {
  const userId = currentUserId(req)
  const { sessionId } = checkoutConfirmationSchema.parse(req.body)
  const stripe = stripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const ownerId = session.metadata?.userId ?? session.client_reference_id
  if (session.mode !== "subscription" || ownerId !== userId) {
    throw new HttpError("Esta sessão de checkout não pertence à sua conta.", 403)
  }
  if (session.status !== "complete" || !settledCheckoutStatuses.has(session.payment_status)) {
    throw new HttpError("O pagamento ainda está sendo confirmado. Tente novamente em instantes.", 409)
  }
  const subscriptionId = subscriptionIdFromSession(session)
  if (!subscriptionId) throw new HttpError("A assinatura ainda não foi criada. Tente novamente em instantes.", 409)
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  if (!premiumStatuses.has(subscription.status)) {
    throw new HttpError("O pagamento ainda está sendo confirmado. Tente novamente em instantes.", 409)
  }
  return res.json(await saveSubscription(userId, subscription))
}

export async function getPremiumSubscription(req: Request, res: Response) {
  const userId = currentUserId(req)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  })
  if (!user) throw new HttpError("Conta não encontrada.", 404)
  if (!user.stripeSubscriptionId) {
    return res.json({ isPremium: false, status: null, currentPeriodEnd: null, cancelAtPeriodEnd: false })
  }
  const subscription = await stripeClient().subscriptions.retrieve(user.stripeSubscriptionId)
  return res.json(await saveSubscription(userId, subscription))
}

export async function cancelPremiumSubscription(req: Request, res: Response) {
  const userId = currentUserId(req)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  })
  if (!user) throw new HttpError("Conta não encontrada.", 404)
  if (!user.stripeSubscriptionId) throw new HttpError("Não há uma assinatura Premium para cancelar.", 404)

  const stripe = stripeClient()
  const currentSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
  if (currentSubscription.cancel_at_period_end) {
    return res.json(await saveSubscription(userId, currentSubscription))
  }
  if (restartableStatuses.has(currentSubscription.status)) {
    return res.json(await saveSubscription(userId, currentSubscription))
  }

  const subscription = await stripe.subscriptions.update(currentSubscription.id, {
    cancel_at_period_end: true,
  }, { idempotencyKey: `premium-cancel-${currentSubscription.id}` })
  return res.json(await saveSubscription(userId, subscription))
}
