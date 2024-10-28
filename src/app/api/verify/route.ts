// TODO: add fallback of quicknode / moralis if fail with too many requests
// if valid verifications > 0 but hits error, return the valid verifications

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import {
  ALCHEMY_CHAIN_ID_SLUGS,
  CHAIN_IDS_TO_CHAINS,
  NFT_VERIFY_LIMIT,
} from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

async function fetchAlchemyOwnership(chain, contractAddress, tokenId) {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_ID
  const url = `https://${ALCHEMY_CHAIN_ID_SLUGS[chain]}.g.alchemy.com/nft/v2/${apiKey}/getOwnersForToken/?contractAddress=${contractAddress}&tokenId=${tokenId}`
  const response = await fetch(url, { method: 'get', redirect: 'follow' })

  console.log('fetchAlchemyOwnership', response, chain, contractAddress, tokenId)
  if (!response.ok) {
    throw new Error('Failed to fetch NFT metadata from Alchemy')
  }
  return response.json()
}

async function fetchCryptoPunkOwnership(contractAddress, tokenId) {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_ID
  const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
  const payload = {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [
      {
        to: contractAddress,
        data: `0x3b3b57de${tokenId.toString(16).padStart(64, '0')}`, // 'punkIndexToAddress(uint256)' selector + tokenId
      },
      'latest',
    ],
    id: 1,
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch CryptoPunk ownership from contract')
  }
  const result = await response.json()
  return result.result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const { address, chain, signature } = await req.json()

  if (!address || !chain || !signature) {
    return new Response('Incorrect request params', { status: 400 })
  }

  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    })

    const message = `Verify ownership of NFTs for wallet ${address} on ${CHAIN_IDS_TO_CHAINS[chain]}`

    const valid = await publicClient.verifyMessage({
      address,
      message,
      signature,
    })

    if (!valid) {
      return new Response('Verification failed', { status: 400 })
    } else {
      const { data: userNftData, error } = await supabase
        .from('user_nfts')
        .select(`*, nfts!inner(*)`)
        .eq('user_id', data.user.id)
        .eq('wallet_address', address)
        .or(`nfts.is_verified.eq.false,nfts.user_id.neq.${data.user.id}`)
        .limit(NFT_VERIFY_LIMIT)

      if (error) {
        return new Response('Failed to fetch NFT data', { status: 500 })
      }

      let validVerifications = 0

      for (const userNft of userNftData) {
        let isOwner = false
        let newWalletAddress = null

        if (userNft.nfts.token_type === 'ERC721' || userNft.nfts.token_type === 'ERC1155') {
          const response = await fetchAlchemyOwnership(
            chain,
            userNft.nfts.collection_contract,
            userNft.nfts.token_id,
          )

          // erc1155 can have multiple owners - we only deal with 1 owner NFTS for now
          if (response.owners.length === 1) {
            if (response.owners[0].toLowerCase() === address.toLowerCase()) {
              isOwner = true
            } else {
              newWalletAddress = response.owners[0].toLowerCase()
            }
          }
        } else if (userNft.nfts.token_type === 'CRYPTOPUNK') {
          const owner = await fetchCryptoPunkOwnership(
            userNft.nfts.collection_contract,
            userNft.nfts.token_id,
          )

          if (owner.toLowerCase() === address.toLowerCase()) {
            isOwner = true
          } else {
            newWalletAddress = owner.toLowerCase()
          }
        }

        if (isOwner) {
          // Update Supabase to mark the NFT as verified
          const { error: updateError } = await supabase
            .from('nfts')
            .update({
              is_verified: true,
              verified_at: new Date().toISOString(),
              user_id: data.user.id,
            })
            .eq('id', userNft.nfts.id)

          if (updateError) {
            console.error('Error updating NFT verification status:', updateError)
          } else {
            validVerifications++
          }
        } else if (newWalletAddress) {
          const { error: updateWalletError } = await supabase
            .from('nfts')
            .update({ wallet_address: newWalletAddress })
            .eq('id', userNft.nfts.id)

          if (updateWalletError) {
            console.error('Error updating wallet address:', updateWalletError)
          }
        }
      }

      return NextResponse.json({ validVerifications }, { status: 200 })
    }
  } catch (error) {
    console.error('Upload processing error:', error)
    return new Response('Upload failed', { status: 500 })
  }
}
