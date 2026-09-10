'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BookOpen, Check, ChevronDown, Eye, EyeOff, GraduationCap, LockKeyhole, Minus, Package, Plus, Search, ShieldCheck, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'

const api = axios.create({ baseURL: 'http://localhost:3001' })
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] || 'Cliente'
}

type Produto = { id: number; titulo: string; categoria: 'Livros' | 'Cursos'; descricao: string; formato: string; preco: number; destaque?: boolean }
type ItemCarrinho = Produto & { quantidade: number }

const produtos: Produto[] = [
  { id: 1, titulo: 'O Colportor de Sucesso', categoria: 'Livros', descricao: 'Princípios, técnicas e propósito para uma colportagem transformadora.', formato: 'Livro físico · 184 páginas', preco: 49.9, destaque: true },
  { id: 2, titulo: 'Conversas que Inspiram', categoria: 'Livros', descricao: 'Um guia prático para apresentar livros e criar conexões genuínas.', formato: 'E-book · PDF', preco: 24.9 },
  { id: 3, titulo: 'Colportagem na Prática', categoria: 'Cursos', descricao: 'Aprenda abordagem, planejamento de visitas e organização de metas.', formato: 'Curso online · 8 aulas', preco: 89.9, destaque: true },
  { id: 4, titulo: 'Comunicação e Propósito', categoria: 'Cursos', descricao: 'Desenvolva escuta, clareza e segurança para cada atendimento.', formato: 'Curso online · 5 aulas', preco: 69.9 },
  { id: 5, titulo: 'Manual de Vendas com Propósito', categoria: 'Livros', descricao: 'Estratégias éticas para conduzir conversas e apresentar soluções.', formato: 'Livro físico · 212 páginas', preco: 59.9 },
  { id: 6, titulo: 'Jornada do Novo Colportor', categoria: 'Cursos', descricao: 'Uma trilha completa para começar com confiança e consistência.', formato: 'Curso online · 10 aulas', preco: 119.9 },
]

const dinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Page() {
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState('')
  const [logged, setLogged] = useState(false)
  const [perfil, setPerfil] = useState<{ nome: string; email: string } | null>(null)
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<'Todos' | 'Livros' | 'Cursos'>('Todos')
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [checkoutAberto, setCheckoutAberto] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [cliente, setCliente] = useState({ nome: '', email: '', telefone: '' })
  const [erroCheckout, setErroCheckout] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const nomeSalvo = localStorage.getItem('nome') || 'Cliente'
      const emailSalvo = localStorage.getItem('email') || 'cliente@exemplo.com'
      setLogged(true)
      setPerfil({ nome: primeiroNome(nomeSalvo), email: emailSalvo })
      setCliente({ nome: nomeSalvo, email: emailSalvo, telefone: '' })
    }
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('')
    if (!email || !senha || (mode === 'cadastro' && !nome)) { setStatus('Preencha todos os campos obrigatórios.'); return }
    try {
      if (mode === 'cadastro') {
        await api.post('/usuarios', { nome, email, senha })
        setStatus('Cadastro realizado. Agora entre na sua conta.')
        setMode('login')
      } else {
        const response = await api.post('/login', { email, senha })
        const nomeUsuario = localStorage.getItem('nome') || nome || email.split('@')[0] || 'Cliente'
        localStorage.setItem('token', response.data?.token || `demo-token-${Date.now()}`)
        localStorage.setItem('nome', nomeUsuario)
        localStorage.setItem('email', email)
        setPerfil({ nome: primeiroNome(nomeUsuario), email })
        setCliente((atual) => ({ ...atual, nome: nomeUsuario, email }))
        setLogged(true)
      }
    } catch {
      const nomeUsuario = localStorage.getItem('nome') || nome || email.split('@')[0] || 'Cliente'
      localStorage.setItem('token', `demo-token-${Date.now()}`)
      localStorage.setItem('nome', nomeUsuario)
      localStorage.setItem('email', email)
      setPerfil({ nome: primeiroNome(nomeUsuario), email })
      setCliente((atual) => ({ ...atual, nome: nomeUsuario, email }))
      setLogged(true)
      setStatus('API indisponível no preview. Demonstração local ativada.')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setLogged(false)
    setPerfil(null)
    setCarrinho([])
    setStatus('Sessão encerrada com segurança.')
  }

  function adicionar(produto: Produto) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.id === produto.id)
      if (existente) return atual.map((item) => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item)
      return [...atual, { ...produto, quantidade: 1 }]
    })
  }

  function alterarQuantidade(id: number, delta: number) {
    setCarrinho((atual) => atual.flatMap((item) => item.id === id ? (item.quantidade + delta > 0 ? [{ ...item, quantidade: item.quantidade + delta }] : []) : [item]))
  }

  const produtosFiltrados = useMemo(() => produtos.filter((produto) => {
    const correspondeCategoria = categoria === 'Todos' || produto.categoria === categoria
    const termo = busca.toLocaleLowerCase('pt-BR')
    return correspondeCategoria && `${produto.titulo} ${produto.descricao}`.toLocaleLowerCase('pt-BR').includes(termo)
  }), [busca, categoria])
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0)
  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

  function finalizarPedido(event: React.FormEvent) {
    event.preventDefault()
    if (!cliente.nome || !cliente.email || !cliente.telefone) { setErroCheckout('Preencha nome, e-mail e telefone para continuar.'); return }
    setErroCheckout('')
    setPedidoEnviado(true)
    setCarrinho([])
  }

  return <main className="min-h-screen bg-background text-foreground">
    {!logged ? <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div><div className="mb-20 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary-foreground text-primary"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">COLPORTAGEM STOR</span></div><div className="max-w-lg"><p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">Livros e cursos para sua jornada</p><h1 className="text-balance text-6xl font-semibold leading-[1.02] tracking-tight"><ShieldCheck className="mb-3 inline-block size-12 align-middle text-primary-foreground/70" aria-label="Compra segura" /> Conhecimento que inspira ação.</h1><p className="mt-7 max-w-md text-lg leading-relaxed text-primary-foreground/70">Conteúdos para aprender com propósito, servir com confiança e transformar cada conversa em uma oportunidade.</p></div></div><div className="grid grid-cols-2 gap-8 border-t border-primary-foreground/20 pt-7 text-sm"><div><BookOpen className="mb-3" /><strong className="block">Conteúdos selecionados</strong><span className="text-primary-foreground/60">Para sua jornada</span></div><div><Check className="mb-3" /><strong className="block">Investimento perfeito</strong><span className="text-primary-foreground/60">Catálogo e carrinho</span></div></div></section>
      <section className="flex min-h-screen items-center justify-center p-6 sm:p-12"><div className="w-full max-w-2xl"><div className="mb-10 lg:hidden"><div className="mb-8 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">COLPORTAGEM STOR</span></div></div><div className="mb-8"><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Área do cliente</p><h2 className="text-4xl font-semibold tracking-tight">{mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{mode === 'login' ? 'Entre para acessar livros e cursos selecionados.' : 'Cadastre-se para começar sua jornada de aprendizado.'}</p></div><form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-5">{mode === 'cadastro' && <label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input className="h-12 rounded-xl border border-input bg-card px-4 outline-none focus:border-primary" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" className="h-12 rounded-xl border border-input bg-card px-4 outline-none focus:border-primary" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<div className="relative"><input type={mostrarSenha ? 'text' : 'password'} className="h-12 w-full rounded-xl border border-input bg-card px-4 pr-12 outline-none focus:border-primary" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" aria-label="Senha" /><button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>{mostrarSenha ? <EyeOff /> : <Eye />}</button></div></label>{status && <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{status}</p>}<button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90">{mode === 'login' ? 'Entrar na loja' : 'Criar conta'} <UserRound /></button></form><button type="button" onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setStatus('') }} className="mx-auto mt-6 block text-sm text-muted-foreground underline underline-offset-4">{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</button></div></section>
    </div> : <div className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-5 border-b border-border pb-6"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen /></div><div><p className="font-mono text-xs font-bold tracking-[0.25em]">COLPORTAGEM STOR</p><span className="text-xs text-muted-foreground">Livros e cursos com propósito</span></div></div><div className="flex items-center gap-3"><button type="button" onClick={() => setCarrinhoAberto(true)} className="relative flex size-11 items-center justify-center rounded-xl border border-input hover:bg-muted" aria-label={`Abrir carrinho com ${totalItens} itens`}><ShoppingBag />{totalItens > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{totalItens}</span>}</button><div className="hidden text-right sm:block"><p className="text-sm font-medium">Olá, {perfil?.nome || 'Cliente'}.</p><p className="text-xs text-muted-foreground">{perfil?.email}</p></div><button type="button" onClick={logout} className="rounded-lg border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Sair</button></div></header>
      <section className="mb-10 grid gap-8 rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground/60">Nossa vitrine</p><h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Aprenda. Compartilhe. Transforme.</h1><p className="mt-4 max-w-xl leading-7 text-primary-foreground/70">Encontre livros e cursos para desenvolver sua colportagem com conhecimento, ética e propósito.</p></div><div className="hidden rounded-2xl border border-primary-foreground/20 p-5 lg:block"><GraduationCap className="mb-5" /><p className="font-semibold">Sua jornada começa aqui</p><p className="mt-1 text-sm text-primary-foreground/60">Conteúdos para todos os níveis.</p></div></section>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Catálogo</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Escolha seu próximo passo</h2></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><span className="sr-only">Buscar produtos</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar livros ou cursos" className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm outline-none focus:border-primary sm:w-64" /></label><div className="flex rounded-xl border border-input bg-card p-1">{(['Todos', 'Livros', 'Cursos'] as const).map((opcao) => <button key={opcao} type="button" onClick={() => setCategoria(opcao)} className={`rounded-lg px-3 py-2 text-sm transition ${categoria === opcao ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{opcao}</button>)}</div></div></div>
      {produtosFiltrados.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center"><Package className="mx-auto mb-3 text-muted-foreground" /><p className="font-medium">Nenhum produto encontrado</p><p className="mt-1 text-sm text-muted-foreground">Tente outra busca ou categoria.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{produtosFiltrados.map((produto) => <article key={produto.id} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/60"><div className="mb-6 flex items-start justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-muted">{produto.categoria === 'Livros' ? <BookOpen /> : <GraduationCap />}</div>{produto.destaque && <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Destaque</span>}</div><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{produto.categoria} · {produto.formato}</span><h3 className="mt-3 text-xl font-semibold">{produto.titulo}</h3><p className="mt-2 min-h-14 text-sm leading-6 text-muted-foreground">{produto.descricao}</p><div className="mt-auto flex items-end justify-between gap-3 pt-6"><strong className="text-xl">{dinheiro.format(produto.preco)}</strong><button type="button" onClick={() => adicionar(produto)} className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus /> Adicionar</button></div></article>)}</div>}
      <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">Colportagem Stor · Conhecimento que se compartilha</footer>
    </div>}
    {carrinhoAberto && <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" role="presentation" onClick={() => setCarrinhoAberto(false)}><aside role="dialog" aria-modal="true" aria-labelledby="carrinho-titulo" className="ml-auto flex h-full w-full max-w-md flex-col border-l border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-7 flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Seu pedido</p><h2 id="carrinho-titulo" className="mt-2 text-2xl font-semibold">Carrinho</h2></div><button type="button" onClick={() => setCarrinhoAberto(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar carrinho"><X /></button></div>{carrinho.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><ShoppingBag className="mb-4 text-muted-foreground" /><p className="font-medium">Seu carrinho está vazio</p><p className="mt-2 text-sm text-muted-foreground">Adicione um livro ou curso para continuar.</p></div> : <><div className="flex flex-1 flex-col gap-4 overflow-auto">{carrinho.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.titulo}</p><p className="mt-1 text-sm text-muted-foreground">{dinheiro.format(item.preco)} cada</p></div><button type="button" onClick={() => setCarrinho((atual) => atual.filter((produto) => produto.id !== item.id))} className="text-muted-foreground hover:text-foreground" aria-label={`Remover ${item.titulo}`}><Trash2 /></button></div><div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2 rounded-lg border border-input"><button type="button" onClick={() => alterarQuantidade(item.id, -1)} className="p-2" aria-label="Diminuir quantidade"><Minus /></button><span className="min-w-6 text-center text-sm">{item.quantidade}</span><button type="button" onClick={() => alterarQuantidade(item.id, 1)} className="p-2" aria-label="Aumentar quantidade"><Plus /></button></div><strong>{dinheiro.format(item.preco * item.quantidade)}</strong></div></div>)}</div><div className="border-t border-border pt-5"><div className="mb-4 flex justify-between text-lg"><span>Total</span><strong>{dinheiro.format(total)}</strong></div><button type="button" onClick={() => { setCarrinhoAberto(false); setCheckoutAberto(true) }} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90">Continuar pedido <ChevronDown /></button></div></>}</aside></div>}
    {checkoutAberto && <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-5 backdrop-blur-sm" role="presentation" onClick={() => setCheckoutAberto(false)}><div role="dialog" aria-modal="true" aria-labelledby="checkout-titulo" className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>{pedidoEnviado ? <div className="py-8 text-center"><div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></div><h2 className="text-2xl font-semibold">Pedido recebido</h2><p className="mt-3 leading-7 text-muted-foreground">Obrigado, {primeiroNome(cliente.nome)}. Em breve entraremos em contato para confirmar seu pedido.</p><button type="button" onClick={() => { setCheckoutAberto(false); setPedidoEnviado(false) }} className="mt-7 h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Voltar ao catálogo</button></div> : <><div className="mb-6 flex items-start justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Finalizar pedido</p><h2 id="checkout-titulo" className="mt-2 text-2xl font-semibold">Seus dados</h2></div><button type="button" onClick={() => setCheckoutAberto(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar checkout"><X /></button></div><form onSubmit={finalizarPedido} className="flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input value={cliente.nome} onChange={(event) => setCliente({ ...cliente, nome: event.target.value })} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" /></label><label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" value={cliente.email} onChange={(event) => setCliente({ ...cliente, email: event.target.value })} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" /></label><label className="flex flex-col gap-2 text-sm font-medium">Telefone<input type="tel" value={cliente.telefone} onChange={(event) => setCliente({ ...cliente, telefone: event.target.value })} placeholder="(00) 00000-0000" className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" /></label>{erroCheckout && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erroCheckout}</p>}<div className="rounded-xl bg-muted p-4"><div className="flex justify-between text-sm text-muted-foreground"><span>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span><strong className="text-foreground">{dinheiro.format(total)}</strong></div></div><button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90">Enviar pedido <Package /></button></form></>}</div></div>}
  </main>
}
