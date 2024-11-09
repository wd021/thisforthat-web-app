// TODO: add fallback methods with other providers (Infura, QuickNode, etc.) - applies to api verify as well

import { Alchemy, Network, Nft } from 'alchemy-sdk'

import { NFTUpload } from '@/types/supabase'
import { ALCHEMY_CHAIN_SLUGS, CHAIN_SLUGS_TO_CHAIN_IDS } from '@/utils/constants'

interface NFTFormatterResult {
  nfts: NFTUpload[]
  pageKey: string | null
}

const NFT_FORMATTERS = {
  alchemy: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatNFTs(
      nftData: Nft[],
      chainId: number,
      walletAddress: string,
      spamCheck: boolean,
    ): NFTFormatterResult {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getFloorPrice = (nft: any): number => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const floorPrice = (nft as any).contract.openSeaMetadata?.floorPrice
          return floorPrice ? floorPrice : -Infinity
        } catch {
          return -Infinity
        }
      }

      const sortedNfts = [...nftData].sort((a, b) => getFloorPrice(b) - getFloorPrice(a))

      return {
        nfts: sortedNfts.map((nft) => ({
          id: nft.contract.address + '_' + nft.tokenId,
          name: nft.raw.metadata?.name || `#${nft.tokenId}`,
          chain_id: chainId,
          collection_contract: nft.contract.address,
          collection_name: nft.contract.name || '',
          token_type: nft.tokenType.toUpperCase(),
          token_id: nft.tokenId,
          token_uri: nft.tokenUri || null,
          image: nft.image?.cachedUrl || nft.image?.originalUrl || '',
          thumbnail: nft.image?.thumbnailUrl || nft.image?.cachedUrl || '',
          possible_spam: spamCheck ? getFloorPrice(nft) === -Infinity : false,
          wallet_address: walletAddress.toLowerCase(),
          collection_floor_price: getFloorPrice(nft) === -Infinity ? 0 : getFloorPrice(nft),
        })),
        pageKey: null,
      }
    },
  },
}

const PROVIDERS = {
  alchemy: {
    async getNFTs(
      chain: keyof typeof ALCHEMY_CHAIN_SLUGS,
      walletAddress: string,
      pageKey: string | null = null,
    ) {
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
        network: ALCHEMY_CHAIN_SLUGS[chain] as Network,
      })

      const options = {
        pageSize: 100,
        ...(pageKey && { pageKey }),
      }

      try {
        const nftsForOwner = await alchemy.nft.getNftsForOwner(walletAddress, options)
        const chainId = CHAIN_SLUGS_TO_CHAIN_IDS[chain as keyof typeof CHAIN_SLUGS_TO_CHAIN_IDS]

        return NFT_FORMATTERS.alchemy.formatNFTs(
          nftsForOwner.ownedNfts,
          chainId,
          walletAddress,
          true,
        )
      } catch (error) {
        console.error('Alchemy error:', error)
        return null
      }
    },

    async getNFTByContract(
      chain: keyof typeof CHAIN_SLUGS_TO_CHAIN_IDS,
      contractAddress: string,
      tokenId: string,
    ): Promise<NFTUpload | null> {
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
        network: ALCHEMY_CHAIN_SLUGS[chain] as Network,
      })

      try {
        const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId)
        const chainId = CHAIN_SLUGS_TO_CHAIN_IDS[chain as keyof typeof CHAIN_SLUGS_TO_CHAIN_IDS]
        const owner = await alchemy.nft.getOwnersForNft(nft.contract.address, tokenId)

        return NFT_FORMATTERS.alchemy.formatNFTs([nft], chainId, owner.owners[0], false).nfts[0]
      } catch (error) {
        console.error('Alchemy error:', error)
        return null
      }
    },
  },

  infura: {},

  quicknode: {},

  // Only fetch CryptoPunks from Moralis
  moralis: {
    async getNFTs(chain: keyof typeof CHAIN_SLUGS_TO_CHAIN_IDS, walletAddress: string) {
      const url = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft`
      const params = new URLSearchParams({
        chain: 'eth',
        format: 'decimal',
        limit: '100',
        'token_addresses[0]': '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', // CryptoPunks
        media_items: 'false',
      })

      try {
        const response = await fetch(`${url}?${params}`, {
          headers: {
            accept: 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY!,
          },
        })

        if (!response.ok) return null

        const data = await response.json()

        return {
          nfts: data.result
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.result.map((punk: any) => convertCryptoPunkToNFT(punk, walletAddress))
            : [],
          pageKey: null,
        }
      } catch (error) {
        console.error('Moralis error:', error)
        return null
      }
    },

    async getCryptoPunkById(tokenId: string) {
      const url = `https://deep-index.moralis.io/api/v2.2/nft/0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB/${tokenId}`
      const params = new URLSearchParams({
        chain: 'eth',
        format: 'decimal',
        media_items: 'false',
      })

      try {
        const response = await fetch(`${url}?${params}`, {
          headers: {
            accept: 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY!,
          },
        })

        if (!response.ok) return null

        const data = await response.json()

        return {
          nfts: data ? [convertCryptoPunkToNFT(data, data.owner_of)] : [],
          pageKey: null,
        }
      } catch (error) {
        console.error('Moralis error:', error)
        return null
      }
    },
  },
}

