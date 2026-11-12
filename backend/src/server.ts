import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.development.local" })
loadEnv()

async function startServer() {
  const [{ default: app }, { prisma }] = await Promise.all([
    import("./app"),
    import("./lib/prisma"),
  ])
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
}

void startServer().catch((error) => {
  console.error("[api] Não foi possível iniciar o servidor.", error)
  process.exitCode = 1
})
