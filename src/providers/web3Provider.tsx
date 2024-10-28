'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { createConfig, http, WagmiProvider } from 'wagmi'
import {
  anvil,
  arbitrum,
  base,
  foundry,
  mainnet,
  optimism,
  polygon,
  zkSync,
} from 'wagmi/chains'

interface Web3ProviderProps {
  children: ReactNode
}

// Define the supported chains
// const supportedChains = [mainnet, base, arbitrum, optimism, polygon, zkSync, foundry]
const supportedChains = [anvil]

// Function to get RPC URL for a chain
const getRpcUrl = (chainId: number) => {
  const alchemyChains = [mainnet.id, base.id, optimism.id, polygon.id]
  const infuraChains = [mainnet.id, arbitrum.id, optimism.id, polygon.id]

  if (alchemyChains.includes(chainId)) {
    return `https://eth-${
      chainId === mainnet.id
        ? 'mainnet'
        : supportedChains.find((c) => c.id === chainId)?.network
    }.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  } else if (infuraChains.includes(chainId)) {
    return `https://${
      supportedChains.find((c) => c.id === chainId)?.network
    }.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
  } else if (chainId === zkSync.id) {
    return 'https://mainnet.era.zksync.io' // zkSync uses a public RPC
  }

  // Fallback to default RPC URL
  return supportedChains.find((c) => c.id === chainId)?.rpcUrls.default.http[0] || ''
}

// Configure chains with custom RPC URLs
const configuredChains = supportedChains.map((chain) => ({
  ...chain,
  rpcUrls: {
    ...chain.rpcUrls,
    default: {
      http: [getRpcUrl(chain.id), ...chain.rpcUrls.default.http].filter(Boolean),
    },
  },
}))

const config = createConfig(
  getDefaultConfig({
    chains: configuredChains,
    transports: Object.fromEntries(
      configuredChains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])]),
    ),
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: 'TFT - Swap NFTS for NFTs',
    appDescription:
      'Where NFT enthusiasts swap, trade, and connect. Why sell when you can have fun building your collection?',
    appUrl: 'https://www.thisforthat.app',
    appIcon: 'https://www.thisforthat.app/logo.png',
  }),
)

const queryClient = new QueryClient()

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
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
