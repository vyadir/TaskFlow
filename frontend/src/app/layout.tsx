// Layout raíz de Next.js (App Router).
// Aplica los estilos globales y define los metadatos base de la app.

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Modern task management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  )
}
