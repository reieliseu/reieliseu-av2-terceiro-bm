'use client'

import { useState } from 'react'
import { Lock, Play, Shield, Skull, Star, Zap } from 'lucide-react'

const levels = [
  { id: 1, name: 'Órbita Inicial', difficulty: 'Fácil', tone: 'cyan', icon: Zap, unlocked: true, stars: 3 },
  { id: 2, name: 'Campo de Detritos', difficulty: 'Fácil', tone: 'cyan', icon: Shield, unlocked: true, stars: 2 },
  { id: 3, name: 'Estação Abandonada', difficulty: 'Médio', tone: 'violet', icon: Star, unlocked: true, stars: 1 },
  { id: 4, name: 'Cinturão Sombrio', difficulty: 'Médio', tone: 'violet', icon: Skull, unlocked: false, stars: 0 },
  { id: 5, name: 'Núcleo Inimigo', difficulty: 'Difícil', tone: 'orange', icon: Skull, unlocked: false, stars: 0 },
  { id: 6, name: 'Última Fronteira', difficulty: 'Insano', tone: 'red', icon: Skull, unlocked: false, stars: 0 },
]

const toneStyles = {
  cyan: 'border-cyan-300/70 bg-cyan-400/15 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,.24)]',
  violet: 'border-violet-300/70 bg-violet-400/15 text-violet-200 shadow-[0_0_26px_rgba(167,139,250,.24)]',
  orange: 'border-orange-300/70 bg-orange-400/15 text-orange-200 shadow-[0_0_26px_rgba(251,146,60,.24)]',
  red: 'border-red-300/70 bg-red-400/15 text-red-200 shadow-[0_0_26px_rgba(248,113,113,.24)]',
}

export default function Page() {
  const [selected, setSelected] = useState(1)
  const current = levels.find((level) => level.id === selected) ?? levels[0]
  const Icon = current.icon

  return (
    <main className="min-h-screen overflow-hidden bg-[#241044] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-xs tracking-[.35em] text-orange-300">VOID//ARCHER</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Mapa de níveis</h1>
          </div>
          <div className="rounded-lg border border-cyan-300/30 bg-black/20 px-4 py-2 text-right font-mono text-xs text-white/60">
            <p>PROGRESSO</p><strong className="text-lg text-cyan-200">3 / 6</strong>
          </div>
        </header>

        <section className="relative flex flex-1 flex-col justify-center py-10">
          <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
          <div className="pointer-events-none absolute left-[16%] top-[27%] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute right-[12%] bottom-[18%] h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => {
              const LevelIcon = level.icon
              const active = level.id === selected
              return (
                <button key={level.id} type="button" disabled={!level.unlocked} onClick={() => setSelected(level.id)} className={`group relative min-h-44 rounded-2xl border p-5 text-left transition duration-200 ${level.unlocked ? 'hover:-translate-y-1 hover:scale-[1.02]' : 'cursor-not-allowed opacity-45'} ${toneStyles[level.tone as keyof typeof toneStyles]} ${active ? 'ring-2 ring-white/80 ring-offset-4 ring-offset-[#241044]' : ''}`}>
                  <span className="absolute right-4 top-4 font-mono text-xs text-white/40">NÍVEL {String(level.id).padStart(2, '0')}</span>
                  <div className="mb-8 grid size-12 place-items-center rounded-xl border border-white/20 bg-black/20"><LevelIcon className="size-6" /></div>
                  <h2 className="text-lg font-bold text-white">{level.name}</h2>
                  <p className="mt-1 text-sm text-white/55">{level.difficulty}</p>
                  <div className="mt-4 flex items-center gap-1" aria-label={`${level.stars} de 3 estrelas`}>{[1, 2, 3].map((star) => <Star key={star} className={`size-4 ${star <= level.stars ? 'fill-current' : 'text-white/20'}`} />)}</div>
                  {!level.unlocked && <Lock className="absolute bottom-5 right-5 size-5 text-white/40" />}
                </button>
              )
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-5 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><div className={`grid size-14 place-items-center rounded-xl border ${toneStyles[current.tone as keyof typeof toneStyles]}`}><Icon className="size-7" /></div><div><p className="text-xs uppercase tracking-[.2em] text-white/45">Selecionado</p><p className="text-lg font-bold">{current.name}</p></div></div>
          <button type="button" disabled={!current.unlocked} className="inline-flex items-center justify-center gap-3 rounded-xl bg-orange-400 px-7 py-3 font-black text-[#241044] transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-40"><Play className="size-5 fill-current" /> Jogar nível {current.id}</button>
        </footer>
      </div>
    </main>
  )
}
