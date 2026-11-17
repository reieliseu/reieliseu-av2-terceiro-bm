"use client"

import { BarChart3, CircleHelp, Layers, Network, PanelRightClose, Sparkles, Video, Volume2 } from "lucide-react"
import type { StudioActionId } from "@/components/notebook-types"

type StudioPanelProps = {
  sourceCount: number
  selectedAction: StudioActionId | null
  onSelectAction: (action: StudioActionId) => void
  onCollapse: () => void
}

const actions = [
  { id: "audio", label: "Resumo em Áudio", icon: Volume2, tone: "text-violet-400" },
  { id: "video", label: "Resumo em Vídeo", icon: Video, tone: "text-emerald-400" },
  { id: "mind-map", label: "Mapa mental", icon: Network, tone: "text-violet-400" },
  { id: "reports", label: "Relatórios", icon: BarChart3, tone: "text-fuchsia-400", isNew: true },
  { id: "flashcards", label: "Cartões didáticos", icon: Layers, tone: "text-amber-300" },
  { id: "quiz", label: "Teste", icon: CircleHelp, tone: "text-cyan-400" },
] as const

export function StudioPanel({ sourceCount, selectedAction, onSelectAction, onCollapse }: StudioPanelProps) {
  const selectedLabel = actions.find((action) => action.id === selectedAction)?.label

  return (
    <aside aria-label="Estúdio" className="flex h-full min-h-0 flex-col rounded-l-[26px] bg-[#151515] px-3 pb-4 pt-2 text-[#e5e5e5]">
      <div className="flex h-9 shrink-0 items-center justify-between px-2">
        <h2 className="text-sm font-medium text-[#dedede]">Estúdio</h2>
        <button className="grid size-8 place-items-center rounded-full text-[#9a9a9a] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" type="button" aria-label="Recolher painel do Estúdio" onClick={onCollapse}>
          <PanelRightClose size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-1 grid shrink-0 grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          const isSelected = selectedAction === action.id
          return (
            <button
              key={action.id}
              className={`flex h-12 min-w-0 items-center gap-3 rounded-full px-4 text-left text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${isSelected ? "bg-[#29252f] text-white" : "bg-[#101010] text-[#d0d0d0] hover:bg-[#222]"}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectAction(action.id)}
            >
              <Icon className={`shrink-0 ${action.tone}`} size={18} aria-hidden="true" />
              <span className="min-w-0 truncate">{action.label}</span>
              {"isNew" in action && action.isNew && <span className="ml-auto shrink-0 rounded-full bg-[#282828] px-2 py-1 text-[11px] text-[#c5c5c5]">Novidade!</span>}
            </button>
          )
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 text-center text-[#858585]">
        <Sparkles size={24} className="mb-3 text-[#777]" aria-hidden="true" />
        {selectedLabel ? (
          <>
            <p className="text-sm font-medium text-[#aaa]">{selectedLabel}</p>
            <p className="mt-1 text-sm leading-relaxed">
              {sourceCount ? "Seu resultado do Estúdio aparecerá aqui." : "Adicione uma fonte para começar."}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm">O resultado do Estúdio será salvo aqui.</p>
            <p className="mt-1 text-sm leading-relaxed">Depois de incluir as fontes, clique para adicionar um Resumo em Áudio, um guia de estudo, um mapa mental e muito mais!</p>
          </>
        )}
      </div>
    </aside>
  )
}
