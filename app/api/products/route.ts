import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function GET() {
  const rows = await db.select().from(products)
  return NextResponse.json(rows)
}
