import { createPublicClient, fallback, http } from 'viem'
import { arbitrum, base, mainnet, optimism, polygon, zksync } from 'viem/chains'

import { getAlchemyRpcUrl, getInfuraRpcUrl } from './helpers'

const supportedChains = [mainnet, base, optimism, polygon, arbitrum, zksync] as const

export const getPublicClient = (chain: (typeof supportedChains)[number]) => {
  const rpcUrls = [
    getAlchemyRpcUrl(chain),
    getInfuraRpcUrl(chain),
    chain.rpcUrls.default.http[0],
  ].filter((url): url is string => url !== null)

  return createPublicClient({
    chain,
    transport: fallback(rpcUrls.map((url) => http(url))),
  })
}

export const getChainClient = (chainId: number) => {
  const chain = supportedChains.find((c) => c.id === chainId)
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`)
  }
  return getPublicClient(chain)
}
