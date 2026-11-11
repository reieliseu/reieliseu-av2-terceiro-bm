import { Router } from "express"
import { currentUser, login, register } from "../controllers/auth.controller"
import { requireAuth } from "../middleware/require-auth"
import { authLimiter } from "../middleware/rate-limit"

export const authRouter = Router()

authRouter.post("/register", authLimiter, register)
authRouter.post("/login", authLimiter, login)
authRouter.get("/me", requireAuth, currentUser)
