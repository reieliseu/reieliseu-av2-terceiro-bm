import { Prisma } from "../generated/prisma/client"
import { prisma } from "../lib/prisma"
import { HttpError } from "../lib/errors"

const taskSelect = {
  id: true,
  title: true,
  description: true,
  subject: true,
  status: true,
  priority: true,
  dueDate: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  parent: { select: { id: true, title: true } },
  _count: { select: { subtasks: true } },
} satisfies Prisma.StudyTaskSelect

type TaskInput = {
  title?: string
  description?: string | null
  subject?: string
  status?: string
  priority?: string
  dueDate?: string | null
  parentId?: string | null
}

async function validateParent(userId: string, taskId: string | undefined, parentId: string | null | undefined) {
  if (parentId === undefined || parentId === null) return
  if (parentId === taskId) throw new HttpError("Uma tarefa não pode ser subtarefa dela mesma.", 422)

  let ancestor = await prisma.studyTask.findFirst({
    where: { id: parentId, userId },
    select: { id: true, parentId: true, status: true },
  })
  if (!ancestor) throw new HttpError("A tarefa vinculada não existe.", 404)
  if (ancestor.status === "COMPLETED") {
    throw new HttpError("Não é possível vincular uma tarefa pendente a uma tarefa concluída.", 409)
  }

  const visited = new Set<string>()
  while (ancestor) {
    if (ancestor.id === taskId) throw new HttpError("Esse vínculo criaria um ciclo entre tarefas.", 422)
    if (visited.has(ancestor.id)) throw new HttpError("A hierarquia atual contém um ciclo.", 409)
    visited.add(ancestor.id)
    if (!ancestor.parentId) break
    ancestor = await prisma.studyTask.findFirst({
      where: { id: ancestor.parentId, userId },
      select: { id: true, parentId: true, status: true },
    })
  }
}

function mapInput(input: TaskInput) {
  return {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.subject !== undefined && { subject: input.subject }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
    ...(input.parentId !== undefined && { parentId: input.parentId }),
  }
}

export async function listTasks(userId: string, filters: { status?: string; subject?: string; q?: string }) {
  return prisma.studyTask.findMany({
    where: {
      userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.subject && { subject: { equals: filters.subject, mode: "insensitive" as const } }),
      ...(filters.q && {
        OR: [
          { title: { contains: filters.q, mode: "insensitive" as const } },
          { subject: { contains: filters.q, mode: "insensitive" as const } },
        ],
      }),
    },
    select: taskSelect,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  })
}

export async function createTask(userId: string, input: TaskInput & { title: string; subject: string; status: string; priority: string }) {
  await validateParent(userId, undefined, input.parentId)
  return prisma.studyTask.create({
    data: { ...mapInput(input), userId },
    select: taskSelect,
  })
}

export async function updateTask(userId: string, id: string, input: TaskInput) {
  const current = await prisma.studyTask.findFirst({ where: { id, userId }, select: { id: true } })
  if (!current) throw new HttpError("Tarefa não encontrada.", 404)

  if (input.parentId !== undefined) await validateParent(userId, id, input.parentId)

  if (input.status === "COMPLETED") {
    const pendingChildren = await prisma.studyTask.count({
      where: { userId, parentId: id, status: { not: "COMPLETED" } },
    })
    if (pendingChildren > 0) {
      throw new HttpError("Conclua as tarefas vinculadas antes de finalizar esta tarefa.", 409)
    }
  }

  return prisma.studyTask.update({
    where: { id },
    data: mapInput(input),
    select: taskSelect,
  })
}

export async function deleteTask(userId: string, id: string) {
  const current = await prisma.studyTask.findFirst({
    where: { id, userId },
    select: { id: true, _count: { select: { subtasks: true } } },
  })
  if (!current) throw new HttpError("Tarefa não encontrada.", 404)
  if (current._count.subtasks > 0) {
    throw new HttpError("Mova ou exclua as tarefas vinculadas antes de excluir esta tarefa.", 409)
  }
  await prisma.studyTask.delete({ where: { id } })
}
