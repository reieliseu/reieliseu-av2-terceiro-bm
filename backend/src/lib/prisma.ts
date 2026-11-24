import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
let client: PrismaClient | undefined = globalForPrisma.prisma

// Build-time route discovery must not need database credentials or open connections.
export function getPrisma(): PrismaClient {
  if (client) return client
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("Configure DATABASE_URL no servidor.")
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

export async function disconnectPrisma() {
  if (client) await client.$disconnect()
}
