import { z } from "zod"

const taskFields = {
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2500).nullable().optional(),
  subject: z.string().trim().min(1).max(100),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.iso.datetime({ offset: true }).nullable().optional(),
  parentId: z.uuid().nullable().optional(),
}

export const createTaskSchema = z.object({
  title: taskFields.title,
  description: taskFields.description,
  subject: taskFields.subject,
  status: taskFields.status.optional().default("PENDING"),
  priority: taskFields.priority.optional().default("MEDIUM"),
  dueDate: taskFields.dueDate,
  parentId: taskFields.parentId,
})

export const updateTaskSchema = z.object(taskFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Informe ao menos um campo para atualizar.",
)
