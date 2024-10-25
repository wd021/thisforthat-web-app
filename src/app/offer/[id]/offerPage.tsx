// TODO: on desktop, dont stretch to entire screen

'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import { Offer } from '@/components/modals'
import { Main, Select, Transaction, TransactionFeedback } from '@/components/offer'
import { NFTImage, NFTOfferItem, VerifiedBadge } from '@/components/shared'
import { ChainLogo, Etherscan, Opensea, Tag } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { OfferFeedItem } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS, GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

interface OfferPageProps {
  offerInfo: OfferFeedItem
}

const OfferPage: React.FC<OfferPageProps> = ({ offerInfo }) => {
  const [view, setView] = useState<'main' | 'select' | 'create_trade' | null>('main')

  const createTradeOnChain = useCallback(
    async () => {
      // if (!address || !publicClient) return
      // try {
      //   const { request } = await publicClient.simulateContract({
      //     address: CONTRACT_ADDRESSES[31337],
      //     abi: ABI,
      //     functionName: 'createTrade',
      //     args: [
      //       [offerInfo.user.wallet as Address, offerInfo.counter_user.wallet as Address],
      //       prepareAllAssets(offerInfo),
      //     ],
      //     account: address,
      //   })
      //   writeContract(request)
      // } catch (err) {
      //   console.log('err', err)
      //   if (err instanceof ContractFunctionExecutionError) {
      //     const errorMessage = err.message.toLowerCase()
      //     showToast('⚠️ ' + errorMessage, 2500)
      //   } else {
      //     showToast('⚠️ Transaction failed. Please try again', 2500)
      //   }
      // }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      /*address, offerInfo, publicClient*/
    ],
  )

  const acceptOffer = async () => {
    // if (!isConnected) {
    //   setOpen(true)
    // } else {
    //   // setView('create_trade')
    //   createTradeOnChain()
    // }
  }

  const counterOffer = async () => {
    // setView('select')
  }

  return (
    <>
      {view === 'main' && (
        <Main
          offerId={offerInfo.id}
          info={offerInfo}
          acceptOffer={acceptOffer}
          counterOffer={counterOffer}
          closeModal={() => {
            // route to home
          }}
        />
      )}
      {/* {view === 'create_trade' && <TransactionFeedback status={transactionStatus} />} */}
      {view === 'select' && (
        <Select
          type={'counter_offer'}
          chainId={offerInfo.chain_id}
          offerId={offerInfo.id}
          userA={{
            id: offerInfo.user?.id,
            username: offerInfo.user?.username,
            profile_pic_url: offerInfo.user?.profile_pic_url,
          }}
          userB={{
            id: offerInfo.counter_user?.id,
            username: offerInfo.counter_user?.username,
            profile_pic_url: offerInfo.counter_user?.profile_pic_url,
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initUserAItems={(offerInfo.offer as any).user}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initUserBItems={(offerInfo.offer as any).userCounter}
          onClose={() => {}}
        />
      )}
      {/* {view === 'transaction' && <Transaction info={offerInfo} closeModal={closeModal} />} */}
      {/* <TransactionFeedback status={transactionStatus} /> */}
    </>
  )
}

export default OfferPage
