"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, BookOpen, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react"
import { apiRequest, type AuthResponse } from "@/lib/api"

type AuthPanelProps = {
  notice?: string
  onAuthenticated: (auth: AuthResponse) => void
}

export function AuthPanel({ notice, onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      const route = mode === "login" ? "/auth/login" : "/auth/register"
      const auth = await apiRequest<AuthResponse>(route, undefined, {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
      })
      onAuthenticated(auth)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f8ff] px-5 py-12 text-slate-950">
      <section className="w-full max-w-[460px]" aria-labelledby="auth-title">
        <div className="mb-10 flex items-center justify-center gap-3 text-blue-800">
          <span className="grid size-11 place-items-center rounded-2xl bg-blue-700 text-white shadow-sm">
            <BookOpen size={21} aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block text-xs font-bold uppercase tracking-[0.22em]">Mentor estudantil</span>
            <span className="mt-1 block text-xs text-slate-500">Sua jornada, um passo por vez</span>
          </span>
        </div>

        <div className="rounded-[28px] border border-blue-100 bg-white p-7 shadow-[0_24px_70px_-42px_rgba(30,64,175,0.38)] sm:p-10">
          <div className="mb-8 text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-blue-700">Área do estudante</p>
            <h1 id="auth-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {mode === "login" ? "Bem-vindo de volta." : "Crie sua conta."}
            </h1>
            <p className="mt-3 leading-relaxed text-slate-600">
              {mode === "login"
                ? "Entre para acessar suas aulas, cursos e trilhas de aprendizado."
                : "Organize seus estudos e acompanhe cada conquista."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            {mode === "register" && (
              <label className="block text-left text-sm font-medium text-slate-800">
                Nome
                <span className="relative mt-2 block">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                  <input
                    className="h-12 w-full rounded-2xl border border-blue-200 bg-white pl-11 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    autoComplete="name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Seu nome"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </span>
              </label>
            )}

            <label className="block text-left text-sm font-medium text-slate-800">
              E-mail
              <span className="relative mt-2 block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                <input
                  className="h-12 w-full rounded-2xl border border-blue-200 bg-white pl-11 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  autoComplete="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  maxLength={254}
                  required
                />
              </span>
            </label>

            <label className="block text-left text-sm font-medium text-slate-800">
              Senha
              <span className="relative mt-2 block">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                <input
                  className="h-12 w-full rounded-2xl border border-blue-200 bg-white pl-11 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  minLength={mode === "register" ? 8 : 1}
                  maxLength={128}
                  required
                />
              </span>
            </label>

            {notice && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{notice}</p>}
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <>{mode === "login" ? "Entrar" : "Criar conta"}<ArrowRight size={17} aria-hidden="true" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}{" "}
            <button
              className="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login")
                setError("")
              }}
            >
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
