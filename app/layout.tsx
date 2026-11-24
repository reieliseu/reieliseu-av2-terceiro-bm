import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { basePath } from '@/config/site.mjs'

export const metadata: Metadata = {
  title: 'Mentor Estudantil — Plataforma de estudos',
  description: 'Organize tarefas de estudo, matérias, prioridades e prazos em um único lugar.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: (basePath + '/icon-light-32x32.png'),
        media: '(prefers-color-scheme: light)',
      },
      {
        url: (basePath + '/icon-dark-32x32.png'),
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: (basePath + '/icon.svg'),
        type: 'image/svg+xml',
      },
    ],
    apple: (basePath + '/apple-icon.png'),
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f8ff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
