import type { Metadata } from "next"
import { NotebookWorkspace } from "@/components/notebook-workspace"

export const metadata: Metadata = {
  title: "Notebook — Fontes e Estúdio",
  description: "Organize fontes, notas e materiais de estudo em um notebook visual.",
}

export default function NotebookPage() {
  return <NotebookWorkspace />
}
