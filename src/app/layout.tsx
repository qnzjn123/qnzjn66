import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '실시간 채팅 앱',
  description: 'Next.js와 Socket.IO로 만든 실시간 채팅 애플리케이션',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  )
}