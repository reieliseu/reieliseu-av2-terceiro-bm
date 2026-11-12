export const API_BASE_URL = "/api/v1"

export type ApiError = Error & { status?: number }

export async function apiRequest<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o servidor está ativo.")
  }

  if (response.status === 204) return undefined as T
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error ?? "Não foi possível concluir a solicitação.") as ApiError
    error.status = response.status
    throw error
  }
  return payload as T
}

export type User = { id: string; name: string; email: string }
export type AuthResponse = { token: string; user: User }
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"
export type StudyTask = {
  id: string
  title: string
  description: string | null
  subject: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  parentId: string | null
  createdAt: string
  updatedAt: string
  parent: { id: string; title: string } | null
  _count: { subtasks: number }
}
