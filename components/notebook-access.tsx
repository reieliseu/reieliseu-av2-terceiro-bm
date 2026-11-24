"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Crown, LoaderCircle, LockKeyhole } from "lucide-react"
import { NotebookWorkspace } from "@/components/notebook-workspace"
import { apiRequest, type PremiumSubscription } from "@/lib/api"

export function NotebookAccess() {
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    setToken(window.sessionStorage.getItem("study-access-token"))
    setIsReady(true)
  }, [])

  const { data, error, isLoading } = useSWR(
    token ? ["/billing/subscription", token] as const : null,
    ([path, bearer]) => apiRequest<PremiumSubscription>(path, bearer),
  )

  if (!isReady || (token && isLoading)) {
    return <main className="grid min-h-dvh place-items-center bg-[#090909] text-violet-300"><LoaderCircle className="animate-spin" size={28} aria-label="Verificando acesso Premium" /></main>
  }

  if (data?.isPremium) return <NotebookWorkspace />

  const sessionExpired = Boolean(error)
  return (
    <main className="grid min-h-dvh place-items-center bg-[#090909] px-5 py-12 text-[#e5e5e5]">
      <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111] p-7 text-center shadow-2xl sm:p-9" aria-labelledby="premium-access-title">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"><LockKeyhole size={24} aria-hidden="true" /></span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Área Premium</p>
        <h1 id="premium-access-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">Notebook e Estúdio</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#aaa]">
          {sessionExpired
            ? "Não foi possível validar sua sessão. Volte ao painel e entre novamente para conferir seu acesso."
            : token
              ? "O Notebook e o Estúdio estão incluídos no plano Premium por R$ 19,90/mês."
              : "Entre na sua conta e assine o Premium para desbloquear o Notebook e o Estúdio."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300" href={token && !sessionExpired ? "/#premium-plan" : "/"}><Crown size={16} aria-hidden="true" />{token && !sessionExpired ? "Conhecer o Premium" : "Entrar ou criar conta"}</Link>
          <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-sm font-medium text-[#ccc] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300" href="/"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel</Link>
        </div>
      </section>
    </main>
  )
}
