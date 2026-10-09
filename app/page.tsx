'use client'

import { useCallback, useEffect, useState } from 'react'
import { Crosshair, Gauge, Keyboard, Pause, Play, RotateCcw, Shield, Skull, Sparkles, Target, Zap } from 'lucide-react'

type Orb = { id: number; x: number; y: number; value: number }
type Enemy = { id: number; x: number; y: number; hp: number }
type Shot = { id: number; x: number; y: number; targetId: number }

const initialOrbs: Orb[] = [
  { id: 1, x: 18, y: 28, value: 10 },
  { id: 2, x: 76, y: 22, value: 20 },
  { id: 3, x: 44, y: 48, value: 15 },
  { id: 4, x: 82, y: 70, value: 25 },
  { id: 5, x: 24, y: 76, value: 30 },
]

export default function Page() {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [energy, setEnergy] = useState(100)
  const [position, setPosition] = useState({ x: 50, y: 82 })
  const [orbs, setOrbs] = useState(initialOrbs)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [shots, setShots] = useState<Shot[]>([])
  const [level, setLevel] = useState(1)
  const [hull, setHull] = useState(100)
  const [defeated, setDefeated] = useState(0)

  const startGame = () => {
    setRunning(true)
    setPaused(false)
    setScore(0)
    setEnergy(100)
    setPosition({ x: 50, y: 82 })
    setOrbs(initialOrbs)
    setEnemies([{ id: 1, x: 22, y: 24, hp: 2 }, { id: 2, x: 76, y: 30, hp: 2 }, { id: 3, x: 72, y: 70, hp: 3 }])
    setShots([])
    setLevel(1)
    setHull(100)
    setDefeated(0)
  }

  const attack = useCallback((target: Enemy) => {
    if (!running || paused || energy < 8) return
    setEnergy((current) => current - 8)
    setShots((current) => [...current, { id: Date.now(), x: position.x, y: position.y, targetId: target.id }])
    setEnemies((current) => current.map((enemy) => enemy.id === target.id ? { ...enemy, hp: enemy.hp - 1 } : enemy).filter((enemy) => enemy.hp > 0))
    setScore((current) => current + (target.hp === 1 ? 100 : 25))
    if (target.hp === 1) setDefeated((current) => current + 1)
  }, [energy, paused, position, running])

  const move = useCallback((dx: number, dy: number) => {
    if (!running || paused || energy <= 0) return
    setPosition((current) => ({ x: Math.min(94, Math.max(6, current.x + dx)), y: Math.min(92, Math.max(8, current.y + dy)) }))
    setEnergy((current) => Math.max(0, current - 1))
  }, [energy, paused, running])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'arrowleft' || key === 'a') move(-4, 0)
      if (key === 'arrowright' || key === 'd') move(4, 0)
      if (key === 'arrowup' || key === 'w') move(0, -4)
      if (key === 'arrowdown' || key === 's') move(0, 4)
      if (key === 'p' && running) setPaused((current) => !current)
      if ((key === ' ' || key === 'enter') && running && enemies[0]) attack(enemies[0])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [attack, enemies, move, running])

  useEffect(() => {
    if (!running || paused || enemies.length === 0) return
    const timer = window.setInterval(() => {
      setEnemies((current) => current.map((enemy) => ({ ...enemy, x: enemy.x + Math.sign(position.x - enemy.x) * 0.8, y: enemy.y + Math.sign(position.y - enemy.y) * 0.8 })))
      setHull((current) => Math.max(0, current - (enemies.some((enemy) => Math.hypot(enemy.x - position.x, enemy.y - position.y) < 10) ? 2 : 0)))
    }, 450)
    return () => window.clearInterval(timer)
  }, [enemies.length, paused, position.x, position.y, running])

  useEffect(() => {
    if (hull <= 0) { setRunning(false); setPaused(false) }
    if (defeated > 0 && defeated % 3 === 0 && enemies.length === 0) {
      setLevel((current) => current + 1)
      setEnemies([{ id: Date.now(), x: 18, y: 24, hp: 2 + level }, { id: Date.now() + 1, x: 80, y: 65, hp: 2 + level }])
    }
  }, [defeated, enemies.length, hull, level])

  useEffect(() => {
    const collected = orbs.find((orb) => Math.hypot(orb.x - position.x, orb.y - position.y) < 8)
    if (!collected || paused || !running) return
    setScore((current) => current + collected.value)
    setEnergy((current) => Math.min(100, current + 12))
    setOrbs((current) => current.filter((orb) => orb.id !== collected.id))
    if (orbs.length === 1) setLevel((current) => current + 1)
  }, [orbs, paused, position, running])

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b16] text-white selection:bg-cyan-300 selection:text-[#07101b]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,217,255,.16),transparent_35%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-cyan-300/15 pb-5">
          <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl border border-cyan-300/50 bg-cyan-300/10 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,.2)]"><Crosshair className="size-6" /></div><div><p className="font-mono text-xs tracking-[.35em] text-cyan-300">NEON//DRIFT</p><h1 className="text-sm font-semibold tracking-[.18em] text-white/80">PROTOCOLO DE EXPLORAÇÃO</h1></div></div>
          <div className="hidden items-center gap-6 text-xs text-white/45 sm:flex"><span className="flex items-center gap-2"><Keyboard className="size-4" /> WASD / SETAS</span><span className="flex items-center gap-2"><Gauge className="size-4" /> SETOR 07</span></div>
        </header>

        <section className="grid flex-1 gap-6 py-7 lg:grid-cols-[1fr_290px] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-[#0b1424]/80 p-3 shadow-[0_0_80px_rgba(0,174,255,.1)] sm:p-5">
            <div className="mb-3 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[.25em] text-cyan-200/60"><span>Zona de combate // {level.toString().padStart(2, '0')}</span><span className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-emerald-400" /> sistema online</span></div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[#050914]" aria-label="Arena jogável">
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(47,225,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(47,225,255,.25) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
              <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 shadow-[0_0_80px_rgba(34,211,238,.08)]" />
              {enemies.map((enemy) => <button key={enemy.id} type="button" onClick={() => attack(enemy)} className="absolute z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-red-300 bg-red-500/20 text-red-200 shadow-[0_0_28px_rgba(248,113,113,.8)] transition hover:scale-125" style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }} aria-label={`Atacar inimigo com ${enemy.hp} pontos de vida`}><Skull className="size-5" /><span className="absolute -bottom-4 font-mono text-[8px] text-red-200">HP {enemy.hp}</span></button>)}
              {shots.map((shot) => <span key={shot.id} className="absolute z-30 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 shadow-[0_0_18px_6px_rgba(250,204,21,.8)]" style={{ left: `${shot.x}%`, top: `${shot.y}%` }} />)}
              {orbs.map((orb) => <button key={orb.id} type="button" onClick={() => { setPosition({ x: orb.x, y: orb.y }); setScore((current) => current + orb.value); setOrbs((current) => current.filter((item) => item.id !== orb.id)) }} className="absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200 shadow-[0_0_24px_rgba(232,121,249,.7)] transition hover:scale-125" style={{ left: `${orb.x}%`, top: `${orb.y}%` }} aria-label={`Coletar núcleo de energia de ${orb.value} pontos`}><Sparkles className="size-4" /></button>)}
              <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-150" style={{ left: `${position.x}%`, top: `${position.y}%` }}><div className="grid size-14 rotate-45 place-items-center border-2 border-cyan-200 bg-cyan-400/20 shadow-[0_0_32px_rgba(34,211,238,.85)]"><Zap className="size-7 -rotate-45 text-cyan-100" /></div><span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[.2em] text-cyan-200">VOCÊ</span></div>
              {!running && <div className="absolute inset-0 grid place-items-center bg-[#050914]/70 backdrop-blur-sm"><button type="button" onClick={startGame} className="group flex items-center gap-3 rounded-full border border-cyan-200/50 bg-cyan-300 px-7 py-3 font-semibold text-[#06111c] shadow-[0_0_35px_rgba(34,211,238,.4)] transition hover:scale-105"><Play className="size-5 fill-current" /> INICIAR MISSÃO</button></div>}
              {paused && <div className="absolute inset-0 grid place-items-center bg-[#050914]/75 backdrop-blur-sm"><p className="font-mono text-sm tracking-[.3em] text-cyan-200">MISSÃO PAUSADA</p></div>}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[.04] p-5"><div className="mb-5 flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.25em] text-white/45">Painel de bordo</p><Shield className="size-4 text-emerald-300" /></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/45">PONTUAÇÃO</p><p className="mt-1 text-3xl font-bold text-cyan-200">{score.toString().padStart(4, '0')}</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/45">NÍVEL</p><p className="mt-1 text-3xl font-bold text-fuchsia-200">{level.toString().padStart(2, '0')}</p></div></div><div className="mt-4"><div className="mb-2 flex justify-between text-xs text-white/55"><span>ENERGIA DO NÚCLEO</span><span>{energy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all" style={{ width: `${energy}%` }} /></div><div className="mt-3"><div className="mb-2 flex justify-between text-xs text-white/55"><span>INTEGRIDADE DO CASCO</span><span>{hull}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-300 transition-all" style={{ width: `${hull}%` }} /></div></div></div></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.04] p-5"><p className="font-mono text-[10px] uppercase tracking-[.25em] text-white/45">Comandos</p><p className="mt-3 text-sm leading-6 text-white/60">Ataque os drones vermelhos tocando neles ou usando ESPAÇO. Use WASD ou as setas para pilotar e sobreviva ao avanço inimigo.</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => setPaused((current) => !current)} disabled={!running} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><Pause className="size-4" /> Pausar</button><button type="button" onClick={startGame} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 px-3 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-300/10"><RotateCcw className="size-4" /> Reiniciar</button></div></div>
          </aside>
        </section>
        <footer className="flex flex-col gap-2 border-t border-cyan-300/15 pt-4 text-[10px] uppercase tracking-[.2em] text-white/35 sm:flex-row sm:justify-between"><span>NEON//DRIFT · SIMULADOR DE EXPLORAÇÃO</span><span>todos os sistemas operacionais</span></footer>
      </div>
    </main>
  )
}
