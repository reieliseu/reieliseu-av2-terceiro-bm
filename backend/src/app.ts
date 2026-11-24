import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import { HttpError } from "./lib/errors"
import { errorHandler } from "./middleware/error-handler"
import { authRouter } from "./routes/auth.routes"
import { tasksRouter } from "./routes/tasks.routes"
import { frontendOrigin } from "../../lib/deployment"

const app = express()
const production = process.env.NODE_ENV === "production"
const allowedOrigins = new Set([
  frontendOrigin(process.env.FRONTEND_URL, production),
  ...(process.env.ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim())
    .filter(Boolean).map((origin) => frontendOrigin(origin, production)),
])

// Render terminates TLS at its reverse proxy. Keep disabled outside Render.
if (process.env.RENDER === "true") app.set("trust proxy", 1)

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
app.get("/api/v1/health", (_req, res) => res.json({ status: "ok", service: "mentor-estudantil-api" }))
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }))
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/tasks", tasksRouter)
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }))
app.use(errorHandler)

export default app
