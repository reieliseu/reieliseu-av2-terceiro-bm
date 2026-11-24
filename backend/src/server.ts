import { config as loadEnv } from "dotenv"

loadEnv()

async function startServer() {
  const [{ default: app }, { disconnectPrisma }] = await Promise.all([
    import("./app"),
    import("./lib/prisma"),
  ])
  const port = Number(process.env.PORT ?? 4000)
  const jwtSecret = process.env.JWT_SECRET

  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT inválida.")
  if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL antes de iniciar a API.")

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("Configure JWT_SECRET com pelo menos 32 caracteres antes de iniciar a API.")
  }

  const server = app.listen(port, "0.0.0.0", () => {
    console.info(`[api] API Express disponível na porta ${port}.`)
  })

  async function shutdown() {
    server.close(async () => {
      await disconnectPrisma()
      process.exit(0)
    })
  }

  process.once("SIGINT", shutdown)
  process.once("SIGTERM", shutdown)
}

void startServer().catch(() => {
  console.error("[api] Não foi possível iniciar o servidor. Confira as variáveis e a configuração da API.")
  process.exitCode = 1
})
