'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { fallback } from 'wagmi'
import { createConfig, http, WagmiProvider } from 'wagmi'

import { supportedChains } from '@/utils/constants'
import { getAlchemyRpcUrl, getInfuraRpcUrl } from '@/utils/helpers'

const config = createConfig(
  getDefaultConfig({
    chains: supportedChains,
    transports: Object.fromEntries(
      supportedChains.map((chain) => {
        const alchemyUrl = chain.id !== 31_337 ? getAlchemyRpcUrl(chain) : null
        const infuraUrl = chain.id !== 31_337 ? getInfuraRpcUrl(chain) : null
        return chain.id !== 31_337
          ? [
              chain.id,
              fallback([
                ...(alchemyUrl ? [http(alchemyUrl)] : []),
                ...(infuraUrl ? [http(infuraUrl)] : []),
                http(chain.rpcUrls.default.http[0]),
              ]),
            ]
          : [chain.id, http()]
      }),
    ),
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: 'TFT - NFTs were made to be swapped',
    appDescription:
      'Meet fellow NFT enthusiasts, make trades, negotiate, and have a blast while building your collection.',
    appUrl: 'https://www.thisforthat.app',
    appIcon: 'https://www.thisforthat.app/logo_min.png',
  }),
)

const queryClient = new QueryClient()

export const Web3Provider: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            '--ck-connectbutton-font-size': '16px',
            '--ck-font-family': 'Montserrat',
            '--ck-connectbutton-border-radius': '100px',
            '--ck-connectbutton-color': '#fff',
            '--ck-connectbutton-background': '#1f2937',
            '--ck-connectbutton-hover-color': '#fff',
            '--ck-connectbutton-hover-background': '#1f2937',
            '--ck-connectbutton-active-color': '#fff',
            '--ck-connectbutton-active-background': '#1f2937',
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
