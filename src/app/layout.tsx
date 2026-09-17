import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import { ToastProvider } from '@/components/shared/ToastProvider'
import './globals.css'

/* ── Body font: Inter — warm, readable, modern ── */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

/* ── Display font: DM Serif Display — editorial, warm, expressive ── */
const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Poloko IKS — Indigenous Knowledge Vault',
  description:
    "Preserving, documenting, and protecting Botswana's indigenous knowledge systems and natural resources for future generations.",
  keywords: ['Botswana', 'indigenous knowledge', 'IKS', 'heritage', 'preservation', 'Setswana'],
  authors: [{ name: 'Poloko IKS Team' }],
  openGraph: {
    title: 'Poloko IKS',
    description: "Botswana's Indigenous Knowledge Vault & Research Innovation System",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
