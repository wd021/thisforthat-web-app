import { createPublicClient, fallback, http } from 'viem'

// import { anvil } from 'viem/chains'
import { supportedChains } from './constants'
import { getAlchemyRpcUrl, getInfuraRpcUrl } from './helpers'

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

  // when testing on anvil, point to the anvil rpc url
  /*
  return createPublicClient({
    chain: anvil,
    transport: http(),
  })
  */
}

export const getChainClient = (chainId: number) => {
  const chain = supportedChains.find((c) => c.id === chainId)
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`)
  }
  return getPublicClient(chain)
}
