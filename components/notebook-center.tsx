"use client"

import Link from "next/link"
import { ArrowLeft, ArrowUp, BookOpen, PanelLeftOpen, PanelRightOpen } from "lucide-react"
import { useState, type FormEvent } from "react"
import type { NotebookSource } from "@/components/notebook-types"

type NotebookCenterProps = {
  sources: NotebookSource[]
  title: string
  onTitleChange: (title: string) => void
  onOpenSources: () => void
  onOpenStudio: () => void
  showSourcesToggle: boolean
  showStudioToggle: boolean
  onSubmitPrompt: (prompt: string) => void
  promptMessage: string
}

export function NotebookCenter({
  sources,
  title,
  onTitleChange,
  onOpenSources,
  onOpenStudio,
  showSourcesToggle,
  showStudioToggle,
  onSubmitPrompt,
  promptMessage,
}: NotebookCenterProps) {
  const [prompt, setPrompt] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!prompt.trim()) return
    onSubmitPrompt(prompt.trim())
    setPrompt("")
  }

  return (
    <main className="relative flex h-full min-h-0 min-w-0 flex-col bg-[#090909] text-[#e7e7e7]">
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 lg:hidden">
        <button className="rounded-full bg-[#171717] px-3 py-2 text-xs text-[#d5d5d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" onClick={onOpenSources}>Fontes</button>
        <span className="text-xs text-[#888]">Notebook</span>
        <button className="rounded-full bg-[#171717] px-3 py-2 text-xs text-[#d5d5d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" onClick={onOpenStudio}>Estúdio</button>
      </div>

      <div className="mx-auto w-full max-w-[760px] shrink-0 px-7 pt-3 sm:px-10 lg:px-7 lg:pt-3">
        <div className="flex items-center justify-between">
          <BookOpen size={23} className="text-[#8b71a7]" aria-hidden="true" />
          <Link className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs text-[#999] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" href="/" aria-label="Sair do Notebook e voltar à página inicial">
            <ArrowLeft size={14} aria-hidden="true" /> Sair
          </Link>
        </div>
        <label className="sr-only" htmlFor="notebook-title">Nome do notebook</label>
        <input
          id="notebook-title"
          className="mt-[76px] block w-full max-w-[720px] bg-transparent text-[28px] font-normal tracking-[-0.04em] text-[#d2d2d2] outline-none placeholder:text-[#888] focus-visible:ring-1 focus-visible:ring-violet-400/50 sm:text-[36px]"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label="Nome do notebook"
        />
        <p className="mt-1 text-[13px] text-[#969696]">{sources.length} {sources.length === 1 ? "fonte" : "fontes"}</p>
      </div>

      {showSourcesToggle && (
        <button className="absolute left-3 top-3 z-10 hidden size-8 place-items-center rounded-full text-[#999] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:grid" type="button" aria-label="Mostrar painel de Fontes" onClick={onOpenSources}>
          <PanelLeftOpen size={16} aria-hidden="true" />
        </button>
      )}
      {showStudioToggle && (
        <button className="absolute right-3 top-3 z-10 hidden size-8 place-items-center rounded-full text-[#999] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:grid" type="button" aria-label="Mostrar painel do Estúdio" onClick={onOpenStudio}>
          <PanelRightOpen size={16} aria-hidden="true" />
        </button>
      )}

      <div className="min-h-0 flex-1" aria-live="polite">
        {promptMessage && <p className="sr-only">{promptMessage}</p>}
      </div>

      <div className="shrink-0 px-4 pb-0 pt-3 sm:px-6">
        {promptMessage && <p className="mx-auto mb-2 w-full max-w-[628px] text-xs text-[#aaa]" role="status">{promptMessage}</p>}
        <form className="mx-auto flex min-h-[60px] w-full max-w-[628px] items-center gap-3 rounded-full border border-[#242424] bg-[#161616] px-4 py-2.5 sm:px-5" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="notebook-prompt">Mensagem para o notebook</label>
          <input
            id="notebook-prompt"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#e3e3e3] outline-none placeholder:text-[#666]"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Comece a digitar..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
            }}
          />
          <span className="shrink-0 text-xs text-[#777]">{sources.length} {sources.length === 1 ? "fonte" : "fontes"}</span>
          <button className="grid size-9 shrink-0 place-items-center rounded-full bg-[#242424] text-[#777] transition hover:bg-[#313131] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="submit" aria-label="Enviar mensagem" disabled={!prompt.trim() || sources.length === 0}>
            <ArrowUp size={17} aria-hidden="true" />
          </button>
          <span className="sr-only">Adicione ao menos uma fonte para conversar com o notebook.</span>
        </form>
      </div>
    </main>
  )
}
