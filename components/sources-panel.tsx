"use client"

import { useState } from "react"
import { ArrowRight, BookOpen, ChevronDown, FileText, Globe, Link2, PanelLeftClose, Plus, Sparkles, X, Play, HardDrive, Clipboard } from "lucide-react"
import type { NotebookSource, SourceKind } from "@/components/notebook-types"

type SourcesPanelProps = {
  sources: NotebookSource[]
  query: string
  sourceKind: SourceKind
  quickSearch: boolean
  onQueryChange: (query: string) => void
  onSourceKindChange: (kind: SourceKind) => void
  onToggleQuickSearch: () => void
  onAddSearch: () => boolean
  onOpenPicker: () => void
  onCreateNote: () => void
  onCollapse: () => void
}

const searchKinds: SourceKind[] = ["Web", "Sites", "YouTube", "Drive", "Play Livros", "Livros didáticos", "Texto copiado"]

function SourceIcon({ kind }: { kind: SourceKind }) {
  if (kind === "YouTube") return <Play size={17} aria-hidden="true" />
  if (kind === "Drive") return <HardDrive size={17} aria-hidden="true" />
  if (kind === "Livros didáticos" || kind === "Play Livros") return <BookOpen size={17} aria-hidden="true" />
  if (kind === "Texto copiado") return <Clipboard size={17} aria-hidden="true" />
  if (kind === "Sites" || kind === "Web") return <Globe size={17} aria-hidden="true" />
  return <FileText size={17} aria-hidden="true" />
}

export function SourcesPanel({
  sources,
  query,
  sourceKind,
  quickSearch,
  onQueryChange,
  onSourceKindChange,
  onToggleQuickSearch,
  onAddSearch,
  onOpenPicker,
  onCreateNote,
  onCollapse,
}: SourcesPanelProps) {
  const [showAnnouncement, setShowAnnouncement] = useState(true)

  return (
    <aside aria-label="Fontes" className="flex h-full min-h-0 flex-col rounded-r-[26px] bg-[#151515] px-3 pb-4 pt-2 text-[#e5e5e5]">
      <div className="flex h-9 shrink-0 items-center justify-between px-2">
        <h2 className="text-sm font-medium text-[#dedede]">Fontes</h2>
        <button className="grid size-8 place-items-center rounded-full text-[#9a9a9a] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" aria-label="Recolher painel de fontes" onClick={onCollapse}>
          <PanelLeftClose size={16} aria-hidden="true" />
        </button>
      </div>

      {showAnnouncement && (
        <div className="relative mt-3 rounded-2xl bg-[#24232b] px-3 py-3 pr-10 text-[13px] leading-[1.45] text-[#b8b7c0]">
          <p className="font-medium text-[#e4e2ea]">Conheça as novas anotações!</p>
          <p className="mt-1">Agora as anotações ficam junto às suas fontes. Você pode conversar, citar e gerar conteúdo com elas.</p>
          <button className="absolute right-2.5 top-3 grid size-6 place-items-center rounded-full text-[#a6a4ad] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" aria-label="Fechar aviso" onClick={() => setShowAnnouncement(false)}>
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="mt-2 grid shrink-0 grid-cols-2 gap-2">
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#101010] px-2 text-[13px] font-medium text-[#d7d7d7] transition hover:bg-[#252525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" onClick={onOpenPicker}>
          <Plus size={17} aria-hidden="true" /> Adicionar fontes
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#101010] px-2 text-[13px] font-medium text-[#d7d7d7] transition hover:bg-[#252525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" onClick={onCreateNote}>
          <Plus size={17} aria-hidden="true" /> Criar nota
        </button>
      </div>

      <form className="mt-2 shrink-0 rounded-[20px] bg-[#101010] p-3" onSubmit={(event) => { event.preventDefault(); onAddSearch() }}>
        <input
          aria-label="Pesquise novas fontes na web"
          className="h-8 w-full bg-transparent text-[14px] text-[#e5e5e5] outline-none placeholder:text-[#777]"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Pesquise novas fontes na web"
        />
        <div className="mt-2 flex items-center gap-2">
          <label className="relative inline-flex h-9 items-center rounded-full bg-[#1c1c1c] pl-3 pr-8 text-[13px] text-[#d5d5d5]">
            <Globe size={15} className="mr-1.5" aria-hidden="true" />
            <span className="sr-only">Tipo de fonte</span>
            <select className="absolute inset-0 cursor-pointer appearance-none opacity-0" aria-label="Tipo de fonte" value={sourceKind} onChange={(event) => onSourceKindChange(event.target.value as SourceKind)}>
              {searchKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
            </select>
            {sourceKind}
            <ChevronDown className="absolute right-2.5" size={14} aria-hidden="true" />
          </label>
          <button className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${quickSearch ? "bg-violet-400/20 text-violet-200" : "bg-[#1c1c1c] text-[#d5d5d5] hover:bg-[#282828]"}`} type="button" aria-pressed={quickSearch} onClick={onToggleQuickSearch}>
            <Sparkles size={15} aria-hidden="true" /> Pesquisa rápida
          </button>
          <button className="ml-auto grid size-8 place-items-center rounded-full text-[#a9a9a9] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="submit" aria-label="Adicionar fonte">
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        {sources.length ? (
          <ul className="flex flex-col gap-2" aria-label="Fontes adicionadas">
            {sources.map((source) => (
              <li key={source.id}>
                <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-white/5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#222] text-[#c4b5fd]"><SourceIcon kind={source.kind} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[#e3e3e3]">{source.title}</span>
                    <span className="mt-0.5 block text-xs text-[#929292]">{source.kind}</span>
                  </span>
                  <Link2 size={15} className="shrink-0 text-[#757575]" aria-hidden="true" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full min-h-44 flex-col items-center justify-center px-4 pb-3 text-center text-[#888]">
            <FileText size={22} className="mb-3 text-[#777]" aria-hidden="true" />
            <p className="text-sm font-medium text-[#aaa]">As fontes salvas vão aparecer aqui</p>
            <p className="mt-1 text-sm leading-relaxed">Adicione arquivos, sites e muito mais. Depois, faça perguntas ou crie com base nessas fontes.</p>
            <button className="mt-3 text-sm text-[#aaa] underline decoration-[#666] underline-offset-2 transition hover:text-white" type="button" onClick={onOpenPicker}>
              Solte arquivos aqui ou adicione uma fonte
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
