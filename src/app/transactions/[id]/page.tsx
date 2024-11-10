'use client'

import { useEffect, useState } from 'react'

import { Footer } from '@/components'
import { Transaction } from '@/components/modals'
import TransactionCancel from '@/components/modals/transaction/cancel'
import { LoadingIndicator } from '@/components/shared'
import TransactionCard from '@/components/transaction'
import { useIsMobile, useTradeInfo } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { TxCancelModalInfo, TxModalInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

const ONCHAIN_STATUSES = ['accepted', 'onchain_cancelled', 'onchain_completed']

interface NFTPageProps {
  params: {
    id: string
  }
}

const Transactions: React.FC<NFTPageProps> = ({ params }) => {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const isMobile = useIsMobile()
  const [txInfo, setTxInfo] = useState<TransactionData | null>(null)

  const [txModalInfo, setTxModalInfo] = useState<TxModalInfo | null>(null)
  const [txCancelModalInfo, setTxCancelModalInfo] = useState<TxCancelModalInfo | null>(null)

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

  if (!txInfo || !ONCHAIN_STATUSES.includes(txInfo.status)) {
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
          <TransactionCard
            key={txInfo.offer_id}
            fullPage={true}
            transaction={txInfo}
            setTxModalInfo={setTxModalInfo}
            setTxCancelModalInfo={setTxCancelModalInfo}
          />
        </div>
      )}
      {txModalInfo && (
        <Transaction
          {...txModalInfo}
          closeModal={() => setTxModalInfo(null)}
          onCreateTrade={(offerId: string, tradeId: string, tx: string) => {
            setTxInfo((prevTxInfo) => {
              if (prevTxInfo) {
                return { ...prevTxInfo, onchain_trade_id: tradeId, onchain_tx: tx }
              }
              return prevTxInfo
            })
          }}
          onCompleteTrade={() => {
            setTxInfo((prevTxInfo) => {
              if (prevTxInfo) {
                return { ...prevTxInfo, status: 'onchain_completed', onchain_done: true }
              }
              return prevTxInfo
            })
          }}
        />
      )}
      {txCancelModalInfo && (
        <TransactionCancel
          {...txCancelModalInfo}
          closeModal={() => setTxCancelModalInfo(null)}
          onCancelTrade={() => {
            setTxInfo((prevTxInfo) => {
              if (prevTxInfo) {
                return { ...prevTxInfo, status: 'onchain_cancelled', onchain_done: true }
              }
              return prevTxInfo
            })
          }}
        />
      )}
      {!isMobile && <Footer />}
    </div>
  )
}

export default Transactions
