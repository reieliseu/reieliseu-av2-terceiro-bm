import type { Request, Response } from "express"
import { z } from "zod"
import { createTaskSchema, updateTaskSchema } from "../validators/tasks"
import { createTask, deleteTask, listTasks, updateTask } from "../services/tasks.service"

const filtersSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  subject: z.string().trim().max(100).optional(),
  q: z.string().trim().max(160).optional(),
})

function currentUserId(req: Request) {
  if (!req.userId) throw new Error("Sessão não encontrada.")
  return req.userId
}

export async function getTasks(req: Request, res: Response) {
  const filters = filtersSchema.parse(req.query)
  res.json(await listTasks(currentUserId(req), filters))
}

export async function postTask(req: Request, res: Response) {
  const input = createTaskSchema.parse(req.body)
  res.status(201).json(await createTask(currentUserId(req), input))
}

export async function patchTask(req: Request, res: Response) {
  const id = z.uuid().parse(req.params.id)
  const input = updateTaskSchema.parse(req.body)
  res.json(await updateTask(currentUserId(req), id, input))
}

export async function removeTask(req: Request, res: Response) {
  const id = z.uuid().parse(req.params.id)
  await deleteTask(currentUserId(req), id)
  res.status(204).end()
}
