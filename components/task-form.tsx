"use client"

import { useState, type FormEvent } from "react"
import { LoaderCircle, X } from "lucide-react"
import type { StudyTask, TaskPriority } from "@/lib/api"

export type TaskInput = {
  title: string
  description: string | null
  subject: string
  priority: TaskPriority
  dueDate: string | null
  parentId: string | null
}

type TaskFormProps = {
  tasks: StudyTask[]
  editingTask: StudyTask | null
  onClose: () => void
  onSave: (input: TaskInput, taskId?: string) => Promise<void>
}

export function TaskForm({ tasks, editingTask, onClose, onSave }: TaskFormProps) {
  const [title, setTitle] = useState(editingTask?.title ?? "")
  const [description, setDescription] = useState(editingTask?.description ?? "")
  const [subject, setSubject] = useState(editingTask?.subject ?? "")
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority ?? "MEDIUM")
  const [dueDate, setDueDate] = useState(editingTask?.dueDate?.slice(0, 10) ?? "")
  const [parentId, setParentId] = useState(editingTask?.parentId ?? "")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        subject: subject.trim(),
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
        parentId: parentId || null,
      }, editingTask?.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar a tarefa.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Organize sua jornada</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950" id="task-form-title">{editingTask ? "Editar tarefa" : "Nova tarefa"}</h2>
            <p className="mt-1 text-sm text-slate-600">Defina o que vai estudar e acompanhe seu progresso.</p>
          </div>
          <button className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" type="button" aria-label="Fechar formulário" onClick={onClose}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-800">
            Título da tarefa
            <input autoFocus className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Ex.: Revisar anotações de matemática" required />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-800">
              Matéria ou tema
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={100} placeholder="Ex.: Matemática" required />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Prioridade
              <select className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-800">
            Descrição <span className="font-normal text-slate-500">(opcional)</span>
            <textarea className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2500} placeholder="Anotações, capítulos ou etapas para concluir..." />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-800">
              Prazo <span className="font-normal text-slate-500">(opcional)</span>
              <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Vincular a outra tarefa <span className="font-normal text-slate-500">(opcional)</span>
              <select className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" value={parentId} onChange={(event) => setParentId(event.target.value)}>
                <option value="">Nenhuma</option>
                {tasks.filter((task) => task.id !== editingTask?.id && task.status !== "COMPLETED").map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
              </select>
            </label>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button className="h-11 rounded-xl border border-slate-200 px-5 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" type="button" onClick={onClose}>Cancelar</button>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-60" type="submit" disabled={isSaving}>
              {isSaving && <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />}
              {editingTask ? "Salvar alterações" : "Criar tarefa"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
