'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Crosshair, Rocket, Shield, Target, Zap } from 'lucide-react'

export default function ArenaPage() {
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [hull, setHull] = useState(100)
  const [position, setPosition] = useState({ x: 50, y: 55 })

  useEffect(() => {
    if (!started) return
    const move = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 8 : 4
      setPosition((current) => ({
        x: Math.max(8, Math.min(92, current.x + (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' ? -step : event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' ? step : 0))),
        y: Math.max(12, Math.min(88, current.y + (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w' ? -step : event.key === 'ArrowDown' || event.key.toLowerCase() === 's' ? step : 0))),
      }))
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setScore((current) => current + 10)
      }
    }
    window.addEventListener('keydown', move)
    return () => window.removeEventListener('keydown', move)
  }, [started])

  return (
    <main className="min-h-screen bg-[#080d18] px-5 py-6 text-white sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,.16),transparent_30%),linear-gradient(180deg,#111d31,#050812)] p-6 shadow-[0_0_80px_rgba(34,211,238,.12)] sm:p-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div><p className="font-mono text-xs tracking-[.35em] text-orange-300">VOID//ARCHER</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Arena de combate</h1></div>
          <Crosshair className="size-9 text-cyan-300" />
        </header>
        {!started ? <section className="grid flex-1 place-items-center py-12 text-center"><div><div className="mx-auto mb-6 grid size-24 place-items-center rounded-full border border-cyan-300/50 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,.35)]"><Rocket className="size-12 text-cyan-200" /></div><h2 className="text-2xl font-bold">Arena pronta</h2><p className="mx-auto mt-3 max-w-md text-white/60">Use WASD ou as setas para pilotar. Pressione Espaço ou Enter para disparar.</p><button type="button" onClick={() => setStarted(true)} className="mt-7 rounded-xl bg-orange-400 px-7 py-3 font-black text-[#241044] transition hover:bg-orange-300">Iniciar combate</button></div></section> : <section className="flex flex-1 flex-col py-8"><div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest text-cyan-200"><span>MISSÃO ATIVA · PONTO B</span><span className="flex gap-5"><span>PLACA: {score}</span><span>CASCO: {hull}%</span></span></div><div className="relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-cyan-300/30 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,.8)_1px,transparent_2px),radial-gradient(circle_at_70%_55%,rgba(255,255,255,.6)_1px,transparent_2px),linear-gradient(180deg,#26384d,#101827)] bg-[size:120px_100px,180px_140px,auto]"><div className="absolute left-[24%] top-[28%] size-10 rounded-full border-2 border-red-400 bg-red-500/20 shadow-[0_0_30px_#f87171]" /><div className="absolute right-[18%] top-[48%] size-12 rounded-full border-2 border-red-400 bg-red-500/20 shadow-[0_0_30px_#f87171]" /><div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/50 bg-cyan-400/10"><Target className="size-10 text-cyan-200" /></div><div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75" style={{ left: `${position.x}%`, top: `${position.y}%` }}><div className="relative grid h-12 w-24 place-items-center rounded-[55%] border-2 border-cyan-100 bg-gradient-to-r from-slate-950 via-cyan-600 to-slate-300 shadow-[0_0_30px_#22d3ee]"><Shield className="size-6 text-white" /><span className="absolute -left-7 h-1 w-8 bg-yellow-200 shadow-[0_0_12px_#fde047]" /><span className="absolute -right-7 h-2 w-8 bg-cyan-300 shadow-[0_0_18px_#22d3ee]" /></div></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-white/60">Acelere com Shift. Elimine os alvos vermelhos.</p><button type="button" onClick={() => setScore((current) => current + 10)} className="inline-flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-2.5 font-black text-[#241044]"><Zap className="size-4" /> Disparar</button></div></section>}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-white"><ArrowLeft className="size-4" /> Voltar ao mapa de níveis</Link>
      </div>
    </main>
  )
}
