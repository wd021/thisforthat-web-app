import { Alchemy, Network } from 'alchemy-sdk'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { NFT, NFTUpload } from '@/types/supabase'
import { ALCHEMY_CHAIN_SLUGS, CHAIN_SLUGS_TO_CHAIN_IDS } from '@/utils/constants'

interface NFTFormatterResult {
  nfts: NFT[]
  pageKey: string | null
}

const NFT_FORMATTERS = {
  alchemy: {
    formatNFTs(nftData: any[], chainId: number, walletAddress: string): NFTFormatterResult {
      const getFloorPrice = (nft: any): number => {
        try {
          const floorPrice = nft.contract.openSeaMetadata?.floorPrice
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
          collection_name: nft.contract.name,
          token_type: nft.tokenType.toUpperCase(),
          token_id: nft.tokenId,
          token_uri: nft.tokenUri?.raw,
          image: nft.image?.cachedUrl || nft.image?.originalUrl,
          thumbnail: nft.image?.thumbnailUrl || nft.image?.cachedUrl,
          possible_spam: getFloorPrice(nft) === -Infinity,
          wallet_address: walletAddress.toLowerCase(),
        })),
        pageKey: null,
      }
    },
  },

  infura: {
    formatNFTs(
      nftData: any[],
      chainId: number,
      walletAddress: string,
      pageData?: any,
    ): NFTFormatterResult {
      // Infura doesn't provide floor price, so we'll sort by tokenId as fallback
      const sortedNfts = [...nftData].sort((a, b) => Number(b.tokenId) - Number(a.tokenId))

      return {
        nfts: sortedNfts.map((nft) => ({
          id: nft.contract + '_' + nft.tokenId,
          name: nft.metadata?.name || `#${nft.tokenId}`,
          chain_id: chainId,
          collection_contract: nft.contract,
          collection_name: nft.metadata?.collection?.name || 'Unknown Collection',
          token_type: nft.type.toUpperCase(),
          token_id: nft.tokenId,
          token_uri: nft.tokenURI,
          image: nft.metadata?.image || '',
          thumbnail: nft.metadata?.image || '',
          possible_spam: false, // Infura doesn't provide spam detection
          wallet_address: walletAddress.toLowerCase(),
        })),
        pageKey:
          pageData && pageData.pageNumber < pageData.totalPages
            ? (pageData.pageNumber + 1).toString()
            : null,
      }
    },
  },

  quicknode: {
    formatNFTs(
      nftData: any[],
      chainId: number,
      walletAddress: string,
      pageData?: any,
    ): NFTFormatterResult {
      // QuickNode provides some spam detection
      const sortedNfts = [...nftData].sort((a, b) => {
        const aSpam = a.spam_score || 0
        const bSpam = b.spam_score || 0
        return aSpam - bSpam // Lower spam score first
      })

      return {
        nfts: sortedNfts.map((nft) => ({
          id: nft.contractAddress + '_' + nft.tokenId,
          name: nft.name || `#${nft.tokenId}`,
          chain_id: chainId,
          collection_contract: nft.contractAddress,
          collection_name: nft.collectionName || 'Unknown Collection',
          token_type: nft.tokenType?.toUpperCase() || 'ERC721',
          token_id: nft.tokenId,
          token_uri: nft.tokenUri,
          image: nft.imageUrl || '',
          thumbnail: nft.thumbnailUrl || nft.imageUrl || '',
          possible_spam: (nft.spam_score || 0) > 0.5, // QuickNode specific spam detection
          wallet_address: walletAddress.toLowerCase(),
        })),
        pageKey:
          pageData && pageData.totalPages > pageData.page
            ? (pageData.page + 1).toString()
            : null,
      }
    },
  },
}

