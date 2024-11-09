'use client'

import { useEffect, useState } from 'react'

import { Footer } from '@/components'
import { LoadingIndicator } from '@/components/shared'
import TransactionPage from '@/components/transaction'
import { useIsMobile, useTradeInfo } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { TransactionData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

const ONCHAIN_STATUSES = ['accepted', 'onchain_cancelled', 'onchain_completed']

interface NFTPageProps {
  params: {
    id: string
  }
}

const Transactions: React.FC<NFTPageProps> = ({ params }) => {
  const { user, loading, profile } = useAuth()
  const { showToast } = useToast()
  const isMobile = useIsMobile()
  const [txInfo, setTxInfo] = useState<TransactionData | null>(null)

  const { tradeInfo, isLoading, refetch } = useTradeInfo(txInfo?.onchain_trade_id || null)

  const fetchOfferInfo = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_single_offer', {
          offer_id_param: params.id,
          current_user_id: user?.id,
        })
        .single()

      if (error) {
        showToast('⚠️ Failed to fetch Offer', 2500)
        throw error
      }

      if (data) {
        setTxInfo(data as TransactionData)
      }
    } catch (error) {
      showToast('⚠️ Failed to fetch Offer', 2500)
      console.error('Failed to fetch Offer', error)
    }
  }

  useEffect(() => {
    if ((params.id, !loading)) {
      fetchOfferInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, loading])

  console.log('abc', tradeInfo, txInfo)

  if (!txInfo || !ONCHAIN_STATUSES.includes(txInfo.status) || !tradeInfo) {
    return (
      <div className='w-full flex flex-col items-center justify-center mt-[150px]'>
        <LoadingIndicator />
      </div>
    )
  }

  return (
    <div
      className={`absolute top-[75px] bottom-0 w-full overflow-y-auto hide-scrollbar ${!isMobile && 'bottom-[50px]'}`}
    >
      {txInfo && (
        <div className='max-w-screen-lg px-4 mx-auto my-8'>
          <TransactionPage
            key={txInfo.offer_id}
            fullPage={true}
            transaction={txInfo}
            onchainInfo={tradeInfo}
            showTxModal={() => {
              const txModalInfo = {
                offerId: txInfo.offer_id,
                onchain: {
                  id: txInfo.onchain_trade_id,
                  hash: txInfo.onchain_tx,
                  done: txInfo.onchain_done,
                },
                chainId: txInfo.chain_id,
                users: {
                  creator: {
                    id: txInfo.creator_id,
                    username: txInfo.creator_username,
                    profile_pic_url: txInfo.creator_profile_pic_url,
                    wallet: txInfo.creator_wallet,
                  },
                  counterparty: {
                    id: txInfo.counterparty_id,
                    username: txInfo.counterparty_username,
                    profile_pic_url: txInfo.counterparty_profile_pic_url,
                    wallet: txInfo.counterparty_wallet,
                  },
                },
                assets: {
                  creator: txInfo.creator_assets,
                  counterparty: txInfo.counterparty_assets,
                },
              }
              // setTxModalInfo(txModalInfo)
            }}
          />
        </div>
      )}
      {!isMobile && <Footer />}
    </div>
  )
}

export default Transactions
