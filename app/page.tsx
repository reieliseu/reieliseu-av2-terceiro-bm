'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Check, ChevronDown, Eye, EyeOff, GraduationCap, LockKeyhole, Minus, Package, Plus, Search, ShieldCheck, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'

function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] || 'Cliente'
}

type Produto = { id: number; titulo: string; categoria: 'Livros' | 'Cursos'; descricao: string; formato: string; preco: number; destaque?: boolean }
type ItemCarrinho = Produto & { quantidade: number }

const produtos: Produto[] = [
  { id: 1, titulo: 'O Colportor de Sucesso', categoria: 'Livros', descricao: 'Acompanhe a jornada de quem descobriu que cada encontro pode abrir portas para uma vida transformada.', formato: 'Livro físico · 184 páginas', preco: 49.9, destaque: true },
  { id: 2, titulo: 'Conversas que Inspiram', categoria: 'Livros', descricao: 'Conheça histórias de encontros simples que se tornaram pontes de esperança, confiança e novas escolhas.', formato: 'E-book · PDF', preco: 24.9 },
  { id: 3, titulo: 'Colportagem na Prática', categoria: 'Cursos', descricao: 'Siga os primeiros passos de um novo colportor enquanto ele aprende a planejar visitas e transformar metas em conquistas.', formato: 'Curso online · 8 aulas', preco: 89.9, destaque: true },
  { id: 4, titulo: 'Comunicação e Propósito', categoria: 'Cursos', descricao: 'Descubra como ouvir melhor, falar com clareza e conduzir cada conversa com segurança e intenção.', formato: 'Curso online · 5 aulas', preco: 69.9 },
  { id: 5, titulo: 'Manual de Vendas com Propósito', categoria: 'Livros', descricao: 'Uma história sobre ética, serviço e escolhas conscientes para quem acredita que vender também é cuidar.', formato: 'Livro físico · 212 páginas', preco: 59.9 },
  { id: 6, titulo: 'Jornada do Novo Colportor', categoria: 'Cursos', descricao: 'Viva uma trilha de aprendizado que acompanha desafios reais e mostra como começar com confiança e constância.', formato: 'Curso online · 10 aulas', preco: 119.9 },
  { id: 7, titulo: 'Liderança que Serve', categoria: 'Cursos', descricao: 'Aprenda a conduzir equipes com humildade, clareza e foco em resultados que fazem sentido.', formato: 'Curso online · 6 aulas', preco: 79.9 },
  { id: 8, titulo: 'O Poder da Escuta', categoria: 'Livros', descricao: 'Uma leitura prática sobre empatia, presença e diálogos que criam conexões verdadeiras.', formato: 'E-book · PDF', preco: 29.9 },
  { id: 9, titulo: 'Planejamento de Campo', categoria: 'Cursos', descricao: 'Organize sua rotina, suas visitas e suas metas para aproveitar melhor cada dia de trabalho.', formato: 'Curso online · 4 aulas', preco: 54.9 },
  { id: 10, titulo: 'Histórias que Transformam', categoria: 'Livros', descricao: 'Relatos de encontros marcantes que mostram como pequenas atitudes podem mudar grandes jornadas.', formato: 'Livro físico · 168 páginas', preco: 44.9, destaque: true },
  { id: 11, titulo: 'Finanças para Colportores', categoria: 'Cursos', descricao: 'Construa uma relação saudável com dinheiro, planejamento e sustentabilidade na sua missão.', formato: 'Curso online · 7 aulas', preco: 64.9 },
  { id: 12, titulo: 'Guia de Abordagem', categoria: 'Livros', descricao: 'Técnicas simples para iniciar conversas com respeito, naturalidade e confiança.', formato: 'Livro físico · 136 páginas', preco: 39.9 },
  { id: 13, titulo: 'Marketing com Verdade', categoria: 'Cursos', descricao: 'Descubra como comunicar seu trabalho com autenticidade e alcançar as pessoas certas.', formato: 'Curso online · 5 aulas', preco: 74.9 },
  { id: 14, titulo: 'Diálogos de Esperança', categoria: 'Livros', descricao: 'Reflexões para quem deseja levar mensagens positivas e construir pontes em cada encontro.', formato: 'E-book · PDF', preco: 19.9 },
  { id: 15, titulo: 'Mentoria para Novos Colportores', categoria: 'Cursos', descricao: 'Uma trilha guiada para acelerar seu aprendizado e enfrentar os primeiros desafios com apoio.', formato: 'Curso online · 9 aulas', preco: 99.9, destaque: true },
  { id: 16, titulo: 'Caderno de Metas', categoria: 'Livros', descricao: 'Planeje sua semana, acompanhe seus avanços e transforme intenção em constância.', formato: 'Livro físico · 96 páginas', preco: 27.9 },
  { id: 17, titulo: 'Rotina de Alta Performance', categoria: 'Cursos', descricao: 'Organize energia, foco e prioridades para manter uma rotina consistente em cada etapa da colportagem.', formato: 'Curso online · 6 aulas', preco: 69.9 },
  { id: 18, titulo: 'Cartas para uma Nova Jornada', categoria: 'Livros', descricao: 'Mensagens curtas para inspirar decisões corajosas, recomeços e encontros cheios de significado.', formato: 'Livro físico · 120 páginas', preco: 34.9 },
]

const dinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const historias: Record<number, string> = {
  1: 'Acompanhe a transformação de alguém que começa inseguro, aprende a ouvir e descobre que o verdadeiro sucesso nasce quando conhecimento e serviço caminham juntos.',
  2: 'Entre conversas simples e encontros inesperados, esta história mostra como uma palavra atenciosa pode abrir espaço para esperança, confiança e novas escolhas.',
  3: 'Conheça os primeiros desafios de um novo colportor: planejar visitas, superar receios e transformar cada meta em uma conquista construída com constância.',
  4: 'Uma jornada sobre escuta, clareza e propósito. O conteúdo acompanha situações reais para mostrar como cada conversa pode ser conduzida com mais segurança.',
  5: 'Uma narrativa sobre ética, cuidado e responsabilidade, lembrando que vender com propósito é entender necessidades e oferecer valor de forma honesta.',
  6: 'Siga uma trilha completa de aprendizado, do primeiro planejamento aos dias de campo, acompanhando escolhas, erros e pequenas vitórias de quem está começando.',
  7: 'Descubra como liderar sem perder a humanidade. Esta jornada apresenta decisões práticas para formar equipes confiáveis e inspirar pelo exemplo.',
  8: 'Uma leitura sobre presença e empatia que mostra como escutar de verdade pode transformar uma conversa comum em uma conexão que permanece.',
  9: 'Acompanhe a organização de uma rotina de campo e aprenda a equilibrar visitas, metas e descanso para trabalhar com mais clareza e intenção.',
  10: 'Relatos de encontros marcantes revelam como atitudes pequenas, feitas no momento certo, podem mudar o rumo de uma pessoa e também de quem serve.',
  11: 'Uma jornada prática para compreender ganhos, gastos e planejamento, construindo tranquilidade financeira sem perder de vista o propósito do trabalho.',
  12: 'Aprenda a iniciar conversas de forma natural, respeitosa e confiante, encontrando a melhor abordagem para cada pessoa e cada contexto.',
  13: 'Uma história sobre comunicar com verdade: apresentar seu trabalho, criar presença e alcançar pessoas sem abrir mão da autenticidade.',
  14: 'Reflexões breves para dias corridos, com mensagens que encorajam recomeços e ajudam a levar esperança para cada novo encontro.',
  15: 'Uma trilha acompanhada para os primeiros passos, com orientação, exercícios e decisões que ajudam novos colportores a avançar com confiança.',
  16: 'Mais do que um caderno, um espaço para transformar planos em hábitos, registrar aprendizados e enxergar o progresso de cada semana.',
  17: 'Uma jornada para organizar foco, energia e prioridades, criando uma rotina possível e sustentável para fazer cada dia render melhor.',
  18: 'Cartas curtas para acompanhar recomeços, lembrar o valor de cada passo e inspirar coragem quando uma nova jornada está apenas começando.',
}

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
  const [pagamento, setPagamento] = useState<'pix' | 'cartao'>('pix')
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [segurancaAberta, setSegurancaAberta] = useState(false)
  const [catalogo, setCatalogo] = useState<Produto[]>(produtos)

  useEffect(() => {
    const carregarCatalogo = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' })
        if (!response.ok) throw new Error('Falha ao carregar catálogo')
        const dados = await response.json()
        setCatalogo(dados.map((produto: { id: number; title: string; category: 'Livros' | 'Cursos'; description: string; format: string; priceCents: number; featured: boolean }) => ({ id: produto.id, titulo: produto.title, categoria: produto.category, descricao: produto.description, formato: produto.format, preco: produto.priceCents / 100, destaque: produto.featured })))
      } catch {
        setStatus('Não foi possível atualizar o catálogo agora. Exibindo os itens disponíveis.')
      }
    }
    void carregarCatalogo()

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
    if (mode === 'cadastro') {
      localStorage.setItem('conta', JSON.stringify({ nome, email, senha }))
      setStatus('Cadastro realizado. Agora entre na sua conta.')
      setMode('login')
      setSenha('')
      return
    }

    const contaSalva = localStorage.getItem('conta')
    const conta = contaSalva ? JSON.parse(contaSalva) as { nome: string; email: string; senha: string } : null
    if (conta && (conta.email !== email || conta.senha !== senha)) {
      setStatus('E-mail ou senha incorretos.')
      return
    }

    const nomeUsuario = conta?.nome || localStorage.getItem('nome') || email.split('@')[0] || 'Cliente'
    localStorage.setItem('token', `demo-token-${Date.now()}`)
    localStorage.setItem('nome', nomeUsuario)
    localStorage.setItem('email', email)
    setPerfil({ nome: primeiroNome(nomeUsuario), email })
    setCliente((atual) => ({ ...atual, nome: nomeUsuario, email }))
    setLogged(true)
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

  const produtosFiltrados = useMemo(() => catalogo.filter((produto) => {
    const correspondeCategoria = categoria === 'Todos' || produto.categoria === categoria
    const termo = busca.toLocaleLowerCase('pt-BR')
    return correspondeCategoria && `${produto.titulo} ${produto.descricao}`.toLocaleLowerCase('pt-BR').includes(termo)
  }), [busca, categoria, catalogo])
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0)
  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

  async function finalizarPedido(event: React.FormEvent) {
    event.preventDefault()
    if (!cliente.nome || !cliente.email || !cliente.telefone) { setErroCheckout('Preencha nome, e-mail e telefone para continuar.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) { setErroCheckout('Digite um e-mail válido para receber a confirmação.'); return }
    if (!carrinho.length) { setErroCheckout('Adicione pelo menos um item ao carrinho.'); return }
    setErroCheckout('')
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: carrinho.map(({ id, quantidade }) => ({ id, quantidade })), customer: cliente, paymentMethod: pagamento }) })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Não foi possível iniciar o pagamento.')
      window.location.href = data.url
    } catch (error) {
      setErroCheckout(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.')
    }
  }

  return <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
    {!logged ? <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div><div className="mb-20 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary-foreground text-primary"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">COLPORTAGEM STOR</span></div><div className="max-w-lg"><p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">Livros e cursos para sua jornada</p><h1 className="text-balance text-6xl font-semibold leading-[1.02] tracking-tight"><ShieldCheck className="mb-3 inline-block size-12 align-middle text-primary-foreground/70" aria-label="Compra segura" /> Conhecimento que inspira ação.</h1><p className="mt-7 max-w-md text-lg leading-relaxed text-primary-foreground/70">Conteúdos para aprender com propósito, servir com confiança e transformar cada conversa em uma oportunidade.</p></div></div><div className="grid grid-cols-2 gap-8 border-t border-primary-foreground/20 pt-7 text-sm"><div><BookOpen className="mb-3" /><strong className="block">Conteúdos selecionados</strong><span className="text-primary-foreground/60">Para sua jornada</span></div><div><Check className="mb-3" /><strong className="block">Investimento perfeito</strong><span className="text-primary-foreground/60">Catálogo e carrinho</span></div></div></section>
      <section className="flex min-h-screen items-center justify-center p-6 sm:p-12"><div className="w-full max-w-2xl"><div className="mb-10 lg:hidden"><div className="mb-8 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole /></div><span className="font-mono text-sm font-bold tracking-widest">COLPORTAGEM STOR</span></div></div><div className="mb-8"><p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Área do cliente</p><h2 className="text-4xl font-semibold tracking-tight">{mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h2><p className="mt-3 leading-relaxed text-muted-foreground">{mode === 'login' ? 'Entre para acessar livros e cursos selecionados.' : 'Cadastre-se para começar sua jornada de aprendizado.'}</p></div><form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-5"><button type="button" onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setStatus(''); setSenha('') }} className="order-last mt-2 self-center rounded-lg px-3 py-2 text-sm text-primary underline underline-offset-4 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</button>{mode === 'cadastro' && <label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input className="h-12 rounded-xl border border-input bg-card px-4 outline-none focus:border-primary" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" className="h-12 rounded-xl border border-input bg-card px-4 outline-none focus:border-primary" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<div className="relative"><input type={mostrarSenha ? 'text' : 'password'} className="h-12 w-full rounded-xl border border-input bg-card px-4 pr-12 outline-none focus:border-primary" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" aria-label="Senha" /><button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>{mostrarSenha ? <EyeOff /> : <Eye />}</button></div></label>{status && <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{status}</p>}<button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90">{mode === 'login' ? 'Entrar na loja' : 'Criar conta'} <UserRound /></button></form><button type="button" onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setStatus('') }} className="mx-auto mt-6 block text-sm text-muted-foreground underline underline-offset-4">{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</button></div></section>
    </div> : <div className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="sticky top-0 z-30 -mx-5 mb-10 flex flex-wrap items-center justify-between gap-5 border-b border-border/70 bg-background/90 px-5 py-5 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-editorial"><BookOpen /></div><div><p className="font-mono text-xs font-bold tracking-[0.25em] text-primary">COLPORTAGEM STOR</p><span className="text-xs text-muted-foreground">Livros e cursos com propósito</span></div></div><div className="flex items-center gap-3"><button type="button" onClick={() => setCarrinhoAberto(true)} className="relative flex size-11 items-center justify-center rounded-xl border border-input hover:bg-muted" aria-label={`Abrir carrinho com ${totalItens} itens`}><ShoppingBag />{totalItens > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{totalItens}</span>}</button><div className="hidden text-right sm:block"><p className="text-sm font-medium">Olá, {perfil?.nome || 'Cliente'}.</p><p className="text-xs text-muted-foreground">{perfil?.email}</p></div><button type="button" onClick={logout} className="rounded-lg border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Sair</button></div></header>
      <section className="relative mb-12 overflow-hidden rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-editorial sm:p-10 lg:p-14"><div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border-[38px] border-accent/25" /><div className="relative max-w-3xl"><p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-primary-foreground/65">Uma curadoria para sua caminhada</p><h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Conhecimento que encontra propósito.</h1><p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/75 sm:text-lg">Livros e cursos para aprender, servir e transformar cada conversa em uma nova oportunidade.</p><div className="mt-8 flex flex-wrap gap-3 text-sm"><button type="button" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 transition hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Conteúdo selecionado</button><button type="button" onClick={() => setSegurancaAberta(true)} className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 transition hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Compra segura</button></div></div></section>
      <div id="catalogo" className="mb-8 flex scroll-mt-28 flex-col gap-5 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Catálogo curado</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Escolha seu próximo passo</h2><p className="mt-2 text-sm text-muted-foreground">Materiais para cada fase da sua jornada.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><span className="sr-only">Buscar produtos</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar livros ou cursos" className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm outline-none focus:border-primary sm:w-64" /></label><div className="flex rounded-xl border border-input bg-background/70 p-1 shadow-sm">{(['Todos', 'Livros', 'Cursos'] as const).map((opcao) => <button key={opcao} type="button" onClick={() => setCategoria(opcao)} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${categoria === opcao ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>{opcao}</button>)}</div></div></div>
      {produtosFiltrados.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center"><Package className="mx-auto mb-3 text-muted-foreground" /><p className="font-medium">Nenhum produto encontrado</p><p className="mt-1 text-sm text-muted-foreground">Tente outra busca ou categoria.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{produtosFiltrados.map((produto) => <article key={produto.id} className="group flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-editorial"><div className="mb-6 flex items-start justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-muted">{produto.categoria === 'Livros' ? <BookOpen /> : <GraduationCap />}</div>{produto.destaque && <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Destaque</span>}</div><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{produto.categoria} · {produto.formato}</span><h3 className="mt-3 text-xl font-semibold">{produto.titulo}</h3><button type="button" onClick={() => setProdutoSelecionado(produto)} className="mt-3 min-h-20 w-full rounded-xl text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Resumo e história</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{produto.descricao}</p><span className="mt-2 inline-block text-xs font-semibold text-primary">Clique para ler a história completa</span></button><div className="mt-auto flex items-end justify-between gap-3 pt-6"><strong className="text-xl">{dinheiro.format(produto.preco)}</strong><button type="button" onClick={() => { adicionar(produto); setCarrinhoAberto(true) }} className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus /> Adicionar</button></div></article>)}</div>}
      <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">Colportagem Stor · Conhecimento que se compartilha</footer>
    </div>}
    {segurancaAberta && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-5 backdrop-blur-sm" role="presentation" onClick={() => setSegurancaAberta(false)}><div role="dialog" aria-modal="true" aria-labelledby="seguranca-titulo" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-editorial" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Compra segura</p><h2 id="seguranca-titulo" className="mt-2 text-2xl font-semibold">Você compra com tranquilidade</h2></div><button type="button" onClick={() => setSegurancaAberta(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar informações de segurança"><X /></button></div><div className="space-y-4 text-sm leading-6 text-muted-foreground"><p>Seus dados são enviados somente para iniciar o pagamento seguro pelo Stripe.</p><p>Os preços e as quantidades são conferidos no servidor antes da cobrança.</p><p>Escolha Pix ou cartão no checkout e finalize sem sair do fluxo protegido.</p></div><button type="button" onClick={() => setSegurancaAberta(false)} className="mt-6 h-11 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">Entendi</button></div></div>}
    {produtoSelecionado && <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-5 backdrop-blur-sm" role="presentation" onClick={() => setProdutoSelecionado(null)}><div role="dialog" aria-modal="true" aria-labelledby="produto-titulo" className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-editorial" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Resumo e história</p><h2 id="produto-titulo" className="mt-2 text-2xl font-semibold">{produtoSelecionado.titulo}</h2></div><button type="button" onClick={() => setProdutoSelecionado(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar resumo"><X /></button></div><p className="leading-7 text-muted-foreground">{produtoSelecionado.descricao}</p><div className="mt-6 rounded-xl bg-muted p-4"><p className="text-sm font-semibold">A história por trás deste material</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{historias[produtoSelecionado.id] || produtoSelecionado.descricao}</p></div><div className="mt-6 flex items-center justify-between gap-4"><strong className="text-xl">{dinheiro.format(produtoSelecionado.preco)}</strong><button type="button" onClick={() => { adicionar(produtoSelecionado); setProdutoSelecionado(null) }} className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">Adicionar ao carrinho</button></div></div></div>}
    {carrinhoAberto && <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" role="presentation" onClick={() => setCarrinhoAberto(false)}><aside role="dialog" aria-modal="true" aria-labelledby="carrinho-titulo" className="ml-auto flex h-full w-full max-w-md flex-col border-l border-border bg-card p-6 shadow-editorial" onClick={(event) => event.stopPropagation()}><div className="mb-7 flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Seu pedido</p><h2 id="carrinho-titulo" className="mt-2 text-2xl font-semibold">Carrinho</h2></div><button type="button" onClick={() => setCarrinhoAberto(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar carrinho"><X /></button></div>{carrinho.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><ShoppingBag className="mb-4 text-muted-foreground" /><p className="font-medium">Seu carrinho está vazio</p><p className="mt-2 text-sm text-muted-foreground">Adicione um livro ou curso para continuar.</p></div> : <><div className="flex flex-1 flex-col gap-4 overflow-auto">{carrinho.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.titulo}</p><p className="mt-1 text-sm text-muted-foreground">{dinheiro.format(item.preco)} cada</p></div><button type="button" onClick={() => setCarrinho((atual) => atual.filter((produto) => produto.id !== item.id))} className="text-muted-foreground hover:text-foreground" aria-label={`Remover ${item.titulo}`}><Trash2 /></button></div><div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2 rounded-lg border border-input"><button type="button" onClick={() => alterarQuantidade(item.id, -1)} className="p-2" aria-label="Diminuir quantidade"><Minus /></button><span className="min-w-6 text-center text-sm">{item.quantidade}</span><button type="button" onClick={() => alterarQuantidade(item.id, 1)} className="p-2" aria-label="Aumentar quantidade"><Plus /></button></div><strong>{dinheiro.format(item.preco * item.quantidade)}</strong></div></div>)}</div><div className="border-t border-border pt-5"><div className="mb-4 flex justify-between text-lg"><span>Total</span><strong>{dinheiro.format(total)}</strong></div><button type="button" onClick={() => { setCarrinhoAberto(false); setCheckoutAberto(true) }} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90">Continuar pedido <ChevronDown /></button></div></>}</aside></div>}
    {checkoutAberto && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-5 backdrop-blur-sm" role="presentation" onClick={() => setCheckoutAberto(false)}><div role="dialog" aria-modal="true" aria-labelledby="checkout-titulo" className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>{pedidoEnviado ? <div className="py-8 text-center"><div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></div><h2 className="text-2xl font-semibold">Pedido recebido</h2><p className="mt-3 leading-7 text-muted-foreground">Obrigado, {primeiroNome(cliente.nome)}. Em breve entraremos em contato para confirmar seu pedido.</p><button type="button" onClick={() => { setCheckoutAberto(false); setPedidoEnviado(false) }} className="mt-7 h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Voltar ao catálogo</button></div> : <><div className="mb-6 flex items-start justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Finalizar pedido</p><h2 id="checkout-titulo" className="mt-2 text-2xl font-semibold">Seus dados</h2></div><button type="button" onClick={() => setCheckoutAberto(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar checkout"><X /></button></div><form onSubmit={finalizarPedido} className="flex flex-col gap-4"><fieldset className="flex flex-col gap-3"><legend className="text-sm font-medium">Forma de pagamento</legend><div className="grid gap-3 sm:grid-cols-2"><label className={`cursor-pointer rounded-xl border p-4 transition ${pagamento === 'pix' ? 'border-primary bg-primary/10' : 'border-input'}`}><input type="radio" name="pagamento" value="pix" checked={pagamento === 'pix'} onChange={() => setPagamento('pix')} className="sr-only" /><span className="font-semibold">Pix</span><span className="mt-1 block text-xs text-muted-foreground">Pagamento instantâneo e seguro</span></label><label className={`cursor-pointer rounded-xl border p-4 transition ${pagamento === 'cartao' ? 'border-primary bg-primary/10' : 'border-input'}`}><input type="radio" name="pagamento" value="cartao" checked={pagamento === 'cartao'} onChange={() => setPagamento('cartao')} className="sr-only" /><span className="font-semibold">Cartão</span><span className="mt-1 block text-xs text-muted-foreground">Pagamento protegido pelo Stripe</span></label></div></fieldset><label className="flex flex-col gap-2 text-sm font-medium">Nome completo<input value={cliente.nome} onChange={(event) => setCliente({ ...cliente, nome: event.target.value })} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" /></label><label className="flex flex-col gap-2 text-sm font-medium">E-mail<input type="email" value={cliente.email} onChange={(event) => setCliente({ ...cliente, email: event.target.value })} className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" /></label><label className="flex flex-col gap-2 text-sm font-medium">Telefone<input type="tel" value={cliente.telefone} onChange={(event) => setCliente({ ...cliente, telefone: event.target.value })} placeholder="(00) 00000-0000" className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" /></label>{erroCheckout && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erroCheckout}</p>}<div className="rounded-xl bg-muted p-4"><div className="flex justify-between text-sm text-muted-foreground"><span>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span><strong className="text-foreground">{dinheiro.format(total)}</strong></div></div><button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-90">Enviar pedido <Package /></button></form></>}</div></div>}
  </main>
}
