import type { ErrorRequestHandler } from "express"
import { Prisma } from "../generated/prisma/client"
import { ZodError } from "zod"
import { HttpError } from "../lib/errors"

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Confira os dados enviados.",
      details: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    })
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return res.status(409).json({ error: "Já existe um cadastro com esses dados." })
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[api] Requisição falhou:", error)
  }
  return res.status(500).json({ error: "Ocorreu um erro. Tente novamente." })
}
