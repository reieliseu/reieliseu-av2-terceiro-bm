import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { HttpError } from "../lib/errors"

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header("authorization")
  const [scheme, token] = authorization?.split(" ") ?? []

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError("Autenticação necessária.", 401))
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 32) throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres.")
    const payload = jwt.verify(token, secret, {
      issuer: "mentor-estudantil-api",
      audience: "mentor-estudantil-web",
    }) as JwtPayload
    if (!payload.sub) throw new Error("Token inválido.")
    req.userId = payload.sub
    return next()
  } catch {
    return next(new HttpError("Sessão inválida ou expirada. Entre novamente.", 401))
  }
}
