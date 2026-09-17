import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Poloko IKS — Indigenous Knowledge Vault',
  description:
    'Preserving, documenting, and protecting Botswana\'s indigenous knowledge systems and natural resources for future generations.',
  keywords: ['Botswana', 'indigenous knowledge', 'IKS', 'heritage', 'preservation', 'Setswana'],
  authors: [{ name: 'Poloko IKS Team' }],
  openGraph: {
    title: 'Poloko IKS',
    description: 'Botswana\'s Indigenous Knowledge Vault & Research Innovation System',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
