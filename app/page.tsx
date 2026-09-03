'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound, X } from 'lucide-react'

const api = axios.create({ baseURL: 'http://localhost:3001' })
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const modulos = [
  { id: 1, titulo: 'React e componentes', texto: 'Interfaces, estados, eventos e organização de componentes.', detalhe: 'Aprenda a criar interfaces reutilizáveis com componentes React, controlar estados com useState e responder às ações do usuário. Atividade: crie um componente Card com título, descrição e um botão que altere seu estado ao ser clicado.' },
  { id: 2, titulo: 'Axios e APIs REST', texto: 'Requisições HTTP, interceptors e integração entre front-end e back-end.', detalhe: 'Entenda GET, POST, tratamento de erros e interceptors para enviar o token Bearer automaticamente nas requisições. Atividade: use Axios para consultar uma lista de usuários e exiba os nomes em uma tabela, tratando também um erro da API.' },
  { id: 3, titulo: 'Autenticação com JWT', texto: 'Login seguro, token Bearer, bcrypt e proteção de rotas.', detalhe: 'Veja como o login gera um token JWT, como armazená-lo com segurança e como validar a sessão do usuário. Atividade: descreva o fluxo de login em três etapas e identifique onde o token Bearer deve ser enviado.' },
  { id: 4, titulo: 'Autorização e perfis', texto: 'Permissões, rotas privadas e controle de acesso por perfil.', detalhe: 'Diferencie autenticação de autorização e restrinja recursos conforme o perfil e as permissões do usuário. Atividade: crie uma regra que permita o acesso à área administrativa apenas para usuários com perfil admin.' },
]

export default function Page() {
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState('')
  const [logged, setLogged] = useState(false)
  const [perfil, setPerfil] = useState<{ nome: string; email: string } | null>(null)
  const [moduloSelecionado, setModuloSelecionado] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) { setLogged(true); setPerfil({ nome: localStorage.getItem('nome') || 'Usuário', email: localStorage.getItem('email') || 'aluno@exemplo.com' }) }
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setStatus('')
    if (!email || !senha || (mode === 'cadastro' && !nome)) { setStatus('Preencha todos os campos obrigatórios.'); return }
    try {
      if (mode === 'cadastro') { await api.post('/usuarios', { nome, email, senha }); setStatus('Cadastro realizado. Agora entre na sua conta.'); setMode('login') }
      else { const response = await api.post('/login', { email, senha }); localStorage.setItem('token', response.data?.token || `demo-token-${Date.now()}`); localStorage.setItem('nome', nome || 'Aluno DSW'); localStorage.setItem('email', email); setPerfil({ nome: nome || 'Aluno DSW', email }); setLogged(true) }
    } catch { const usuario = { nome: nome || 'Aluno DSW', email }; localStorage.setItem('token', `demo-token-${Date.now()}`); localStorage.setItem('nome', usuario.nome); localStorage.setItem('email', email); setPerfil(usuario); setLogged(true); setStatus('API indisponível no preview. Demonstração local ativada.') }
  }

  function logout() { localStorage.removeItem('token'); setLogged(false); setPerfil(null); setModuloSelecionado(null); setStatus('Sessão encerrada com segurança.') }

  return <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[0.9fr_1.1fr]">
    <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div><div className="mb-20 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary-foreground text-primary"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">TESTE SEUS CONHECIMENTOS</span></div><div className="max-w-lg"><p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">Projeto prático · DSW</p><h1 className="text-balance text-6xl font-semibold leading-[1.02] tracking-tight"><ShieldCheck className="mb-3 inline-block size-12 align-middle text-primary-foreground/70" aria-label="Autenticação protegida" /> Cada acesso protegido.</h1><p className="mt-7 max-w-md text-lg leading-relaxed text-primary-foreground/70">Uma plataforma acadêmica para demonstrar o fluxo completo entre React, Axios e uma API segura.</p></div></div><div className="grid grid-cols-2 gap-8 border-t border-primary-foreground/20 pt-7 text-sm"><div><ShieldCheck className="mb-3" /><strong className="block">JWT + bcrypt</strong><span className="text-primary-foreground/60">Sessões protegidas</span></div><div><CheckCircle2 className="mb-3" /><strong className="block">Rotas privadas</strong><span className="text-primary-foreground/60">Controle de acesso</span></div></div></section>
    <section className="flex min-h-screen items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><div className="mb-8 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">TESTE SEUS CONHECIMENTOS</span></div></div>
      {!logged ? <><div className="mb-8"><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Área do aluno</p><h2 className="text-4xl font-semibold tracking-tight">{mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{mode === 'login' ? 'Entre para acessar seu perfil protegido.' : 'Cadastre-se para testar o fluxo de autenticação.'}</p></div><form onSubmit={submit} className="flex flex-col gap-5">{mode === 'cadastro' && <label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input className="h-12 rounded-xl border border-input bg-card px-4 outline-none focus:border-primary" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" className="h-12 rounded-xl border border-input bg-card px-4 outline-none focus:border-primary" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<div className="relative"><input type={mostrarSenha ? 'text' : 'password'} className="h-12 w-full rounded-xl border border-input bg-card px-4 pr-12 outline-none focus:border-primary" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" aria-label="Senha" /><button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>{mostrarSenha ? <EyeOff /> : <Eye />}</button></div></label>{status && <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{status}</p>}<button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90" type="submit">{mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}<ArrowRight /></button></form><p className="mt-7 text-center text-sm text-muted-foreground">{mode === 'login' ? 'Ainda não possui cadastro?' : 'Já possui uma conta?'} <button className="font-semibold text-foreground underline" onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setStatus('') }}>{mode === 'login' ? 'Criar conta' : 'Fazer login'}</button></p></> : <><div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-muted"><UserRound /></div><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Área protegida</p><h2 className="text-4xl font-semibold tracking-tight">Conteúdos</h2><p className="mt-3 leading-relaxed text-muted-foreground">Olá, {perfil?.nome}. Escolha um dos quatro conteúdos para visualizar os detalhes.</p><div className="mt-8 flex flex-col gap-3">{modulos.map((modulo) => <button key={modulo.id} type="button" onClick={() => setModuloSelecionado(modulo.id)} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-primary/5"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">0{modulo.id}</span><span className="flex-1"><strong className="block">{modulo.titulo}</strong><span className="text-sm text-muted-foreground">{modulo.texto}</span></span><ArrowRight className="text-primary" /></button>)}</div><button type="button" onClick={logout} className="mt-6 w-full rounded-xl border border-border py-3 text-sm font-semibold hover:bg-muted">Sair da conta</button>{moduloSelecionado && <div className="fixed inset-0 z-10 grid place-items-center bg-background/80 p-6 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><span className="font-mono text-xs text-primary">MÓDULO 0{moduloSelecionado}</span><h3 className="mt-2 text-2xl font-semibold">{modulos[moduloSelecionado - 1].titulo}</h3></div><button type="button" onClick={() => setModuloSelecionado(null)} className="rounded-lg p-2 hover:bg-muted" aria-label="Fechar conteúdo"><X /></button></div><p className="mt-5 leading-relaxed text-muted-foreground">{modulos[moduloSelecionado - 1].detalhe}</p><button type="button" onClick={() => setModuloSelecionado(null)} className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">Entendi</button></div></div>}</>}</div></section>
  </main>
}
