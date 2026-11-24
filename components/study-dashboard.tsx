"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { BookOpen, CalendarDays, CheckCheck, CirclePlus, Eye, GraduationCap, LayoutDashboard, ListTodo, LoaderCircle, LogOut, NotebookPen, Search, TrendingUp } from "lucide-react"
import { apiRequest, API_BASE_URL, type ApiError, type AuthResponse, type StudyTask, type TaskStatus, type User } from "@/lib/api"
import { AuthPanel } from "@/components/auth-panel"
import { TaskCard } from "@/components/task-card"
import { TaskForm, type TaskInput } from "@/components/task-form"

type Filter = "ALL" | TaskStatus

const filters: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "PENDING", label: "Pendentes" },
  { id: "IN_PROGRESS", label: "Em andamento" },
  { id: "COMPLETED", label: "Concluídas" },
]

function createDemoTasks(): StudyTask[] {
  const now = new Date()
  const timestamp = now.toISOString()
  const dueDate = (daysAhead: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() + daysAhead)
    return date.toISOString()
  }

  return [
    {
      id: "visitor-task-1",
      title: "Revisar funções e gráficos",
      description: "Refaça os exercícios principais e anote as dúvidas para a próxima aula.",
      subject: "Matemática",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: dueDate(2),
      parentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      parent: null,
      _count: { subtasks: 2 },
    },
    {
      id: "visitor-task-2",
      title: "Ler capítulo sobre ecossistemas",
      description: "Leia o capítulo e destaque os conceitos mais importantes.",
      subject: "Biologia",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: dueDate(4),
      parentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      parent: null,
      _count: { subtasks: 0 },
    },
    {
      id: "visitor-task-3",
      title: "Preparar resumo de história",
      description: "Resumo sobre o período estudado nesta semana.",
      subject: "História",
      status: "COMPLETED",
      priority: "LOW",
      dueDate: null,
      parentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      parent: null,
      _count: { subtasks: 0 },
    },
  ]
}

