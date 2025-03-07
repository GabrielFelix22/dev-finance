import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finance',
  description: 'By Gabriel Felix',
  generator: 'By Gabriel Felix',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
