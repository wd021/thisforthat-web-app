import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { Navbar } from '@/components'
import { AuthProvider } from '@/providers/authProvider'
import { ToastProvider } from '@/providers/toastProvider'
import { Web3Provider } from '@/providers/web3Provider'

import './globals.css'

export const metadata: Metadata = {
  title: 'This For That - Swap NFTS for NFTs',
  description:
    'Where NFT enthusiasts swap, trade, and connect. Why sell when you can have fun building your collection?',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang='en'>
      <body>
        <Web3Provider>
          <AuthProvider>
            <ToastProvider>
              <Layout>
                <Navbar />
                {children}
              </Layout>
            </ToastProvider>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  )
}

function Layout({ children }: { children: ReactNode }) {
  return <div className='h-screen flex items-center justify-center flex-col'>{children}</div>
}