export function StudyDashboard() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [demoTasks, setDemoTasks] = useState<StudyTask[]>([])
  const [isReady, setIsReady] = useState(false)
  const [filter, setFilter] = useState<Filter>("ALL")
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query.trim())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null)
  const [mutationError, setMutationError] = useState("")
  const [authNotice, setAuthNotice] = useState("")

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem("study-access-token")
    if (!storedToken) {
      setIsReady(true)
      return
    }
    setToken(storedToken)
    apiRequest<User>("/auth/me", storedToken)
      .then(setUser)
      .catch((cause) => {
        window.sessionStorage.removeItem("study-access-token")
        setToken(null)
        setAuthNotice(cause instanceof Error ? cause.message : "Não foi possível validar sua sessão.")
      })
      .finally(() => setIsReady(true))
  }, [])

  const taskPath = useMemo(() => {
    const params = new URLSearchParams()
    if (filter !== "ALL") params.set("status", filter)
    if (deferredQuery) params.set("q", deferredQuery)
    const suffix = params.size ? `?${params.toString()}` : ""
    return `${API_BASE_URL}/tasks${suffix}`
  }, [filter, deferredQuery])

  const { data: accountTasks = [], error: loadError, isLoading, mutate } = useSWR(
    token ? [taskPath, token] as const : null,
    ([url, bearer]) => apiRequest<StudyTask[]>(url.slice(API_BASE_URL.length), bearer),
  )
  const filteredDemoTasks = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase()
    return demoTasks.filter((task) => {
      const matchesStatus = filter === "ALL" || task.status === filter
      const searchableText = `${task.title} ${task.subject} ${task.description ?? ""}`.toLowerCase()
      return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [demoTasks, deferredQuery, filter])
  const tasks = isGuest ? filteredDemoTasks : accountTasks
  const isTasksLoading = !isGuest && isLoading

  function authenticate(auth: AuthResponse) {
    window.sessionStorage.setItem("study-access-token", auth.token)
    setIsGuest(false)
    setDemoTasks([])
    setToken(auth.token)
    setUser(auth.user)
    setAuthNotice("")
  }

  function enterGuestMode() {
    setToken(null)
    setUser(null)
    setDemoTasks(createDemoTasks())
    setIsGuest(true)
    setAuthNotice("")
  }

  function signOut() {
    window.sessionStorage.removeItem("study-access-token")
    setToken(null)
    setUser(null)
    setIsGuest(false)
    setDemoTasks([])
    setMutationError("")
    setAuthNotice("")
  }

  useEffect(() => {
    if (!token || (loadError as ApiError | undefined)?.status !== 401) return
    signOut()
    setAuthNotice("Sua sessão expirou. Entre novamente para continuar.")
  }, [loadError, token])

  async function saveTask(input: TaskInput, taskId?: string) {
    if (!token) return
    setMutationError("")
    await apiRequest<StudyTask>(taskId ? `/tasks/${taskId}` : "/tasks", token, {
      method: taskId ? "PATCH" : "POST",
      body: JSON.stringify(input),
    })
    await mutate()
    setEditingTask(null)
    setIsFormOpen(false)
  }

  async function changeStatus(task: StudyTask, status: TaskStatus) {
    if (!token) return
    setMutationError("")
    try {
      await apiRequest<StudyTask>(`/tasks/${task.id}`, token, { method: "PATCH", body: JSON.stringify({ status }) })
      await mutate()
    } catch (cause) {
      setMutationError(cause instanceof Error ? cause.message : "Não foi possível alterar o status.")
      throw cause
    }
  }

  async function deleteTask(task: StudyTask) {
    if (!token) return
    setMutationError("")
    try {
      await apiRequest<void>(`/tasks/${task.id}`, token, { method: "DELETE" })
      await mutate()
    } catch (cause) {
      setMutationError(cause instanceof Error ? cause.message : "Não foi possível excluir a tarefa.")
      throw cause
    }
  }

  if (!isReady) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f8ff]"><LoaderCircle className="animate-spin text-blue-700" size={28} aria-label="Carregando sessão" /></main>
  }

  if ((!token || !user) && !isGuest) {
    return <AuthPanel notice={authNotice} onAuthenticated={authenticate} onGuestAccess={enterGuestMode} />
  }

  const displayName = isGuest ? "Visitante" : user?.name ?? ""
  const displayEmail = isGuest ? "Acesso de demonstração" : user?.email ?? ""
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length
  const pendingCount = tasks.filter((task) => task.status === "PENDING").length
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <main className="min-h-screen bg-[#f4f8ff] text-slate-950">
      <header className="border-b border-blue-100 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#inicio" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-700 text-white"><BookOpen size={20} aria-hidden="true" /></span>
            <span><span className="block text-xs font-bold uppercase tracking-[0.2em] text-blue-800">Mentor estudantil</span><span className="mt-0.5 block text-xs text-slate-500">Organizador de estudos</span></span>
          </a>
          <div className="flex items-center gap-3">
            <Link href="/notebook" className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" aria-label="Abrir Notebook">
              <NotebookPen size={16} aria-hidden="true" />
              <span>Notebook</span>
            </Link>
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-900">Olá, {displayName}</p><p className="text-xs text-slate-500">{displayEmail}</p></div>
            {isGuest && <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 sm:inline-flex">Modo visitante</span>}
            <button aria-label={isGuest ? "Sair da demonstração" : "Sair da conta"} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" type="button" onClick={signOut}><LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">{isGuest ? "Sair da demonstração" : "Sair"}</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="hidden lg:block" aria-label="Navegação principal">
          <div className="sticky top-8">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Seu espaço</p>
            <nav className="space-y-1">
              <a href="#inicio" className="flex h-11 items-center gap-3 rounded-xl bg-blue-50 px-3 text-sm font-semibold text-blue-800"><LayoutDashboard size={18} aria-hidden="true" /> Visão geral</a>
              <a href="#tarefas" className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-blue-800"><ListTodo size={18} aria-hidden="true" /> {isGuest ? "Tarefas de exemplo" : "Minhas tarefas"}</a>
              <a href="#progresso" className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-blue-800"><TrendingUp size={18} aria-hidden="true" /> Meu progresso</a>
            </nav>
            <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-4">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700"><GraduationCap size={18} aria-hidden="true" /></span>
              <p className="mt-3 text-sm font-semibold text-slate-900">Um passo de cada vez</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Pequenas sessões de estudo constroem grandes resultados.</p>
            </div>
          </div>
        </aside>

        <section id="inicio" className="min-w-0">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-blue-700">Seu painel</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Organize seus estudos.</h1>
              <p className="mt-2 max-w-2xl text-slate-600">Planeje tarefas, acompanhe prazos e avance no seu ritmo.</p>
            </div>
            {!isGuest && <button className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" type="button" onClick={() => { setEditingTask(null); setIsFormOpen(true) }}><CirclePlus size={18} aria-hidden="true" /> Nova tarefa</button>}
          </div>

          {isGuest && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
              <Eye className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              <p><span className="font-semibold">Demonstração somente leitura.</span> As tarefas são exemplos e nenhuma alteração será salva.</p>
            </div>
          )}


          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo de tarefas">
            <StatCard label="Tarefas no filtro" value={tasks.length} icon={<ListTodo size={18} />} tone="blue" />
            <StatCard label="Pendentes" value={pendingCount} icon={<CalendarDays size={18} />} tone="amber" />
            <StatCard label="Em andamento" value={inProgressCount} icon={<TrendingUp size={18} />} tone="violet" />
            <StatCard label="Concluídas" value={completedCount} icon={<CheckCheck size={18} />} tone="green" />
          </section>

          <section id="progresso" className="mt-5 rounded-2xl border border-blue-100 bg-white p-5 sm:p-6" aria-labelledby="progress-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 id="progress-title" className="font-semibold text-slate-900">Progresso da sua jornada</h2><p className="mt-1 text-sm text-slate-500">Continue avançando, tarefa por tarefa.</p></div>
              <span className="text-lg font-semibold text-blue-800">{progress}%</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progresso das tarefas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </section>

          <section id="tarefas" className="mt-9" aria-labelledby="tasks-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div><h2 id="tasks-title" className="text-xl font-semibold tracking-tight text-slate-950">{isGuest ? "Tarefas de exemplo" : "Minhas tarefas"}</h2><p className="mt-1 text-sm text-slate-500">Uma lista clara para manter o foco.</p></div>
              <label className="relative block w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                <span className="sr-only">Buscar tarefa ou matéria</span>
                <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefa ou matéria" />
              </label>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar tarefas por status">
              {filters.map((item) => <button key={item.id} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${filter === item.id ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-800"}`} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
            </div>

            {!isGuest && (mutationError || loadError) && <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{mutationError || loadError?.message}</p>}

            {isTasksLoading ? (
              <div className="mt-5 flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500"><LoaderCircle className="animate-spin" size={22} aria-label="Carregando tarefas" /></div>
            ) : tasks.length ? (
              <div className="mt-4 space-y-3">
                {tasks.map((task) => <TaskCard key={task.id} task={task} onStatusChange={changeStatus} onEdit={(selected) => { setEditingTask(selected); setIsFormOpen(true) }} onDelete={deleteTask} readOnly={isGuest} />)}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-white px-6 py-14 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><BookOpen size={22} aria-hidden="true" /></span>
                <h3 className="mt-4 font-semibold text-slate-900">{deferredQuery ? "Nenhuma tarefa encontrada" : "Seu próximo passo começa aqui"}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{deferredQuery ? "Experimente outra busca ou mude o filtro." : "Crie sua primeira tarefa para organizar matérias, prazos e metas de estudo."}</p>
                {!deferredQuery && !isGuest && <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" type="button" onClick={() => { setEditingTask(null); setIsFormOpen(true) }}><CirclePlus size={17} aria-hidden="true" /> Criar primeira tarefa</button>}
              </div>
            )}
          </section>
        </section>
      </div>

      {isFormOpen && !isGuest && <TaskForm tasks={tasks} editingTask={editingTask} onClose={() => { setIsFormOpen(false); setEditingTask(null) }} onSave={saveTask} />}
    </main>
  )
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "blue" | "amber" | "violet" | "green" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
  }
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-600">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`} aria-hidden="true">{icon}</span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p></div>
}
