import type { Metadata } from "next"
import { NotebookAccess } from "@/components/notebook-access"

export const metadata: Metadata = {
  title: "Notebook — Fontes e Estúdio",
  description: "Área Premium para organizar fontes, notas e materiais de estudo no Notebook e Estúdio.",
}

export default function NotebookPage() {
  return <NotebookAccess />
}
