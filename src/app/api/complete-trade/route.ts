import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPublicClient, http } from 'viem'
import { anvil, mainnet } from 'viem/chains'

import ABI from '@/contracts/abi.json'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'
import { createTokenIdRecipientMapping } from '@/utils/helpers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // db: {
    //   schema: 'public',
    // },
  },
)

export async function POST(req: Request) {
  // 1. Authentication check
  const headersList = headers()
  const authorization = headersList.get('authorization')

  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authorization.split(' ')[1]
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !authData) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 2. Get offer details
    const { offer_id } = await req.json()

    if (!offer_id) {
      return new Response('Missing offer_id', { status: 400 })
    }

    const { data: offerData, error: offerError } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('id', offer_id)
      .single()

    if (offerError || !offerData) {
      return new Response('Failed to fetch offer data', { status: 404 })
    }

    // Check if trade is correct status
    if (offerData.status !== 'accepted') {
      return new Response('Trade status incorrect', { status: 400 })
    }

    // 3. Check onchain trade status
    const publicClient = createPublicClient({
      chain: anvil,
      transport: http(),
    })

    const tradeInfo = await publicClient.readContract({
      address: CONTRACT_ADDRESSES[31337],
      abi: ABI,
      functionName: 'getTradeInfo',
      args: [BigInt(offerData.onchain_trade_id)],
    })

    const [isActive, depositedAssetCount, totalAssetCount, encodedAssets] = tradeInfo
    const tokenMapping = createTokenIdRecipientMapping(tradeInfo[3])

    console.log('tradeInfo', tradeInfo)
    console.log('tokenMapping', tokenMapping)
    // map the assets and new wallets and pass it with the rpc call

    if (isActive === true) {
      return new Response('Trade is still active onchain', { status: 400 })
    }

    const onchainSuccess =
      depositedAssetCount === totalAssetCount && Number(depositedAssetCount) > 0 ? true : false

    console.log('onchainSuccess', onchainSuccess)

    if (onchainSuccess) {
      // Complete the swap using service role
      const { error } = await supabaseAdmin.rpc('complete_onchain_swap', {
        p_offer_id: offer_id,
        p_nft_wallets: tokenMapping,
      })

      if (error) {
        console.error('Error completing swap:', error)
        return new Response(error.message, { status: 500 })
      }

      return NextResponse.json({ status: 'confirm-completed' }, { status: 200 })
    } else {
      // Complete the swap using service role
      const { error } = await supabaseAdmin.rpc('cancel_onchain_swap', {
        p_offer_id: offer_id,
      })
      if (error) {
        console.error('Error cancelling swap:', error)
        return new Response(error.message, { status: 500 })
      }

      return NextResponse.json({ status: 'confirm-cancelled' }, { status: 200 })
    }
  } catch (error) {
    console.error('Complete trade error:', error)
    return new Response('Failed to complete trade', { status: 500 })
  }
}
