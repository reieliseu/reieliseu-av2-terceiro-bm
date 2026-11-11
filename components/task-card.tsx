"use client"

import { useState } from "react"
import { CalendarDays, Check, Circle, Clock3, Pencil, Trash2 } from "lucide-react"
import type { StudyTask, TaskStatus } from "@/lib/api"

const statusLabels: Record<TaskStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
}

const priorityLabels = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta" } as const

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: StudyTask
  onStatusChange: (task: StudyTask, status: TaskStatus) => Promise<void>
  onEdit: (task: StudyTask) => void
  onDelete: (task: StudyTask) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState("")
  const isComplete = task.status === "COMPLETED"

  async function changeStatus(status: TaskStatus) {
    setBusy(true)
    setActionError("")
    try {
      await onStatusChange(task, status)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Não foi possível alterar o status.")
    } finally {
      setBusy(false)
    }
  }

  async function deleteTask() {
    if (!window.confirm(`Excluir “${task.title}”?`)) return
    setBusy(true)
    setActionError("")
    try {
      await onDelete(task)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Não foi possível excluir a tarefa.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={`rounded-2xl border bg-white p-5 transition ${isComplete ? "border-slate-100 opacity-75" : "border-slate-200 hover:border-blue-200 hover:shadow-sm"}`}>
      <div className="flex items-start gap-4">
        <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${isComplete ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`} aria-hidden="true">
          {isComplete ? <Check size={19} /> : <Circle size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className={`font-semibold text-slate-900 ${isComplete ? "line-through decoration-slate-400" : ""}`}>{task.title}</h3>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">{task.subject}</span>
          </div>
          {task.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{task.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} aria-hidden="true" /> Prioridade {priorityLabels[task.priority]}</span>
            {task.dueDate && <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" /> Prazo {new Date(task.dueDate).toLocaleDateString("pt-BR")}</span>}
            {task.parent && <span>Subtarefa de {task.parent.title}</span>}
            {task._count.subtasks > 0 && <span>{task._count.subtasks} tarefa(s) vinculada(s)</span>}
          </div>
          {actionError && <p className="mt-3 text-sm text-rose-700" role="alert">{actionError}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <label className="sr-only" htmlFor={`status-${task.id}`}>Status de {task.title}</label>
          <select
            id={`status-${task.id}`}
            className="max-w-32 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={task.status}
            disabled={busy}
            onChange={(event) => void changeStatus(event.target.value as TaskStatus)}
          >
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50" type="button" aria-label={`Editar ${task.title}`} disabled={busy} onClick={() => onEdit(task)}>
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:opacity-50" type="button" aria-label={`Excluir ${task.title}`} disabled={busy} onClick={() => void deleteTask()}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
