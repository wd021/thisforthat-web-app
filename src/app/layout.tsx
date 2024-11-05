import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { Navbar } from '@/components'
import { AuthProvider } from '@/providers/authProvider'
import { ToastProvider } from '@/providers/toastProvider'
import { Web3Provider } from '@/providers/web3Provider'

import './globals.css'

export const metadata: Metadata = {
  title: 'This For That',
  description: 'NFTs were made to be swapped.',
  manifest: '/manifest.json',
  icons: {
    // Apple touch icons
    apple: [
      { url: '/icons/icon-192x192.png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152' },
      { url: '/icons/icon-180x180.png', sizes: '180x180' },
      { url: '/icons/icon-167x167.png', sizes: '167x167' },
    ],
    // Regular icons
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TFT',
    startupImage: [
      {
        url: '/splash/apple-splash-2048-2732.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-1668-2388.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-1536-2048.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-1125-2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/apple-splash-828-1792.png',
        media:
          '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  themeColor: '#ffffff',
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
