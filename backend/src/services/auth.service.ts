import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { HttpError } from "../lib/errors"

type PublicUser = { id: string; name: string; email: string }

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres.")
  }
  return secret
}

function createToken(user: PublicUser) {
  return jwt.sign({ email: user.email }, getJwtSecret(), {
    subject: user.id,
    expiresIn: "6h",
    issuer: "mentor-estudantil-api",
    audience: "mentor-estudantil-web",
  })
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } })
  if (existing) throw new HttpError("Não foi possível criar a conta com esses dados.", 409)

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true },
  })

  return { token: createToken(user), user }
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false

  if (!user || !passwordMatches) {
    throw new HttpError("E-mail ou senha incorretos.", 401)
  }

  const publicUser = { id: user.id, name: user.name, email: user.email }
  return { token: createToken(publicUser), user: publicUser }
}
