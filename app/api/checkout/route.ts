import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { orderItems, orders } from '@/lib/db/schema'

const produtos = new Map([
  [1, { nome: 'O Colportor de Sucesso', preco: 4990 }],
  [2, { nome: 'Conversas que Inspiram', preco: 2490 }],
  [3, { nome: 'Colportagem na Prática', preco: 8990 }],
  [4, { nome: 'Comunicação e Propósito', preco: 6990 }],
  [5, { nome: 'Manual de Vendas com Propósito', preco: 5990 }],
  [6, { nome: 'Jornada do Novo Colportor', preco: 11990 }],
])

export async function POST(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: 'Stripe não está configurado neste ambiente.' }, { status: 503 })
    const stripe = new Stripe(secretKey)
    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items : []
    const customer = body.customer ?? {}

    if (!items.length || !customer.nome || !customer.email || !customer.telefone) {
      return NextResponse.json({ error: 'Dados do pedido incompletos.' }, { status: 400 })
    }

    const validatedItems = items.map((item: { id: number; quantidade: number }) => {
      const produto = produtos.get(Number(item.id))
      const quantidade = Number(item.quantidade)
      if (!produto || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) throw new Error('Produto ou quantidade inválida.')
      return { id: Number(item.id), quantidade, ...produto }
    })
    const totalCents = validatedItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
    const [order] = await db.insert(orders).values({ customerName: String(customer.nome), customerEmail: String(customer.email), customerPhone: String(customer.telefone), totalCents, paymentMethod: body.paymentMethod === 'pix' ? 'pix' : 'cartao' }).returning({ id: orders.id })
    await db.insert(orderItems).values(validatedItems.map((item) => ({ orderId: order.id, productId: item.id, title: item.nome, unitPriceCents: item.preco, quantity: item.quantidade })))

    const lineItems = validatedItems.map((item) => {
      const produto = produtos.get(Number(item.id))
      const quantidade = Number(item.quantidade)
      if (!produto || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) throw new Error('Produto ou quantidade inválida.')
      return {
        price_data: {
          currency: 'brl',
          product_data: { name: produto.nome },
          unit_amount: produto.preco,
        },
        quantity: quantidade,
      }
    })

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email,
      phone_number_collection: { enabled: true },
      automatic_payment_methods: { enabled: true },
      success_url: `${origin}/?pagamento=sucesso`,
      cancel_url: `${origin}/?pagamento=cancelado`,
      metadata: { nome: String(customer.nome).slice(0, 100), telefone: String(customer.telefone).slice(0, 30), pagamento: body.paymentMethod === 'pix' ? 'pix' : 'cartao' },
      integration_identifier: `colportagem_stor_${Math.random().toString(36).slice(2, 10)}`,
    })

    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))
    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível criar o checkout.' }, { status: 500 })
  }
}
