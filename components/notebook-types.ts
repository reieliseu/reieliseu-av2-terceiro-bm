export type SourceKind =
  | "Web"
  | "Sites"
  | "YouTube"
  | "Play Livros"
  | "Drive"
  | "Livros didáticos"
  | "Texto copiado"
  | "Arquivo"
  | "Nota"

export type NotebookSource = {
  id: string
  title: string
  kind: SourceKind
}

export type StudioActionId = "audio" | "video" | "mind-map" | "reports" | "flashcards" | "quiz"