const PROVIDERS = {
  alchemy: {
    async getNFTs(chain: string, walletAddress: string, pageKey: string | null = null) {
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID!,
        network: ALCHEMY_CHAIN_SLUGS[chain] as Network,
      })

      const options = {
        pageSize: 100,
        ...(pageKey && { pageKey }),
      }

      try {
        const nftsForOwner = await alchemy.nft.getNftsForOwner(walletAddress, options)
        const chainId = CHAIN_SLUGS_TO_CHAIN_IDS[chain]

        return NFT_FORMATTERS.alchemy.formatNFTs(nftsForOwner.ownedNfts, chainId, walletAddress)
      } catch (error) {
        console.error('Alchemy error:', error)
        return null
      }
    },

    async getNFTByContract(chain: string, contractAddress: string, tokenId: string) {
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID!,
        network: ALCHEMY_CHAIN_SLUGS[chain] as Network,
      })

      try {
        const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId)
        const chainId = CHAIN_TO_CHAIN_IDS[chain]
        return NFT_FORMATTERS.alchemy.formatNFTs([nft], chainId, '').nfts[0]
      } catch (error) {
        console.error('Alchemy error:', error)
        return null
      }
    },
  },

  infura: {
    async getNFTs(chain: string, walletAddress: string, pageKey: string | null = null) {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.INFURA_API_KEY + ':' + process.env.INFURA_API_SECRET,
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'nft_getAssetsByOwner',
          params: [walletAddress, { page: pageKey ? parseInt(pageKey) : 1, pageSize: 100 }],
          id: 1,
        }),
      }

      try {
        const response = await fetch(
          `https://nft.api.infura.io/networks/${chain}/assets/v1`,
          options,
        )
        if (!response.ok) return null

        const data = await response.json()
        const chainId = CHAIN_TO_CHAIN_IDS[chain]

        return NFT_FORMATTERS.infura.formatNFTs(data.result.assets, chainId, walletAddress, {
          pageNumber: data.result.pageNumber,
          totalPages: data.result.totalPages,
        })
      } catch (error) {
        console.error('Infura error:', error)
        return null
      }
    },

    async getNFTByContract(chain: string, contractAddress: string, tokenId: string) {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.INFURA_API_KEY + ':' + process.env.INFURA_API_SECRET,
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'nft_getAsset',
          params: [contractAddress, tokenId],
          id: 1,
        }),
      }

      try {
        const response = await fetch(
          `https://nft.api.infura.io/networks/${chain}/assets/v1`,
          options,
        )
        if (!response.ok) return null

        const data = await response.json()
        const chainId = CHAIN_TO_CHAIN_IDS[chain]
        return NFT_FORMATTERS.infura.formatNFTs([data.result], chainId, '').nfts[0]
      } catch (error) {
        console.error('Infura error:', error)
        return null
      }
    },
  },

  quicknode: {
    async getNFTs(chain: string, walletAddress: string, pageKey: string | null = null) {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 67,
          jsonrpc: '2.0',
          method: 'qn_fetchNFTs',
          params: [
            {
              wallet: walletAddress,
              page: pageKey ? parseInt(pageKey) : 1,
              perPage: 100,
            },
          ],
        }),
      }

      try {
        const response = await fetch(process.env.QUICKNODE_HTTP_URL!, options)
        if (!response.ok) return null

        const data = await response.json()
        const chainId = CHAIN_TO_CHAIN_IDS[chain]

        return NFT_FORMATTERS.quicknode.formatNFTs(data.result.assets, chainId, walletAddress, {
          page: data.result.page,
          totalPages: data.result.totalPages,
        })
      } catch (error) {
        console.error('QuickNode error:', error)
        return null
      }
    },

    async getNFTByContract(chain: string, contractAddress: string, tokenId: string) {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 67,
          jsonrpc: '2.0',
          method: 'qn_fetchNFT',
          params: [
            {
              contractAddress,
              tokenId,
            },
          ],
        }),
      }

      try {
        const response = await fetch(process.env.QUICKNODE_HTTP_URL!, options)
        if (!response.ok) return null

        const data = await response.json()
        const chainId = CHAIN_TO_CHAIN_IDS[chain]
        return NFT_FORMATTERS.quicknode.formatNFTs([data.result], chainId, '').nfts[0]
      } catch (error) {
        console.error('QuickNode error:', error)
        return null
      }
    },
  },

  moralis: {
    async getNFTs(chain: string, walletAddress: string) {
      // Only fetch CryptoPunks from Moralis
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
            'X-API-Key': process.env.MORALIS_API_KEY!,
          },
        })

        if (!response.ok) return null

        const data = await response.json()
        const chainId = CHAIN_TO_CHAIN_IDS[chain]

        return {
          nfts: data.result
            ? data.result.map((punk) => convertCryptoPunkToNFT(punk, chainId, walletAddress))
            : [],
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
  chain: string,
  walletAddress: string,
  pageKey: string | null = null,
) {
  // Try providers in sequence
  const providers = ['alchemy', 'infura', 'quicknode'] as const

  for (const provider of providers) {
    const result = await PROVIDERS[provider].getNFTs(chain, walletAddress, pageKey)
    console.log('hey result', result, provider)
    if (result) {
      // If on Ethereum, also fetch CryptoPunks from Moralis and merge results
      if (chain === 'ethereum') {
        // const moralisResult = await PROVIDERS.moralis.getNFTs(chain, walletAddress)
        // if (moralisResult) {
        //   return {
        //     nfts: [...result.nfts, ...moralisResult.nfts],
        //     pageKey: result.pageKey,
        //   }
        // }
      }
      return result
    }
  }

  // If all providers fail, return empty result
  return { nfts: [], pageKey: null }
}

