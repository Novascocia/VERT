import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'


const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: any
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.png" />
        <title>Vertical Project - Mint Unique NFTs</title>
        <meta name="description" content="Mint unique AI-generated Vertical NFTs with instant prize opportunities" />
        <meta name="virtual-protocol-site-verification" content="23b3c08968c8f349a7ab28c0984cee4c" />
      </head>
      <body>
        <Providers>
          <div className="relative min-h-screen">
            <div className="fixed inset-0 bg-[url('/grunge-overlay.svg')] opacity-10 pointer-events-none" />
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
