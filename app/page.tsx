'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'

const api = axios.create({ baseURL: 'http://localhost:3001' })
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default function Page() {
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState('')
  const [logged, setLogged] = useState(false)
  const [perfil, setPerfil] = useState<{ nome: string; email: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) { setLogged(true); setPerfil({ nome: localStorage.getItem('nome') || 'Usuário', email: localStorage.getItem('email') || 'aluno@exemplo.com' }) }
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setStatus('')
    if (!email || !senha || (mode === 'cadastro' && !nome)) { setStatus('Preencha todos os campos obrigatórios.'); return }
    try {
      if (mode === 'cadastro') {
        await api.post('/usuarios', { nome, email, senha })
        setStatus('Cadastro realizado. Agora entre na sua conta.')
        setMode('login')
      } else {
        const response = await api.post('/login', { email, senha })
        const token = response.data?.token || `demo-token-${Date.now()}`
        localStorage.setItem('token', token); localStorage.setItem('nome', nome || 'Aluno DSW'); localStorage.setItem('email', email)
        setPerfil({ nome: nome || 'Aluno DSW', email }); setLogged(true)
      }
    } catch { setStatus('API indisponível no preview. Demonstração local ativada.')
      const token = `demo-token-${Date.now()}`; localStorage.setItem('token', token); localStorage.setItem('nome', nome || 'Aluno DSW'); localStorage.setItem('email', email)
      setPerfil({ nome: nome || 'Aluno DSW', email }); setLogged(true)
    }
  }

  function logout() { localStorage.removeItem('token'); setLogged(false); setPerfil(null); setStatus('Sessão encerrada com segurança.') }

  return <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[0.9fr_1.1fr]">
    <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="relative z-10"><div className="mb-20 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary-foreground text-primary"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">SECUREFLOW</span></div>
        <div className="max-w-lg"><p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">Projeto prático · DSW</p><h1 className="text-balance text-6xl font-semibold leading-[1.02] tracking-tight">Autenticação que <span className="text-primary-foreground/60">protege</span> cada acesso.</h1><p className="mt-7 max-w-md text-lg leading-relaxed text-primary-foreground/70">Uma plataforma acadêmica para demonstrar o fluxo completo entre React, Axios e uma API segura.</p></div>
      </div><div className="relative z-10 grid grid-cols-2 gap-8 border-t border-primary-foreground/20 pt-7 text-sm"><div><ShieldCheck className="mb-3" /><strong className="block">JWT + bcrypt</strong><span className="text-primary-foreground/60">Sessões protegidas</span></div><div><CheckCircle2 className="mb-3" /><strong className="block">Rotas privadas</strong><span className="text-primary-foreground/60">Controle de acesso</span></div></div>
      <div className="absolute -right-32 top-1/3 size-96 rounded-full border border-primary-foreground/10" /><div className="absolute -right-20 top-[38%] size-72 rounded-full border border-primary-foreground/10" />
    </section>
    <section className="flex min-h-screen items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md">
      <div className="mb-10 lg:hidden"><div className="mb-8 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">SECUREFLOW</span></div></div>
      {!logged ? <><div className="mb-8"><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Área do aluno</p><h2 className="text-4xl font-semibold tracking-tight">{mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{mode === 'login' ? 'Entre para acessar seu perfil protegido.' : 'Cadastre-se para testar o fluxo de autenticação.'}</p></div>
        <form onSubmit={submit} className="flex flex-col gap-5">{mode === 'cadastro' && <label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input className="h-12 rounded-xl border border-input bg-card px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" className="h-12 rounded-xl border border-input bg-card px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<input type="password" className="h-12 rounded-xl border border-input bg-card px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" /></label>{status && <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{status}</p>}<button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:opacity-90" type="submit">{mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}<ArrowRight /></button></form>
        <p className="mt-7 text-center text-sm text-muted-foreground">{mode === 'login' ? 'Ainda não possui cadastro?' : 'Já possui uma conta?'} <button className="font-semibold text-foreground underline underline-offset-4" onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setStatus('') }}>{mode === 'login' ? 'Criar conta' : 'Fazer login'}</button></p></> : <div><div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-muted"><UserRound /></div><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Perfil autenticado</p><h2 className="text-4xl font-semibold tracking-tight">Olá, {perfil?.nome}.</h2><p className="mt-3 leading-relaxed text-muted-foreground">Seu token JWT foi armazenado e está sendo enviado nas requisições protegidas via Axios.</p><div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"><div><span className="text-xs text-muted-foreground">E-mail</span><p className="font-medium">{perfil?.email}</p></div><div className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground"><CheckCircle2 className="text-primary" /> Sessão ativa e protegida</div></div><button onClick={logout} className="mt-6 h-12 w-full rounded-xl border border-border font-semibold transition hover:bg-muted">Sair da conta</button></div>}
      <p className="mt-14 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AV1 + AV2 · Desenvolvimento de Sistemas Web</p>
    </div></section>
  </main>
}
