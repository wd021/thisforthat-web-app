import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import {
  ALCHEMY_CHAIN_ID_SLUGS,
  CHAIN_IDS_TO_CHAINS,
  NFT_VERIFY_LIMIT,
  PUNK_VERIFY_LIMIT,
} from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

interface AlchemyNFT {
  contractAddress: string
  tokenId: string
  balance: string
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[]
  totalCount: number
  pageKey: string | null
}

async function fetchNFTsForOwner(
  chain: string,
  ownerAddress: string,
  contractAddresses: string[],
) {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  const baseUrl = `https://${ALCHEMY_CHAIN_ID_SLUGS[chain]}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`

  const params = new URLSearchParams({
    owner: ownerAddress,
    contractAddresses: JSON.stringify(contractAddresses),
    withMetadata: 'false',
    pageSize: '100',
  })

  const response = await fetch(`${baseUrl}?${params}`, {
    method: 'get',
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch NFTs from Alchemy')
  }
  return response.json() as Promise<AlchemyResponse>
}

async function getPunkOwner(contractAddress: string, tokenId: string) {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`

  // Create the function signature for punkIndexToAddress(uint256)
  const functionSelector = '0x58178168' // First 4 bytes of keccak256(functionSignature)

  // Encode the punk index parameter (pad to 32 bytes)
  const paddedIndex = parseInt(tokenId).toString(16).padStart(64, '0')

  // Combine function selector and encoded parameter
  const data = `${functionSelector}${paddedIndex}`

  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_call',
    params: [
      {
        to: contractAddress,
        data: data,
      },
      'latest',
    ],
  }

  try {
    const response = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const json = await response.json()

    if (json.error) {
      throw new Error(`RPC Error: ${json.error.message}`)
    }

    // The result is a 32-byte address, remove '0x' and leading zeros
    const address = `0x${json.result.slice(-40)}`
    return address.toLowerCase()
  } catch (error) {
    console.error('Error fetching punk owner:', error)
    throw error
  }
}

export async function POST(req: any) {
  const headersList = headers()
  const authorization = headersList.get('authorization')

  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authorization.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { address, chain, signature, nftIds } = await req.json()

  if (!address || !chain || !signature || !nftIds || !Array.isArray(nftIds)) {
    return new Response('Incorrect request params', { status: 400 })
  }

  // Validate NFT limits
  if (nftIds.length > NFT_VERIFY_LIMIT) {
    return new Response('Too many NFTs selected', { status: 400 })
  }

  try {
    // Fetch NFT details for the selected IDs
    const { data: userNftData, error: nftError } = await supabase
      .from('user_nfts')
      .select(`*, nfts!inner(*)`)
      .eq('user_id', data.user.id)
      .eq('wallet_address', address.toLowerCase())
      .in('nft_id', nftIds)

    if (nftError) {
      return new Response(JSON.stringify(nftError), { status: 500 })
    }

    if (!userNftData || userNftData.length === 0) {
      return new Response('No NFTs found for the provided IDs', { status: 400 })
    }

    // Validate punk limit
    const punkCount = userNftData.filter((nft) => nft.nfts.token_type === 'CRYPTOPUNK').length
    if (punkCount > PUNK_VERIFY_LIMIT) {
      return new Response('Too many CryptoPunks selected', { status: 400 })
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    })

    const message = `Verify ownership of NFTs for wallet ${address} on ${CHAIN_IDS_TO_CHAINS[chain as keyof typeof CHAIN_IDS_TO_CHAINS]}`
    const valid = await publicClient.verifyMessage({
      address,
      message,
      signature,
    })

    if (!valid) {
      return new Response('Verification failed', { status: 400 })
    }

    // Group NFTs by type
    const standardNfts = userNftData.filter(
      (nft) => nft.nfts.token_type === 'ERC721' || nft.nfts.token_type === 'ERC1155',
    )
    const cryptoPunks = userNftData.filter((nft) => nft.nfts.token_type === 'CRYPTOPUNK')

    let validVerifications = 0
    let punkVerifications = 0
    const verifiedNftIds: string[] = []
    const walletUpdates: Array<{ id: string; wallet_address: string }> = []

    // Handle standard NFTs (ERC721 & ERC1155)
    if (standardNfts.length > 0) {
      const contractAddresses = [
        ...new Set(standardNfts.map((nft) => nft.nfts.collection_contract)),
      ]
      const ownedNFTs = await fetchNFTsForOwner(chain, address, contractAddresses)

      for (const nft of standardNfts) {
        if (validVerifications >= NFT_VERIFY_LIMIT) break

        const isOwned = ownedNFTs.ownedNfts.some((ownedNft) => {
          const contractMatches =
            ownedNft.contractAddress.toLowerCase() ===
            nft.nfts.collection_contract.toLowerCase()
          const tokenIdMatches = ownedNft.tokenId === nft.nfts.token_id
          const hasBalance = parseInt(ownedNft.balance) > 0
          return contractMatches && tokenIdMatches && hasBalance
        })

        if (isOwned) {
          verifiedNftIds.push(nft.nfts.id)
          validVerifications++
        }
      }
    }

    // Handle CryptoPunks
    if (cryptoPunks.length > 0) {
      for (const punk of cryptoPunks) {
        if (validVerifications >= NFT_VERIFY_LIMIT) break

        const owner = await getPunkOwner(punk.nfts.collection_contract, punk.nfts.token_id)

        if (owner === address.toLowerCase()) {
          verifiedNftIds.push(punk.nfts.id)
          validVerifications++
          punkVerifications++
        } else if (owner) {
          walletUpdates.push({
            id: punk.nfts.id,
            wallet_address: owner,
          })
        }
      }
    }

    // Perform batch verification update
    if (verifiedNftIds.length > 0) {
      const { error: verifyError } = await supabase
        .from('nfts')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          user_id: data.user.id,
          wallet_address: address.toLowerCase(),
        })
        .in('id', verifiedNftIds)

      if (verifyError) {
        console.error('Error updating NFT verification status:', verifyError)
        return new Response('Failed to update NFTs', { status: 500 })
      }
    }

    // Handle wallet address updates
    if (walletUpdates.length > 0) {
      for (const update of walletUpdates) {
        const { error: walletError } = await supabase
          .from('nfts')
          .update({ wallet_address: update.wallet_address })
          .eq('id', update.id)
          .eq('wallet_address', address.toLowerCase())

        if (walletError) {
          console.error('Error updating wallet address:', walletError)
          // Continue with other updates even if one fails
        }
      }
    }

    return NextResponse.json(
      {
        validVerifications,
        punkVerifications,
        limitReached: validVerifications === NFT_VERIFY_LIMIT,
        punkLimitReached: punkVerifications === PUNK_VERIFY_LIMIT,
        remainingPunkVerifications: Math.max(0, PUNK_VERIFY_LIMIT - punkVerifications),
        remainingVerifications: Math.max(0, NFT_VERIFY_LIMIT - validVerifications),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Verification processing error:', error)
    // return error
    return NextResponse.json(
      { error: 'Failed to verify NFTs', message: error },
      { status: 500 },
    )
  }
}