export async function getNFTFromUrl(url: string): Promise<NFT | null> {
  const urlInfo = parseNFTUrl(url)
  if (!urlInfo) return null

  // Use Moralis for CryptoPunks
  if (urlInfo.marketplace === 'cryptopunks') {
    const result = await PROVIDERS.moralis.getNFTs('ethereum', urlInfo.tokenId)
    return result?.nfts[0] || null
  }

  // Try providers in sequence for other NFTs
  const providers = ['alchemy', 'infura', 'quicknode'] as const

  for (const provider of providers) {
    const result = await PROVIDERS[provider].getNFTByContract(
      urlInfo.chain,
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
  chainId: number,
  walletAddress: string,
): NFTUpload {
  const metadata = JSON.parse(punk.metadata)
  return {
    id: punk.token_address + '_' + punk.token_id,
    name: metadata.name,
    chain_id: chainId,
    collection_contract: punk.token_address,
    collection_name: punk.name,
    token_type: 'CRYPTOPUNK',
    token_id: punk.token_id,
    token_uri: null,
    image: metadata.image,
    thumbnail: metadata.image,
    possible_spam: false,
    wallet_address: walletAddress.toLowerCase(),
  }
}

/*
  function sortAndFilterNfts(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nftData: any[],
    chainId: number,
    walletAddress: string,
  ): NFTUpload[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getFloorPrice = (nft: any): number => {
      try {
        const floorPrice = nft.contract.openSeaMetadata?.floorPrice
        return floorPrice ? floorPrice : -Infinity
      } catch {
        return -Infinity
      }
    }

    const sortedNfts = [...nftData].sort((a, b) => getFloorPrice(b) - getFloorPrice(a))

    return sortedNfts.map((nft) => ({
      id: nft.contract.address + '_' + nft.tokenId,
      name: nft.raw.metadata.name,
      chain_id: chainId,
      collection_contract: nft.contract.address,
      collection_name: nft.contract.name,
      token_type: nft.tokenType.toUpperCase(),
      token_id: nft.tokenId,
      token_uri: nft.tokenUri,
      image: nft.image.cachedUrl,
      thumbnail: nft.image.thumbnailUrl,
      possible_spam: getFloorPrice(nft) === -Infinity,
      wallet_address: walletAddress.toLowerCase(),
    }))
  }
*/
