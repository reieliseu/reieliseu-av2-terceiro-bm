import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { db } from '@/lib/db'
import { eq, inArray } from 'drizzle-orm'
import { orderItems, orders, products } from '@/lib/db/schema'

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.coerce.number().int().positive(),
    quantidade: z.coerce.number().int().min(1).max(10),
  })).min(1).max(10),
  customer: z.object({
    nome: z.string().trim().min(1).max(120),
    email: z.email().trim().max(254),
    telefone: z.string().trim().min(1).max(30),
  }),
  paymentMethod: z.enum(['pix', 'cartao']).optional(),
})

export async function POST(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Stripe não está configurado neste ambiente.' }, { status: 503 })

    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Dados do pedido incompletos ou inválidos.' }, { status: 400 })

    const { items, customer, paymentMethod } = parsed.data
    if (items.reduce((total, item) => total + item.quantidade, 0) > 10) {
      return NextResponse.json({ error: 'O pedido pode conter no máximo 10 unidades.' }, { status: 400 })
    }

    const nome = customer.nome
    const email = customer.email.toLowerCase()
    const telefone = customer.telefone
    const stripe = new Stripe(secretKey)
    const productIds = [...new Set(items.map((item) => item.id))]
    const databaseProducts: (typeof products.$inferSelect)[] = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds))

    const productMap = new Map<number, typeof products.$inferSelect>(databaseProducts.map((product) => [product.id, product]))
    if (databaseProducts.length !== productIds.length || databaseProducts.some((product) => product.priceCents < 1)) {
      return NextResponse.json({ error: 'Um ou mais produtos não estão disponíveis.' }, { status: 400 })
    }

    const validatedItems = items.map((item) => {
      const product = productMap.get(item.id)
      if (!product) throw new Error('Produto não encontrado.')
      return { id: product.id, quantidade: item.quantidade, nome: product.title, preco: product.priceCents }
    })
    const totalCents = validatedItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
    const [order] = await db.insert(orders).values({
      customerName: nome,
      customerEmail: email,
      customerPhone: telefone,
      totalCents,
      paymentMethod: paymentMethod === 'pix' ? 'pix' : 'cartao',
    }).returning({ id: orders.id })

    if (!order) throw new Error('Não foi possível registrar o pedido.')

    await db.insert(orderItems).values(validatedItems.map((item) => ({
      orderId: order.id,
      productId: item.id,
      title: item.nome,
      unitPriceCents: item.preco,
      quantity: item.quantidade,
    })))

    const lineItems = validatedItems.map((item) => ({
      price_data: {
        currency: 'brl',
        product_data: { name: item.nome },
        unit_amount: item.preco,
      },
      quantity: item.quantidade,
    }))

    const origin = process.env.FRONTEND_URL ?? 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: email,
      phone_number_collection: { enabled: true },
      success_url: `${origin}/?pagamento=sucesso`,
      cancel_url: `${origin}/?pagamento=cancelado`,
      metadata: { nome: nome.slice(0, 100), telefone: telefone.slice(0, 30), pagamento: paymentMethod ?? 'cartao', order_id: order.id },
    }, { idempotencyKey: `checkout-order-${order.id}` })

    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))
    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('[checkout] Falha ao criar sessão:', error)
    return NextResponse.json({ error: 'Não foi possível criar o checkout.' }, { status: 500 })
  }
}
