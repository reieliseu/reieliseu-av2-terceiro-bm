"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { PanelLeftOpen, PanelRightOpen } from "lucide-react"
import { NotebookCenter } from "@/components/notebook-center"
import { SourcePickerDialog } from "@/components/source-picker-dialog"
import { SourcesPanel } from "@/components/sources-panel"
import { StudioPanel } from "@/components/studio-panel"
import type { NotebookSource, SourceKind, StudioActionId } from "@/components/notebook-types"

export function NotebookWorkspace() {
  const [sources, setSources] = useState<NotebookSource[]>([])
  const [sourceQuery, setSourceQuery] = useState("")
  const [sourceKind, setSourceKind] = useState<SourceKind>("Web")
  const [quickSearch, setQuickSearch] = useState(false)
  const [sourceDialogOpen, setSourceDialogOpen] = useState(true)
  const [sourcesOpen, setSourcesOpen] = useState(true)
  const [studioOpen, setStudioOpen] = useState(true)
  const [mobilePanel, setMobilePanel] = useState<"sources" | "studio" | null>(null)
  const [selectedStudioAction, setSelectedStudioAction] = useState<StudioActionId | null>(null)
  const [notebookTitle, setNotebookTitle] = useState("Notebook sem título")
  const [promptMessage, setPromptMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function makeSource(kind: SourceKind, title: string) {
    const cleanTitle = title.trim()
    if (!cleanTitle) return false
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setSources((current) => [{ id, title: cleanTitle, kind }, ...current])
    setPromptMessage("")
    return true
  }

  function addSearchSource() {
    const cleanQuery = sourceQuery.trim()
    if (!cleanQuery) return false
    const title = sourceKind === "Web" ? `Pesquisa na web: ${cleanQuery}` : cleanQuery
    const added = makeSource(sourceKind, title)
    if (added) {
      setSourceQuery("")
      setSourceDialogOpen(false)
    }
    return added
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return
    const addedSources = Array.from(files).map((file) => ({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: file.name,
      kind: "Arquivo" as const,
    }))
    setSources((current) => [...addedSources, ...current])
    setSourceDialogOpen(false)
    setPromptMessage("")
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.currentTarget.files)
    event.currentTarget.value = ""
  }

  function createNote() {
    const noteNumber = sources.filter((source) => source.kind === "Nota").length + 1
    makeSource("Nota", noteNumber === 1 ? "Nota sem título" : `Nota sem título ${noteNumber}`)
  }

  function handlePromptSubmit(prompt: string) {
    setPromptMessage(sources.length
      ? "A conversa com as fontes ainda não está conectada nesta prévia."
      : "Adicione ao menos uma fonte para conversar com o notebook.")
    void prompt
  }

  const sourcePanelProps = {
    sources,
    query: sourceQuery,
    sourceKind,
    quickSearch,
    onQueryChange: setSourceQuery,
    onSourceKindChange: setSourceKind,
    onToggleQuickSearch: () => setQuickSearch((current) => !current),
    onAddSearch: addSearchSource,
    onOpenPicker: () => setSourceDialogOpen(true),
    onCreateNote: createNote,
    onCollapse: () => setSourcesOpen(false),
  }

  const studioPanelProps = {
    sourceCount: sources.length,
    selectedAction: selectedStudioAction,
    onSelectAction: setSelectedStudioAction,
    onCollapse: () => setStudioOpen(false),
  }

  const desktopColumns = sourcesOpen
    ? studioOpen
      ? "lg:grid-cols-[minmax(250px,24.5vw)_minmax(0,1fr)_minmax(270px,25vw)]"
      : "lg:grid-cols-[minmax(250px,24.5vw)_minmax(0,1fr)]"
    : studioOpen
      ? "lg:grid-cols-[minmax(0,1fr)_minmax(270px,25vw)]"
      : "lg:grid-cols-1"

  return (
    <div className={`relative grid h-dvh min-h-[600px] w-full grid-cols-1 overflow-hidden bg-[#090909] text-[#e5e5e5] lg:pr-8 ${desktopColumns}`}>
      {sourcesOpen && <div className="hidden min-h-0 lg:block"><SourcesPanel {...sourcePanelProps} /></div>}
      <NotebookCenter
        sources={sources}
        title={notebookTitle}
        onTitleChange={setNotebookTitle}
        onOpenSources={() => setMobilePanel("sources")}
        onOpenStudio={() => setMobilePanel("studio")}
        showSourcesToggle={!sourcesOpen}
        showStudioToggle={!studioOpen}
        onSubmitPrompt={handlePromptSubmit}
        promptMessage={promptMessage}
      />
      {studioOpen && <div className="hidden min-h-0 lg:block"><StudioPanel {...studioPanelProps} /></div>}

      {!sourcesOpen && (
        <button className="absolute left-3 top-3 z-20 hidden size-8 place-items-center rounded-full bg-[#171717] text-[#aaa] transition hover:bg-[#252525] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:grid" type="button" aria-label="Mostrar Fontes" onClick={() => setSourcesOpen(true)}>
          <PanelLeftOpen size={16} aria-hidden="true" />
        </button>
      )}
      {!studioOpen && (
        <button className="absolute right-3 top-3 z-20 hidden size-8 place-items-center rounded-full bg-[#171717] text-[#aaa] transition hover:bg-[#252525] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:grid" type="button" aria-label="Mostrar Estúdio" onClick={() => setStudioOpen(true)}>
          <PanelRightOpen size={16} aria-hidden="true" />
        </button>
      )}

      {mobilePanel && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" role="presentation" onClick={() => setMobilePanel(null)}>
          <div className={`h-full w-[min(92vw,380px)] ${mobilePanel === "studio" ? "ml-auto" : ""}`} onClick={(event) => event.stopPropagation()}>
            {mobilePanel === "sources"
              ? <SourcesPanel {...sourcePanelProps} onCollapse={() => setMobilePanel(null)} />
              : <StudioPanel {...studioPanelProps} onCollapse={() => setMobilePanel(null)} />}
          </div>
        </div>
      )}

      {sourceDialogOpen && (
        <SourcePickerDialog
          query={sourceQuery}
          sourceKind={sourceKind}
          quickSearch={quickSearch}
          onQueryChange={setSourceQuery}
          onSourceKindChange={setSourceKind}
          onToggleQuickSearch={() => setQuickSearch((current) => !current)}
          onAddSearch={addSearchSource}
          onUploadFiles={() => fileInputRef.current?.click()}
          onFilesDrop={addFiles}
          onClose={() => setSourceDialogOpen(false)}
        />
      )}

      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.txt,.mp3,.wav,.m4a"
        aria-label="Selecionar arquivos para adicionar como fontes"
        onChange={handleFileChange}
      />
    </div>
  )
}
