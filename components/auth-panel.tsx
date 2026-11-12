"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, BookOpen, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react"
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
  const [registrationStep, setRegistrationStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (mode === "register" && registrationStep < 3) {
      if (!event.currentTarget.reportValidity()) return
      setError("")
      setShowPassword(false)
      setRegistrationStep((current) => current + 1)
      return
    }

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
                ? "Entre para organizar tarefas, acompanhar prazos e retomar seu plano de estudos."
                : registrationStep === 1
                  ? "Vamos começar pelo seu nome."
                  : registrationStep === 2
                    ? "Agora, informe o e-mail que usará para entrar."
                    : "Crie uma senha segura para proteger sua conta."}
            </p>
          </div>

          {mode === "register" && (
            <div className="mb-6" aria-label={`Etapa ${registrationStep} de 3`}>
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Etapa {registrationStep} de 3</span>
                <span>{registrationStep === 1 ? "Seu nome" : registrationStep === 2 ? "Seu e-mail" : "Sua senha"}</span>
              </div>
              <div
                aria-label={`Progresso do cadastro: etapa ${registrationStep} de 3`}
                aria-valuemax={3}
                aria-valuemin={1}
                aria-valuenow={registrationStep}
                className="h-1.5 overflow-hidden rounded-full bg-blue-100"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-blue-700 transition-[width] duration-300"
                  style={{ width: `${(registrationStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={submit}>
            {mode === "register" && registrationStep === 1 && (
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

            {(mode === "login" || registrationStep === 2) && (
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
            )}

            {(mode === "login" || registrationStep === 3) && (
              <div className="block text-left text-sm font-medium text-slate-800">
                <label htmlFor="auth-password">Senha</label>
                <span className="relative mt-2 block">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
                  <input
                    id="auth-password"
                    className="h-12 w-full rounded-2xl border border-blue-200 bg-white pl-11 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    minLength={mode === "register" ? 8 : 1}
                    maxLength={128}
                    required
                  />
                  <button
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                    aria-controls="auth-password"
                    className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </span>
              </div>
            )}

            {notice && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{notice}</p>}
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}

            <div className="flex gap-3">
              {mode === "register" && registrationStep > 1 && (
                <button
                  className="h-12 rounded-2xl border border-blue-200 px-5 font-semibold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  type="button"
                  onClick={() => {
                    setRegistrationStep((current) => current - 1)
                    setShowPassword(false)
                    setError("")
                  }}
                >
                  Voltar
                </button>
              )}
              <button
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-700 font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <>{mode === "login" ? "Entrar" : registrationStep < 3 ? "Continuar" : "Criar conta"}<ArrowRight size={17} aria-hidden="true" /></>}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}{" "}
            <button
              className="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login")
                setRegistrationStep(1)
                setPassword("")
                setShowPassword(false)
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
