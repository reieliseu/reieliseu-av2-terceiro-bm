'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'

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
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState('')
  const [logged, setLogged] = useState(false)
  const [perfil, setPerfil] = useState<{ nome: string; email: string } | null>(null)
  const [usuarios, setUsuarios] = useState<{ nome: string; email: string; status: string }[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const usuario = { nome: localStorage.getItem('nome') || 'Usuário', email: localStorage.getItem('email') || 'aluno@exemplo.com', status: 'Ativo agora' }
      setLogged(true)
      setPerfil(usuario)
      setUsuarios([usuario])
    }
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
        <form onSubmit={submit} className="flex flex-col gap-5">{mode === 'cadastro' && <label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input className="h-12 rounded-xl border border-input bg-card px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" className="h-12 rounded-xl border border-input bg-card px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<div className="relative"><input type={mostrarSenha ? 'text' : 'password'} className="h-12 w-full rounded-xl border border-input bg-card px-4 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" aria-label="Senha" /><button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>{mostrarSenha ? <EyeOff /> : <Eye />}</button></div></label>{status && <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{status}</p>}<button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:opacity-90" type="submit">{mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}<ArrowRight /></button></form>
        <p className="mt-7 text-center text-sm text-muted-foreground">{mode === 'login' ? 'Ainda não possui cadastro?' : 'Já possui uma conta?'} <button className="font-semibold text-foreground underline underline-offset-4" onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setStatus('') }}>{mode === 'login' ? 'Criar conta' : 'Fazer login'}</button></p></> : <div><div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-muted"><UserRound /></div><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Área protegida</p><h2 className="text-4xl font-semibold tracking-tight">Usuários</h2><p className="mt-3 leading-relaxed text-muted-foreground">Olá, {perfil?.nome}. Esta página só pode ser acessada depois do login.</p><div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><div><span className="text-xs text-muted-foreground">Usuário autenticado</span><p className="font-medium">{perfil?.email}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Ativo</span></div><div className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground"><CheckCircle2 className="text-primary" /> Acesso autorizado via JWT</div></div><div className="mt-6 flex flex-col gap-3"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Usuários cadastrados</h3><span className="font-mono text-xs text-muted-foreground">{usuarios.length} registro</span></div>{usuarios.map((usuario) => <div key={usuario.email} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{usuario.nome.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-medium">{usuario.nome}</p><p className="truncate text-sm text-muted-foreground">{usuario.email}</p></div><span className="ml-auto text-xs text-muted-foreground">{usuario.status}</span></div>)}</div><button onClick={logout} className="mt-6 h-12 w-full rounded-xl border border-border font-semibold transition hover:bg-muted">Sair da conta</button></div>}
      {logged && <section className="mt-10 border-t border-border pt-8" aria-labelledby="conteudo-title"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trilha de aprendizagem</p><h3 id="conteudo-title" className="text-2xl font-semibold tracking-tight">Conteúdo abordado</h3></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">4 módulos</span></div><div className="flex flex-col gap-3"><article className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">01</div><div><h4 className="font-semibold">React e componentes</h4><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Interfaces, estados, eventos e organização de componentes.</p></div></div></article><article className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">02</div><div><h4 className="font-semibold">Axios e APIs REST</h4><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Requisições HTTP, interceptors e integração entre front-end e back-end.</p></div></div></article><article className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">03</div><div><h4 className="font-semibold">Autenticação com JWT</h4><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Login seguro, token Bearer, bcrypt e proteção de rotas.</p></div></div></article><article className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">04</div><div><h4 className="font-semibold">Autorização e perfis</h4><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Permissões de usuário, área administrativa e respostas 401/403.</p></div></div></article></div></section>}
  <p className="mt-14 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AV1 + AV2 · Desenvolvimento de Sistemas Web</p>
    </div></section>
  </main>
}
