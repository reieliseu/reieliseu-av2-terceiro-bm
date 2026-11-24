import { Router } from "express"
import {
  cancelPremiumSubscription,
  confirmPremiumCheckout,
  getPremiumSubscription,
  startPremiumCheckout,
} from "../controllers/billing.controller"
import { requireAuth } from "../middleware/require-auth"

export const billingRouter = Router()

billingRouter.post("/checkout", requireAuth, startPremiumCheckout)
billingRouter.post("/confirm", requireAuth, confirmPremiumCheckout)
billingRouter.get("/subscription", requireAuth, getPremiumSubscription)
billingRouter.post("/cancel", requireAuth, cancelPremiumSubscription)
