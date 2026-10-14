'use client'

import { useCallback, useEffect, useState } from 'react'
import { Crosshair, Gauge, Keyboard, Pause, Play, RotateCcw, Shield, Skull, Sparkles, Target, Zap } from 'lucide-react'

type Orb = { id: number; x: number; y: number; value: number }
type Enemy = { id: number; x: number; y: number; hp: number }
type Shot = { id: number; x: number; y: number; dx: number; dy: number; targetId: number }
type EnemyShot = { id: number; x: number; y: number; dx: number; dy: number }

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
  const [enemyShots, setEnemyShots] = useState<EnemyShot[]>([])
  const [level, setLevel] = useState(1)
  const [hull, setHull] = useState(100)
  const [defeated, setDefeated] = useState(0)
  const [blueScore, setBlueScore] = useState(42)
  const [redScore, setRedScore] = useState(37)
  const [capture, setCapture] = useState(32)
  const [ammo, setAmmo] = useState(30)

  const startGame = () => {
    setRunning(true)
    setPaused(false)
    setScore(0)
    setEnergy(100)
    setPosition({ x: 50, y: 82 })
    setOrbs(initialOrbs)
    setEnemies([{ id: 1, x: 22, y: 24, hp: 2 }, { id: 2, x: 76, y: 30, hp: 2 }, { id: 3, x: 72, y: 70, hp: 3 }])
    setShots([])
    setEnemyShots([])
    setLevel(1)
    setHull(100)
    setDefeated(0)
    setBlueScore(42)
    setRedScore(37)
    setCapture(32)
    setAmmo(30)
  }

  const attack = useCallback((target: Enemy) => {
    if (!running || paused || energy < 8 || ammo <= 0) return
    setEnergy((current) => current - 8)
    setAmmo((current) => current - 1)
    const distance = Math.hypot(target.x - position.x, target.y - position.y) || 1
    setShots((current) => [...current, { id: Date.now(), x: position.x, y: position.y, dx: (target.x - position.x) / distance * 3.5, dy: (target.y - position.y) / distance * 3.5, targetId: target.id }])
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
      if (key === 'arrowleft' || key === 'a') move(-9, 0)
      if (key === 'arrowright' || key === 'd') move(9, 0)
      if (key === 'arrowup' || key === 'w') move(0, -9)
      if (key === 'arrowdown' || key === 's') move(0, 9)
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
      setEnemyShots((current) => [...current, ...enemies.map((enemy) => {
        const distance = Math.hypot(position.x - enemy.x, position.y - enemy.y) || 1
        return { id: Date.now() + enemy.id, x: enemy.x, y: enemy.y, dx: (position.x - enemy.x) / distance * 2.2, dy: (position.y - enemy.y) / distance * 2.2 }
      })])
      setHull((current) => Math.max(0, current - (enemies.some((enemy) => Math.hypot(enemy.x - position.x, enemy.y - position.y) < 10) ? 2 : 0)))
      if (Math.hypot(position.x - 50, position.y - 45) < 18) setCapture((current) => Math.min(100, current + 1))
    }, 900)
    return () => window.clearInterval(timer)
  }, [enemies, paused, position.x, position.y, running])

  useEffect(() => {
    if (!running || paused) return
    const timer = window.setInterval(() => {
      setShots((current) => current.map((shot) => ({ ...shot, x: shot.x + shot.dx, y: shot.y + shot.dy })).filter((shot) => shot.x > 0 && shot.x < 100 && shot.y > 0 && shot.y < 100))
      setEnemyShots((current) => current.map((shot) => ({ ...shot, x: shot.x + shot.dx, y: shot.y + shot.dy })).filter((shot) => shot.x > 0 && shot.x < 100 && shot.y > 0 && shot.y < 100))
    }, 80)
    return () => window.clearInterval(timer)
  }, [paused, running])

  useEffect(() => {
    const hit = enemyShots.find((shot) => Math.hypot(shot.x - position.x, shot.y - position.y) < 5)
    if (!hit) return
    setEnemyShots((current) => current.filter((shot) => shot.id !== hit.id))
    setHull((current) => Math.max(0, current - 12))
  }, [enemyShots, position])

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
    <main className="min-h-screen overflow-hidden bg-[#241044] text-white selection:bg-orange-300 selection:text-[#241044]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,217,255,.16),transparent_35%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-cyan-300/15 pb-5"><div className="pointer-events-none absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center overflow-hidden rounded-b-xl border-x border-b border-white/15 bg-[#12253c]/95 shadow-xl"><div className="bg-cyan-500/90 px-8 py-2 text-2xl font-black text-white">{blueScore}</div><div className="px-5 py-2 text-xl font-mono font-bold text-white">07:24</div><div className="bg-red-500/90 px-8 py-2 text-2xl font-black text-white">{redScore}</div></div><div className="pointer-events-none absolute right-5 top-3 z-30 hidden items-center gap-3 rounded-lg border border-cyan-300/60 bg-[#102b48]/95 px-5 py-3 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(0,174,255,.25)] sm:flex"><Target className="size-5 text-cyan-300" /> CAPTURE O PONTO DE CONTROLE</div>
          <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl border border-cyan-300/50 bg-cyan-300/10 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,.2)]"><Crosshair className="size-6" /></div><div><p className="font-mono text-xs tracking-[.35em] text-orange-300">VOID//ARCHER</p><h1 className="text-sm font-semibold tracking-[.18em] text-white/80">ARENA DE COMBATE ESPACIAL</h1></div></div>
          <div className="hidden items-center gap-6 text-xs text-white/45 sm:flex"><span className="flex items-center gap-2"><Keyboard className="size-4" /> WASD / SETAS</span><span className="flex items-center gap-2"><Gauge className="size-4" /> SETOR 07</span></div>
        </header>

        <section className="grid flex-1 gap-6 py-7 lg:grid-cols-[1fr_290px] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-[#0b1424]/80 p-3 shadow-[0_0_80px_rgba(0,174,255,.1)] sm:p-5">
            <div className="mb-3 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[.25em] text-cyan-200/60"><span>SETOR // {level.toString().padStart(2, '0')} · GRAVIDADE ZERO</span><span className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-orange-400" /> combate ativo</span></div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.16),transparent_1px),radial-gradient(circle_at_72%_36%,rgba(110,70,150,.55),transparent_28%),linear-gradient(180deg,#4a4a4a_0%,#343434_58%,#747474_59%,#707070_100%)] bg-[size:36px_36px,auto,auto]" aria-label="Arena jogável"><div className="absolute left-5 top-5 z-20 size-32 rounded-full border-2 border-white/70 bg-[#091627]/75 p-3 shadow-[0_0_24px_rgba(0,174,255,.25)]"><div className="relative size-full overflow-hidden rounded-full border border-cyan-300/30 bg-[linear-gradient(45deg,transparent_47%,rgba(0,174,255,.3)_48%,transparent_51%),linear-gradient(-45deg,transparent_47%,rgba(0,174,255,.3)_48%,transparent_51%)]"><span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white shadow-[0_0_10px_#fff]" /><span className="absolute left-5 top-8 size-2 rounded-full bg-red-400" /><span className="absolute right-5 top-12 size-2 rounded-full bg-red-400" /><span className="absolute bottom-5 left-8 size-2 rounded-full bg-cyan-300" /></div></div><div className="absolute left-1/2 top-[45%] z-10 -translate-x-1/2 -translate-y-1/2 text-center"><div className="grid size-14 rotate-45 place-items-center border-2 border-cyan-200 bg-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,.9)]"><span className="-rotate-45 text-2xl font-black">B</span></div><p className="mt-4 font-mono text-sm font-bold text-white">{capture} m</p></div>
              <div className="pointer-events-none absolute inset-0 opacity-70"><div className="absolute left-[38%] top-[18%] h-5 w-24 -rotate-6 rounded-[60%] border border-cyan-200/60 bg-gradient-to-r from-cyan-950 to-cyan-300/50 shadow-[0_0_24px_#22d3ee]" /><div className="absolute right-[12%] top-[28%] h-4 w-16 rotate-12 rounded-[60%] border border-blue-200/60 bg-gradient-to-r from-blue-950 to-blue-300/50 shadow-[0_0_20px_#60a5fa]" /><div className="absolute left-[18%] bottom-[25%] h-3 w-12 rotate-[-18deg] rounded-[60%] border border-red-200/60 bg-gradient-to-r from-red-950 to-red-300/50 shadow-[0_0_18px_#f87171]" /></div><div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(47,225,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(47,225,255,.25) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
              <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15 shadow-[0_0_80px_rgba(34,211,238,.08)]" />
              {enemies.map((enemy) => <button key={enemy.id} type="button" onClick={() => attack(enemy)} className="absolute z-10 grid h-8 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[55%_45%_45%_55%] border border-red-300 bg-gradient-to-r from-red-950 via-red-500 to-orange-300 text-red-100 shadow-[0_0_28px_rgba(248,113,113,.8)] transition hover:scale-125 before:absolute before:-left-3 before:h-1 before:w-5 before:bg-red-300 before:shadow-[0_0_12px_#f87171] after:absolute after:-right-2 after:h-3 after:w-4 after:skew-x-[-25deg] after:border-r-2 after:border-red-100" style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }} aria-label={`Atacar inimigo com ${enemy.hp} pontos de vida`}><Skull className="size-5" /><span className="absolute -bottom-4 font-mono text-[8px] text-red-200">HP {enemy.hp}</span></button>)}
              {shots.map((shot) => <span key={shot.id} className="absolute z-30 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 shadow-[0_0_18px_6px_rgba(250,204,21,.8)]" style={{ left: `${shot.x}%`, top: `${shot.y}%` }} />)}
              {enemyShots.map((shot) => <span key={shot.id} className="absolute z-30 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400 shadow-[0_0_18px_6px_rgba(248,113,113,.85)]" style={{ left: `${shot.x}%`, top: `${shot.y}%` }} aria-label="Tiro inimigo" />)}
              {orbs.map((orb) => <button key={orb.id} type="button" onClick={() => { setPosition({ x: orb.x, y: orb.y }); setScore((current) => current + orb.value); setOrbs((current) => current.filter((item) => item.id !== orb.id)) }} className="absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200 shadow-[0_0_24px_rgba(232,121,249,.7)] transition hover:scale-125" style={{ left: `${orb.x}%`, top: `${orb.y}%` }} aria-label={`Coletar núcleo de energia de ${orb.value} pontos`}><Sparkles className="size-4" /></button>)}
              <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out" style={{ left: `${position.x}%`, top: `${position.y}%` }}><div className="absolute -right-7 top-1/2 h-2 w-8 -translate-y-1/2 rounded-r-full border border-yellow-200 bg-yellow-300 shadow-[0_0_16px_rgba(250,204,21,.9)]" aria-label="Canhão direito" /><div className="absolute -left-7 top-1/2 h-2 w-8 -translate-y-1/2 rounded-l-full border border-yellow-200 bg-yellow-300 shadow-[0_0_16px_rgba(250,204,21,.9)]" aria-label="Canhão esquerdo" /><div className="relative h-16 w-32 rotate-[-8deg]" aria-label="Nave de combate futurista"><div className="absolute left-1/2 top-1/2 h-10 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[58%_42%_48%_52%] border-2 border-slate-400 bg-gradient-to-r from-slate-950 via-slate-700 to-slate-300 shadow-[0_0_30px_rgba(34,211,238,.7)]" /><div className="absolute left-[46%] top-1/2 h-7 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[60%_40%_45%_55%] border border-cyan-100/80 bg-gradient-to-br from-cyan-100/80 via-cyan-400/45 to-cyan-950/80 shadow-[0_0_18px_#22d3ee]" /><div className="absolute left-1/2 top-[9%] h-8 w-24 -translate-x-1/2 -skew-x-[28deg] border-b-2 border-slate-500 bg-slate-800/90 shadow-[0_5px_12px_rgba(0,0,0,.8)]" /><div className="absolute bottom-[7%] left-1/2 h-8 w-24 -translate-x-1/2 skew-x-[28deg] border-t-2 border-slate-500 bg-slate-900/90" /><div className="absolute -right-3 top-1/2 h-3 w-7 -translate-y-1/2 rounded-r-full bg-gradient-to-r from-orange-500 to-cyan-200 shadow-[0_0_18px_#22d3ee]" /><div className="absolute -left-7 top-1/2 h-1.5 w-8 -translate-y-1/2 rounded-l-full bg-yellow-200 shadow-[0_0_15px_#fde047]" /><div className="absolute -left-6 top-[28%] h-1 w-7 -rotate-12 bg-yellow-200 shadow-[0_0_10px_#fde047]" /><Zap className="absolute left-[43%] top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-white" /></div><span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[.2em] text-cyan-200">VOCÊ · ARMADO</span></div><div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-lg border border-cyan-300/50 bg-[#07182a]/90 px-4 py-2 shadow-lg"><span className="text-2xl font-black text-cyan-300">✚</span><span className="text-2xl font-black">{hull}</span><div className="h-3 w-36 overflow-hidden rounded-sm bg-white/20"><div className="h-full bg-cyan-300" style={{ width: `${hull}%` }} /></div></div><div className="absolute bottom-4 right-4 z-20 flex items-center gap-4 rounded-lg border border-cyan-300/50 bg-[#07182a]/90 px-5 py-2 shadow-lg"><span className="text-2xl text-white">▰</span><span className="text-3xl font-black">{ammo}</span><span className="text-sm text-white/50">/ 90</span></div>
              {!running && <div className="absolute inset-0 grid place-items-center bg-[#050914]/70 backdrop-blur-sm"><button type="button" onClick={startGame} className="group flex items-center gap-3 rounded-full border border-cyan-200/50 bg-cyan-300 px-7 py-3 font-semibold text-[#06111c] shadow-[0_0_35px_rgba(34,211,238,.4)] transition hover:scale-105"><Play className="size-5 fill-current" /> INICIAR MISSÃO</button></div>}
              {paused && <div className="absolute inset-0 grid place-items-center bg-[#050914]/75 backdrop-blur-sm"><p className="font-mono text-sm tracking-[.3em] text-cyan-200">MISSÃO PAUSADA</p></div>}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[.04] p-5"><div className="mb-5 flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.25em] text-white/45">Painel de bordo</p><Shield className="size-4 text-emerald-300" /></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/45">PONTUAÇÃO</p><p className="mt-1 text-3xl font-bold text-cyan-200">{score.toString().padStart(4, '0')}</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/45">NÍVEL</p><p className="mt-1 text-3xl font-bold text-fuchsia-200">{level.toString().padStart(2, '0')}</p></div></div><div className="mt-4"><div className="mb-2 flex justify-between text-xs text-white/55"><span>ENERGIA DO NÚCLEO</span><span>{energy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all" style={{ width: `${energy}%` }} /></div><div className="mt-3"><div className="mb-2 flex justify-between text-xs text-white/55"><span>INTEGRIDADE DO CASCO</span><span>{hull}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-300 transition-all" style={{ width: `${hull}%` }} /></div></div></div></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.04] p-5"><p className="font-mono text-[10px] uppercase tracking-[.25em] text-white/45">Comandos</p><p className="mt-3 text-sm leading-6 text-white/60">Use A/D ou as setas para atravessar a arena. Mire nos drones e ataque com ESPAÇO ou Enter. Desvie dos disparos inimigos e alcance a maior pontuação.</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => setPaused((current) => !current)} disabled={!running} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"><Pause className="size-4" /> Pausar</button><button type="button" onClick={startGame} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 px-3 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-300/10"><RotateCcw className="size-4" /> Reiniciar</button></div></div>
          </aside>
        </section>
        <footer className="flex flex-col gap-2 border-t border-cyan-300/15 pt-4 text-[10px] uppercase tracking-[.2em] text-white/35 sm:flex-row sm:justify-between"><span>VOID//ARCHER · ARENA ESPACIAL 2D</span><span>todos os sistemas operacionais</span></footer>
      </div>
    </main>
  )
}
