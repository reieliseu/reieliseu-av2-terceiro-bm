"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { BadgeCheck, CalendarDays, Check, Crown, LoaderCircle, ShieldCheck } from "lucide-react"
import { apiRequest, type PremiumSubscription } from "@/lib/api"

type PremiumPlanCardProps = { token: string }

const benefits = ["Notebook de estudos", "Estúdio com ferramentas de revisão", "Acesso enquanto a assinatura estiver ativa"]

function formatPeriodEnd(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(value))
}

export function PremiumPlanCard({ token }: PremiumPlanCardProps) {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [checkoutNotice, setCheckoutNotice] = useState("")
  const [actionError, setActionError] = useState("")
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isConfirming, setIsConfirming] = useState(false)
  const { data: subscription, error: statusError, isLoading, mutate } = useSWR(
    ["/billing/subscription", token] as const,
    ([path, bearer]) => apiRequest<PremiumSubscription>(path, bearer),
    { revalidateOnFocus: true },
  )

  useEffect(() => {
    const url = new URL(window.location.href)
    const result = url.searchParams.get("premium")
    if (result === "cancelled") {
      setCheckoutNotice("O checkout foi cancelado. Você pode assinar quando quiser.")
      url.searchParams.delete("premium")
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
      return
    }
    if (result === "success") {
      const sessionId = url.searchParams.get("session_id")
      if (sessionId) setCheckoutSessionId(sessionId)
    }
  }, [])

  useEffect(() => {
    if (!checkoutSessionId) return
    let isCurrent = true
    setIsConfirming(true)
    setActionError("")
    setCheckoutNotice("Confirmando sua assinatura com a Stripe…")
    apiRequest<PremiumSubscription>("/billing/confirm", token, {
      method: "POST",
      body: JSON.stringify({ sessionId: checkoutSessionId }),
    })
      .then(async (result) => {
        if (!isCurrent) return
        await mutate(result, false)
        setCheckoutNotice("Assinatura Premium ativa. O Notebook e o Estúdio já estão liberados.")
        setCheckoutSessionId(null)
        const url = new URL(window.location.href)
        url.searchParams.delete("premium")
        url.searchParams.delete("session_id")
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
      })
      .catch((cause) => {
        if (!isCurrent) return
        setActionError(cause instanceof Error ? cause.message : "A confirmação ainda não foi concluída.")
        setCheckoutNotice("A confirmação pode levar alguns instantes. Tente verificar novamente.")
      })
      .finally(() => {
        if (isCurrent) setIsConfirming(false)
      })
    return () => { isCurrent = false }
  }, [checkoutSessionId, mutate, retryCount, token])

  async function startCheckout() {
    setIsStartingCheckout(true)
    setActionError("")
    try {
      const result = await apiRequest<{ url: string }>("/billing/checkout", token, {
        method: "POST",
        body: JSON.stringify({}),
      })
      window.location.assign(result.url)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Não foi possível iniciar o checkout.")
      setIsStartingCheckout(false)
    }
  }

  async function cancelSubscription() {
    setIsCancelling(true)
    setActionError("")
    try {
      const result = await apiRequest<PremiumSubscription>("/billing/cancel", token, {
        method: "POST",
        body: JSON.stringify({}),
      })
      await mutate(result, false)
      setShowCancelConfirmation(false)
      setCheckoutNotice("Renovação cancelada. Seu acesso continua até o fim do período pago.")
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Não foi possível cancelar a renovação.")
    } finally {
      setIsCancelling(false)
    }
  }

  const periodEnd = formatPeriodEnd(subscription?.currentPeriodEnd ?? null)
  const hasPendingPayment = subscription?.status !== null && subscription?.status !== undefined && !subscription.isPremium && !["canceled", "incomplete_expired"].includes(subscription.status)

  return (
    <section id="premium-plan" className="mt-7 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-white via-white to-violet-50 shadow-sm" aria-labelledby="premium-title">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.72fr)]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-800"><Crown size={21} aria-hidden="true" /></span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="premium-title" className="text-lg font-semibold text-slate-950">Mentor Estudantil Premium</h2>
                {subscription?.isPremium && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"><BadgeCheck size={14} aria-hidden="true" /> Ativo</span>}
              </div>
              <p className="mt-0.5 text-sm text-slate-600">Seu espaço de estudo, com mais ferramentas.</p>
            </div>
          </div>

          <ul className="mt-5 grid gap-2.5 text-sm text-slate-700 sm:grid-cols-2">
            {benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2"><Check className="mt-0.5 shrink-0 text-violet-700" size={16} aria-hidden="true" /><span>{benefit}</span></li>)}
          </ul>

          {checkoutNotice && <p className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-sm text-violet-900" role="status">{checkoutNotice}</p>}
          {actionError && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800" role="alert">{actionError}</p>}
          {statusError && !actionError && <p className="mt-3 text-sm text-slate-500">Não foi possível atualizar o status da assinatura agora.</p>}

          {checkoutSessionId && !isConfirming && (
            <button className="mt-3 text-sm font-semibold text-violet-800 underline decoration-violet-300 underline-offset-4 hover:text-violet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600" type="button" onClick={() => setRetryCount((count) => count + 1)}>Verificar novamente</button>
          )}
        </div>

        <div className="flex flex-col justify-center border-t border-violet-100 bg-violet-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> Consultando assinatura…</div>
          ) : subscription?.isPremium ? (
            <>
              <p className="text-sm font-medium text-violet-900">Acesso Premium</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">R$ 19,90<span className="ml-1 text-base font-medium text-slate-500">/mês</span></p>
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-slate-600"><CalendarDays className="mt-0.5 shrink-0" size={16} aria-hidden="true" />{subscription.cancelAtPeriodEnd ? `Acesso até ${periodEnd ?? "o fim do período pago"}.` : `Próxima renovação${periodEnd ? ` em ${periodEnd}` : " mensal"}.`}</p>
              {subscription.cancelAtPeriodEnd ? (
                <p className="mt-4 rounded-xl bg-amber-100 px-3.5 py-2.5 text-sm font-medium text-amber-900">A renovação foi cancelada; seu acesso continua até a data indicada.</p>
              ) : showCancelConfirmation ? (
                <div className="mt-4 rounded-2xl border border-violet-200 bg-white p-4" role="group" aria-label="Confirmar cancelamento">
                  <p className="text-sm font-semibold text-slate-900">Cancelar a renovação?</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">Você manterá o acesso até o fim do período já pago.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600" type="button" onClick={() => setShowCancelConfirmation(false)}>Manter Premium</button>
                    <button className="h-9 rounded-lg bg-rose-700 px-3 text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60" type="button" onClick={cancelSubscription} disabled={isCancelling}>{isCancelling ? "Cancelando…" : "Confirmar cancelamento"}</button>
                  </div>
                </div>
              ) : (
                <button className="mt-4 inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-900 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600" type="button" onClick={() => setShowCancelConfirmation(true)}><ShieldCheck size={16} aria-hidden="true" /> Cancelar renovação</button>
              )}
            </>
          ) : hasPendingPayment ? (
            <>
              <p className="text-sm font-semibold text-amber-900">Assinatura em análise</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Há um pagamento pendente para esta conta. O acesso será atualizado assim que a Stripe confirmar a situação.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-violet-900">Plano mensal</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">R$ 19,90<span className="ml-1 text-base font-medium text-slate-500">/mês</span></p>
              <p className="mt-2 text-sm text-slate-600">Cobrança recorrente, com cancelamento a qualquer momento.</p>
              <button className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={startCheckout} disabled={isStartingCheckout || isConfirming}>{isStartingCheckout ? <><LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> Abrindo checkout…</> : <><Crown size={16} aria-hidden="true" /> Assinar Premium</>}</button>
              <p className="mt-2 text-xs text-slate-500">Pagamento processado com segurança pela Stripe.</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
