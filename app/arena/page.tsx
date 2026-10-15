'use client'

import Link from 'next/link'
import { ArrowLeft, Crosshair, Rocket } from 'lucide-react'

export default function ArenaPage() {
  return (
    <main className="min-h-screen bg-[#080d18] px-5 py-6 text-white sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,.16),transparent_30%),linear-gradient(180deg,#111d31,#050812)] p-6 shadow-[0_0_80px_rgba(34,211,238,.12)] sm:p-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-xs tracking-[.35em] text-orange-300">VOID//ARCHER</p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">Arena de combate</h1>
          </div>
          <Crosshair className="size-9 text-cyan-300" />
        </header>
        <section className="grid flex-1 place-items-center py-12 text-center">
          <div>
            <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full border border-cyan-300/50 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,.35)]"><Rocket className="size-12 text-cyan-200" /></div>
            <h2 className="text-2xl font-bold">Arena pronta</h2>
            <p className="mx-auto mt-3 max-w-md text-white/60">Entre na zona de combate e prepare sua nave para a missão.</p>
            <button type="button" className="mt-7 rounded-xl bg-orange-400 px-7 py-3 font-black text-[#241044] transition hover:bg-orange-300">Iniciar combate</button>
          </div>
        </section>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-white"><ArrowLeft className="size-4" /> Voltar ao mapa de níveis</Link>
      </div>
    </main>
  )
}
