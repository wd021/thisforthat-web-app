import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import ABI from '@/contracts/abi.json'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'
import { supabase } from '@/utils/supabaseClient'

interface TradeOffer {
  user: Array<{
    id: string
    name: string
    image: string
    token_id: string
    chain_id: number
    token_type: string
    collection_contract: string
  }>
  userCounter: Array<{
    id: string
    name: string
    image: string
    token_id: string
    chain_id: number
    token_type: string
    collection_contract: string
  }>
}

export async function POST(req: Request) {
  // 1. Authentication check
  const headersList = headers()
  const authorization = headersList.get('authorization')

  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authorization.split(' ')[1]
  const { data: authData, error: authError } = await supabase.auth.getUser(token)

  if (authError || !authData) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 2. Get offer details
    const { offer_id } = await req.json()

    if (!offer_id) {
      return new Response('Missing offer_id', { status: 400 })
    }

    const { data: offerData, error: offerError } = await supabase
      .from('user_offers')
      .select('*')
      .eq('id', offer_id)
      .single()

    if (offerError || !offerData) {
      return new Response('Failed to fetch offer data', { status: 404 })
    }

    // Check if trade is already completed
    if (offerData.status === 'completed') {
      return new Response('Trade already completed', { status: 400 })
    }

    // Check if trade is accepted and has onchain_trade_id
    if (offerData.status !== 'accepted' || !offerData.onchain_trade_id) {
      return new Response('Trade not ready for confirmation', { status: 400 })
    }

    // 3. Check onchain trade status
    const publicClient = createPublicClient({
      // chain: mainnet, // try with anvil if this fails
      transport: http(),
    })

    const tradeInfo = await publicClient.readContract({
      address: CONTRACT_ADDRESSES[31337],
      abi: ABI,
      functionName: 'getTradeInfo',
      args: [BigInt(offerData.onchain_trade_id)],
    })

    if (tradeInfo.isActive) {
      return new Response('Trade not yet completed on-chain', { status: 400 })
    }

    // 4. Parse offer JSON and update ownership
    const offerDetails: TradeOffer = JSON.parse(offerData.offer)

    // Start a Supabase transaction for all updates
    const updates = []

    // Update ownership for first user's NFTs
    for (const nft of offerDetails.user) {
      // Remove old user_nft entry
      updates.push(
        supabase.from('user_nfts').delete().match({
          nft_id: nft.id,
          user_id: offerData.user_id,
        }),
      )

      // Add new user_nft entry
      updates.push(
        supabase.from('user_nfts').insert({
          nft_id: nft.id,
          user_id: offerData.user_id_counter,
        }),
      )

      // Update NFT ownership details
      updates.push(
        supabase
          .from('nfts')
          .update({
            wallet_address: tradeInfo.asset.recipient,
            verified_at: new Date().toISOString(),
            is_verified: true,
            user_id: offerData.user_id_counter,
            warning: false,
          })
          .eq('id', nft.id),
      )
    }

    // Update ownership for counter user's NFTs
    for (const nft of offerDetails.userCounter) {
      // Remove old user_nft entry
      updates.push(
        supabase.from('user_nfts').delete().match({
          nft_id: nft.id,
          user_id: offerData.user_id_counter,
        }),
      )

      // Add new user_nft entry
      updates.push(
        supabase.from('user_nfts').insert({
          nft_id: nft.id,
          user_id: offerData.user_id,
        }),
      )

      // Update NFT ownership details
      updates.push(
        supabase
          .from('nfts')
          .update({
            wallet_address: tradeInfo.asset.recipient,
            verified_at: new Date().toISOString(),
            is_verified: true,
            user_id: offerData.user_id,
            warning: false,
            other_user_ids: null,
          })
          .eq('id', nft.id),
      )
    }

    // Mark the offer as completed
    updates.push(
      supabase.from('user_offers').update({ status: 'completed' }).eq('id', offer_id),
    )

    // Execute all updates
    const results = await Promise.all(updates)

    // Check for any errors in the updates
    const updateErrors = results.filter((result) => result.error)
    if (updateErrors.length > 0) {
      console.error('Errors during update:', updateErrors)
      return new Response('Failed to update ownership records', { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Confirm trade error:', error)
    return new Response('Failed to confirm trade', { status: 500 })
  }
}
