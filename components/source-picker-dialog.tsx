"use client"

import { useEffect, useRef, type KeyboardEvent } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Clipboard, Globe, HardDrive, Link2, Play, Sparkles, Upload, X } from "lucide-react"
import type { SourceKind } from "@/components/notebook-types"

type SourcePickerDialogProps = {
  query: string
  sourceKind: SourceKind
  quickSearch: boolean
  onQueryChange: (query: string) => void
  onSourceKindChange: (kind: SourceKind) => void
  onToggleQuickSearch: () => void
  onAddSearch: () => boolean
  onUploadFiles: () => void
  onFilesDrop: (files: FileList) => void
  onClose: () => void
}

const pickerOptions: { kind: SourceKind; label: string; icon: typeof Link2 }[] = [
  { kind: "Sites", label: "Sites", icon: Link2 },
  { kind: "Play Livros", label: "Play Livros", icon: Play },
  { kind: "Drive", label: "Drive", icon: HardDrive },
  { kind: "Livros didáticos", label: "Livros didáticos", icon: BookOpen },
  { kind: "Texto copiado", label: "Texto copiado", icon: Clipboard },
]

export function SourcePickerDialog({
  query,
  sourceKind,
  quickSearch,
  onQueryChange,
  onSourceKindChange,
  onToggleQuickSearch,
  onAddSearch,
  onUploadFiles,
  onFilesDrop,
  onClose,
}: SourcePickerDialogProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose()
      return
    }

    if (event.key !== "Tab") return
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ))
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const placeholder = sourceKind === "Web"
    ? "Pesquise novas fontes na web"
    : sourceKind === "Sites"
      ? "Cole o link de um site"
      : `Cole um link ou digite uma fonte de ${sourceKind}`

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4 py-6 backdrop-blur-[1px]">
      <div
        className="-translate-x-3 -translate-y-3 max-h-[min(82dvh,560px)] w-full max-w-[700px] overflow-y-auto lg:max-w-[min(700px,calc(50.5vw-32px))] rounded-[26px] bg-[#202020] px-5 py-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)] sm:px-5 sm:py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-picker-title"
        onKeyDown={handleKeyDown}
      >
        <header className="relative mx-auto max-w-[520px] px-6 text-center">
          <Link className="absolute left-[-12px] top-[-8px] grid size-8 place-items-center rounded-full text-[#9a9a9a] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" href="/" aria-label="Sair do Notebook e voltar à página inicial">
            <ArrowLeft size={16} aria-hidden="true" />
          </Link>
          <h2 id="source-picker-title" className="text-[18px] font-semibold leading-[1.5] tracking-[-0.02em] text-[#e7e7e7] sm:text-[20px]">
            Crie Resumos em Áudio e em Vídeo usando<br />
            <span className="text-[#9a9bff]">sites</span>
          </h2>
          <button className="absolute right-[-12px] top-[-8px] grid size-8 place-items-center rounded-full text-[#9a9a9a] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" aria-label="Fechar janela de fontes" onClick={onClose}>
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <form className="mt-5 rounded-[22px] bg-[#171717] px-3.5 py-3" onSubmit={(event) => { event.preventDefault(); onAddSearch() }}>
          <label className="sr-only" htmlFor="dialog-source-search">Pesquisar ou adicionar uma fonte</label>
          <input
            ref={searchRef}
            id="dialog-source-search"
            className="h-8 w-full bg-transparent text-[14px] text-[#e7e7e7] outline-none placeholder:text-[#929292]"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
            }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="relative inline-flex h-9 items-center rounded-full bg-[#252525] pl-4 pr-8 text-sm text-[#e0e0e0]">
              <Globe size={15} className="mr-1.5" aria-hidden="true" />
              <span>{sourceKind}</span>
              <select className="absolute inset-0 cursor-pointer appearance-none opacity-0" aria-label="Tipo de fonte" value={sourceKind} onChange={(event) => onSourceKindChange(event.target.value as SourceKind)}>
                {["Web", "Sites", "YouTube", "Play Livros", "Drive", "Livros didáticos", "Texto copiado"].map((kind) => <option key={kind} value={kind}>{kind}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5" size={14} aria-hidden="true" />
            </label>
            <button className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${quickSearch ? "bg-violet-400/20 text-violet-200" : "bg-[#252525] text-[#e0e0e0] hover:bg-[#303030]"}`}  type="button" aria-pressed={quickSearch} onClick={onToggleQuickSearch}>
              <Sparkles size={15} aria-hidden="true" /> Pesquisa rápida
            </button>
            <button className="ml-auto grid size-8 place-items-center rounded-full text-[#a9a9a9] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="submit" aria-label="Adicionar fonte">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Opções para adicionar fontes">
          <button className="inline-flex h-10 items-center gap-2.5 rounded-full border border-[#3a3a3a] px-4 text-sm text-[#dedede] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" onClick={onUploadFiles}>
            <Upload size={16} className="text-[#aaa]" aria-hidden="true" /> Enviar arquivos
          </button>
          {pickerOptions.map(({ kind, label, icon: Icon }) => {
            const selected = sourceKind === kind
            return (
              <button key={kind} className={`inline-flex h-10 items-center gap-2.5 rounded-full border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${selected ? "border-violet-400/50 bg-violet-400/10 text-white" : "border-[#3a3a3a] text-[#dedede] hover:bg-white/5"}`}  type="button" aria-pressed={selected} onClick={() => onSourceKindChange(kind)}>
                <Icon size={16} className={kind === "Play Livros" ? "text-blue-400" : kind === "Livros didáticos" ? "text-emerald-400" : "text-[#a7a7a7]"} aria-hidden="true" />
                {kind === "Sites" && <Play size={13} className="fill-red-500 text-red-500" aria-hidden="true" />}
                {label}
                {selected && <Check size={13} className="text-violet-300" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        <button
          className="mt-5 flex min-h-[142px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#3b3b3b] px-5 py-5 text-center text-[#999] transition hover:border-[#5a5a5a] hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          type="button"
          onClick={onUploadFiles}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); onFilesDrop(event.dataTransfer.files) }}
        >
          <Upload size={21} aria-hidden="true" />
          <span className="text-[13px] leading-relaxed">
            Arraste e solte os arquivos para enviá-los. Tipos de arquivo aceitos: PDF, imagens,<br className="hidden sm:block" /> documentos, áudio <span className="font-semibold text-[#c8c8c8] underline underline-offset-2">e muito mais.</span>
          </span>
        </button>
      </div>
    </div>
  )
}
