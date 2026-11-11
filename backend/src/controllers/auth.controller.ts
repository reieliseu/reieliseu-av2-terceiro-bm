import type { Request, Response } from "express"
import { loginSchema, registerSchema } from "../validators/auth"
import { loginUser, registerUser } from "../services/auth.service"
import { prisma } from "../lib/prisma"
import { HttpError } from "../lib/errors"

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)
  res.status(201).json(await registerUser(input))
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body)
  res.json(await loginUser(input))
}

export async function currentUser(req: Request, res: Response) {
  if (!req.userId) throw new HttpError("Sessão inválida.", 401)
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true },
  })
  if (!user) throw new HttpError("Conta não encontrada.", 404)
  res.json(user)
}