export async function getNFTsForWallet(
  chain: keyof typeof ALCHEMY_CHAIN_SLUGS,
  walletAddress: string,
  pageKey: string | null = null,
) {
  // Try providers in sequence
  const providers = ['alchemy'] as const

  for (const provider of providers) {
    const result = await PROVIDERS[provider].getNFTs(
      chain as keyof typeof ALCHEMY_CHAIN_SLUGS,
      walletAddress,
      pageKey,
    )
    if (result) {
      // If on Ethereum, also fetch CryptoPunks from Moralis and merge results
      if (chain === 'ethereum') {
        const moralisResult = await PROVIDERS.moralis.getNFTs(chain, walletAddress)
        if (moralisResult) {
          return {
            nfts: [...moralisResult.nfts, ...result.nfts],
            pageKey: result.pageKey,
          }
        }
      }
      return result
    }
  }

  // If all providers fail, return empty result
  return { nfts: [], pageKey: null }
}

export async function getNFTFromUrl(url: string): Promise<NFTUpload | null> {
  const urlInfo = parseNFTUrl(url)

  if (!urlInfo) return null

  // Use Moralis for CryptoPunks
  if (urlInfo.marketplace === 'cryptopunks') {
    const result = await PROVIDERS.moralis.getCryptoPunkById(urlInfo.tokenId)
    return result?.nfts[0] || null
  }

  // Try providers in sequence for other NFTs
  // const providers = ['alchemy', 'infura', 'quicknode'] as const
  const providers = ['alchemy'] as const

  for (const provider of providers) {
    const result = await PROVIDERS[provider].getNFTByContract(
      urlInfo.chain as keyof typeof CHAIN_SLUGS_TO_CHAIN_IDS,
      urlInfo.contractAddress,
      urlInfo.tokenId,
    )
    if (result) return result
  }

  return null
}

// Helper to parse NFT URLs
function parseNFTUrl(url: string) {
  // CryptoPunks
  let match = url.match(/cryptopunks\/details\/(\d+)/)
  if (match) {
    return {
      marketplace: 'cryptopunks' as const,
      chain: 'ethereum',
      contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
      tokenId: match[1],
    }
  }

  // OpenSea
  match = url.match(/assets\/([\w-]+)\/([^\/]+)\/(\d+)/)
  if (match) {
    return {
      marketplace: 'opensea' as const,
      chain: match[1],
      contractAddress: match[2],
      tokenId: match[3],
    }
  }

  // Blur
  match = url.match(/(\w+)\/asset\/([^\/]+)\/(\d+)/)
  if (match) {
    return {
      marketplace: 'blur' as const,
      chain: match[1],
      contractAddress: match[2],
      tokenId: match[3],
    }
  }

  return null
}

function convertCryptoPunkToNFT(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  punk: any,
  walletAddress: string,
): NFTUpload {
  const metadata = JSON.parse(punk.metadata)
  return {
    id: punk.token_address + '_' + punk.token_id,
    name: metadata.name,
    chain_id: 1,
    collection_contract: punk.token_address,
    collection_name: punk.name,
    token_type: 'CRYPTOPUNK',
    token_id: punk.token_id,
    token_uri: null,
    image: metadata.image,
    thumbnail: metadata.image,
    possible_spam: false,
    wallet_address: walletAddress.toLowerCase(),
    collection_floor_price: 30,
  }
}
