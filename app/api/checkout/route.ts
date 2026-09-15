import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { eq, inArray } from 'drizzle-orm'
import { orderItems, orders, products } from '@/lib/db/schema'

export async function POST(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Stripe não está configurado neste ambiente.' }, { status: 503 })
    const stripe = new Stripe(secretKey)
    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items : []
    const customer = body.customer ?? {}

    const nome = typeof customer.nome === 'string' ? customer.nome.trim() : ''
    const email = typeof customer.email === 'string' ? customer.email.trim().toLowerCase() : ''
    const telefone = typeof customer.telefone === 'string' ? customer.telefone.trim() : ''
    if (!items.length || !nome || !telefone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || nome.length > 120 || telefone.length > 30) {
      return NextResponse.json({ error: 'Dados do pedido incompletos ou inválidos.' }, { status: 400 })
    }

    const normalizedItems = items.map((item: { id: number; quantidade: number }) => ({ id: Number(item.id), quantidade: Number(item.quantidade) }))
    if (normalizedItems.some((item) => !Number.isInteger(item.id) || !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 10)) {
      return NextResponse.json({ error: 'Produto ou quantidade inválida.' }, { status: 400 })
    }
    const productIds = [...new Set(normalizedItems.map((item) => item.id))]
    const databaseProducts = await db.select().from(products).where(inArray(products.id, productIds))
    const productMap = new Map(databaseProducts.map((product) => [product.id, product]))
    if (databaseProducts.length !== productIds.length || databaseProducts.some((product) => product.priceCents < 1)) {
      return NextResponse.json({ error: 'Um ou mais produtos não estão disponíveis.' }, { status: 400 })
    }
    const validatedItems = normalizedItems.map((item) => {
      const produto = productMap.get(item.id)
      if (!produto) throw new Error('Produto não encontrado.')
      return { id: produto.id, quantidade: item.quantidade, nome: produto.title, preco: produto.priceCents }
    })
    const totalCents = validatedItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
    const [order] = await db.insert(orders).values({ customerName: nome, customerEmail: email, customerPhone: telefone, totalCents, paymentMethod: body.paymentMethod === 'pix' ? 'pix' : 'cartao' }).returning({ id: orders.id })
    await db.insert(orderItems).values(validatedItems.map((item) => ({ orderId: order.id, productId: item.id, title: item.nome, unitPriceCents: item.preco, quantity: item.quantidade })))

    const lineItems = validatedItems.map((item) => ({
      price_data: {
        currency: 'brl',
        product_data: { name: item.nome },
        unit_amount: item.preco,
      },
      quantity: item.quantidade,
    }))

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: email,
      phone_number_collection: { enabled: true },
      automatic_payment_methods: { enabled: true },
      success_url: `${origin}/?pagamento=sucesso`,
      cancel_url: `${origin}/?pagamento=cancelado`,
      metadata: { nome: nome.slice(0, 100), telefone: telefone.slice(0, 30), pagamento: body.paymentMethod === 'pix' ? 'pix' : 'cartao', order_id: order.id },
      integration_identifier: `colportagem_stor_${Math.random().toString(36).slice(2, 10)}`,
    })

    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))
    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível criar o checkout.' }, { status: 500 })
  }
}
