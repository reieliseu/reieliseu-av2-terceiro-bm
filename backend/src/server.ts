import "dotenv/config"
import app from "./app"
import { prisma } from "./lib/prisma"

const port = Number(process.env.PORT ?? 4000)
const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("Configure JWT_SECRET com pelo menos 32 caracteres antes de iniciar a API.")
}

const server = app.listen(port, () => {
  console.info(`[api] API Express disponível na porta ${port}.`)
})

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)
