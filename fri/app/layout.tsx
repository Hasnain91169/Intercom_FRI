import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FRI — Fin Resolution Intelligence',
  description:
    'Diagnose why your Intercom Fin AI agent resolutions are failing. Find the gap between assumed and genuine resolutions.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#0F172A]`}>{children}</body>
    </html>
  )
}
