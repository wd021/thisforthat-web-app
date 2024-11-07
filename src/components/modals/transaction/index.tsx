import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'

import { useIsMobile, useTradeInfo } from '@/hooks'
import { useSyncApiWithChain } from '@/hooks/supabase'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { OnchainTradeInfo } from '@/types/main'
import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'
import { completeTradeWithApi, getTradeInfo } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

import CancelTx from './cancel'
import CompletedTx from './completed'
import CreateTx from './create'
import DepositTx from './deposit'
import WaitingTx from './waiting'

const getDepositCount = (
  user: 'creator' | 'counterparty',
  onchainId: string | null,
  users: {
    creator: ProfileMinimal
    counterparty: ProfileMinimal
  },
  assets: {
    creator: SimplifiedNFTAsset[]
    counterparty: SimplifiedNFTAsset[]
  },
  tradeInfo: OnchainTradeInfo | null,
): number => {
  const userAssets = user === 'creator' ? assets.creator : assets.counterparty

  if (!tradeInfo?.assets || !userAssets) return 0

  if (!onchainId) return userAssets.length

  return userAssets.filter((userAsset) => {
    const tradeInfoAsset = tradeInfo.assets.find(
      (tAsset) =>
        tAsset.token.toLowerCase() === userAsset.collection_contract.toLowerCase() &&
        tAsset.tokenId.toString() === userAsset.token_id,
    )

    return tradeInfoAsset && !tradeInfoAsset.isDeposited
  }).length
}

const TransactionModal: React.FC<{
  transactionInfo: {
    status: string
    offerId: string
    onchain: {
      id: string | null
      hash: string | null
      done: boolean
    }
    chainId: number
    users: {
      creator: ProfileMinimal
      counterparty: ProfileMinimal
    }
    assets: {
      creator: SimplifiedNFTAsset[]
      counterparty: SimplifiedNFTAsset[]
    }
  }
  onchainInfo: OnchainTradeInfo | null
  closeModal: () => void
}> = ({ transactionInfo, onchainInfo, closeModal }) => {
  useSyncApiWithChain(onchainInfo, {
    offer_id: transactionInfo.offerId,
    onchain_done: transactionInfo.onchain.done,
  })

  const { showToast } = useToast()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  // determine which component to show
  const [loading, setLoading] = useState(true)

  const [userDepositCount, setUserDepositCount] = useState<number | null>(null)
  const [counterDepositCount, setCounterDepositCount] = useState<number | null>(null)

  const [tradeId, setTradeId] = useState<string | null>(transactionInfo.onchain.id)

  const [componentToShow, setComponentToShow] = useState<string>(
    transactionInfo.status === 'onchain_completed'
      ? 'completed'
      : transactionInfo.status === 'onchain_cancelled'
        ? 'cancelled'
        : transactionInfo.onchain.id === null
          ? 'create'
          : 'pending',
  )

  useEffect(() => {
    if (user && componentToShow === 'pending') {
      const isCreator = user.id === transactionInfo.users.creator.id

      const userDepositCount = getDepositCount(
        isCreator ? 'creator' : 'counterparty',
        transactionInfo.onchain.id,
        transactionInfo.users,
        transactionInfo.assets,
        onchainInfo,
      )

      const counterDepositCount = getDepositCount(
        isCreator ? 'counterparty' : 'creator',
        transactionInfo.onchain.id,
        transactionInfo.users,
        transactionInfo.assets,
        onchainInfo,
      )

      console.log('userDepositCount', userDepositCount)
      console.log('counterDepositCount', counterDepositCount)
      console.log('isCreator', isCreator)

      setUserDepositCount(userDepositCount)
      setCounterDepositCount(counterDepositCount)
      setLoading(false)

      if (userDepositCount > 0) {
        setComponentToShow('deposit')
      } else if (counterDepositCount > 0) {
        setComponentToShow('waiting')
      } else {
        setComponentToShow('completed')
      }
    }
  }, [user, componentToShow])

  // console.log('onchainInfo.assets', onchainInfo.assets)

  const renderContent = () => {
    switch (componentToShow) {
      case 'cancelled':
        return <CancelTx />
      case 'create':
        return (
          <CreateTx
            offerId={transactionInfo.offerId}
            chainId={transactionInfo.chainId}
            users={transactionInfo.users}
            assets={transactionInfo.assets}
            onClose={closeModal}
            onFinish={(hash: string, tradeId: string) => {
              setTradeId(tradeId)
              setComponentToShow('deposit')
            }}
          />
        )
      case 'deposit':
        return (
          <DepositTx
            assets={
              user?.id === transactionInfo.users.creator.id
                ? transactionInfo.assets.creator
                : transactionInfo.assets.counterparty
            }
            onchainDeposited={
              onchainInfo ? onchainInfo.assets.filter((a) => a.isDeposited) : []
            }
            tradeId={tradeId}
            onClose={closeModal}
            onFinish={async () => {
              if (counterDepositCount === 0) {
                const {
                  data: { session },
                } = await supabase.auth.getSession()
                const token = session?.access_token

                if (token) {
                  await completeTradeWithApi(transactionInfo.offerId, token)
                }
                setComponentToShow('completed')
              } else {
                setComponentToShow('waiting')
              }
            }}
          />
        )
      case 'waiting':
        return <WaitingTx onClose={closeModal} />
      case 'completed':
        return <CompletedTx onClose={closeModal} />
      default:
        return (
          <div className='w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin' />
        )
    }
  }

  return (
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      {renderContent()}
    </Modal>
  )
}

export default TransactionModal
