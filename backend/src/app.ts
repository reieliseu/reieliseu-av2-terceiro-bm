import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import { HttpError } from "./lib/errors"
import { errorHandler } from "./middleware/error-handler"
import { authRouter } from "./routes/auth.routes"
import { billingRouter } from "./routes/billing.routes"
import { tasksRouter } from "./routes/tasks.routes"

const app = express()
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, ...(process.env.ALLOWED_ORIGINS ?? "").split(","), "http://localhost:3000"]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin)),
)

app.disable("x-powered-by")
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new HttpError("Origem não autorizada.", 403))
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.json({ limit: "16kb" }))
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }))

app.get("/api/v1/health", (_req, res) => res.json({ status: "ok", service: "mentor-estudantil-api" }))
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/billing", billingRouter)
app.use("/api/v1/tasks", tasksRouter)
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }))
app.use(errorHandler)

export default app
