import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'

import { useIsMobile, useTradeInfo } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { OnchainTradeInfo } from '@/types/main'
import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'

import CancelTx from './cancel'
import CompletedTx from './completed'
import CreateTx from './create'
import DepositTx from './deposit'
import WaitingTx from './waiting'
import { getTradeInfo } from '@/utils/helpers'

const getAssetsToDeposit = (
  user: { id: string },
  users: {
    creator: ProfileMinimal
    counterparty: ProfileMinimal
  },
  assets: {
    creator: SimplifiedNFTAsset[]
    counterparty: SimplifiedNFTAsset[]
  },
  tradeInfo: TradeInfo,
): SimplifiedNFTAsset[] => {
  // Determine if the current user is the creator or counterparty
  const isCreator = user.id === users.creator.id
  const userAssets = isCreator ? assets.creator : assets.counterparty

  // If there's no tradeInfo or assets, return empty array
  if (!tradeInfo?.assets || !userAssets) return []

  // Filter assets that haven't been deposited yet
  return userAssets.filter((userAsset) => {
    // Find corresponding asset in tradeInfo
    const tradeInfoAsset = tradeInfo.assets.find(
      (tAsset) =>
        tAsset.token.toLowerCase() === userAsset.collection_contract.toLowerCase() &&
        tAsset.tokenId.toString() === userAsset.token_id,
    )

    // Include asset if it's found in tradeInfo and not yet deposited
    return tradeInfoAsset && !tradeInfoAsset.isDeposited
  })
}

const getOtherUserPendingDeposits = (
  user: { id: string },
  users: {
    creator: ProfileMinimal
    counterparty: ProfileMinimal
  },
  assets: {
    creator: SimplifiedNFTAsset[]
    counterparty: SimplifiedNFTAsset[]
  },
  tradeInfo: TradeInfo,
): {
  hasPendingDeposits: boolean
  pendingAssets: SimplifiedNFTAsset[]
} => {
  // Determine if the current user is the creator or counterparty
  const isCreator = user.id === users.creator.id

  // Get the other user's assets
  const otherUserAssets = isCreator ? assets.counterparty : assets.creator

  // If there's no tradeInfo or assets, return empty result
  if (!tradeInfo?.assets || !otherUserAssets) {
    return {
      hasPendingDeposits: false,
      pendingAssets: [],
    }
  }

  // Filter assets that haven't been deposited yet by the other user
  const pendingAssets = otherUserAssets.filter((otherAsset) => {
    // Find corresponding asset in tradeInfo
    const tradeInfoAsset = tradeInfo.assets.find(
      (tAsset) =>
        tAsset.token.toLowerCase() === otherAsset.collection_contract.toLowerCase() &&
        tAsset.tokenId.toString() === otherAsset.token_id,
    )

    // Include asset if it's found in tradeInfo and not yet deposited
    return tradeInfoAsset && !tradeInfoAsset.isDeposited
  })

  return {
    hasPendingDeposits: pendingAssets.length > 0,
    pendingAssets,
  }
}

const TransactionModal: React.FC<{
  transactionInfo: {
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
  onchainInfo: OnchainTradeInfo
  closeModal: () => void
}> = ({ transactionInfo, onchainInfo, closeModal }) => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  const [depositComplete, setDepositComplete] = useState(false)

  const [onChainInfo, setOnChainInfo] = useState<{
    id: string | null
    hash: string | null
    done: boolean
  }>(onchain)

  const { tradeInfo, isLoading, refetch } = useTradeInfo(onChainInfo.id, onChainInfo.done)

  const assetsToDeposit =
    !isLoading && tradeInfo && user ? getAssetsToDeposit(user, users, assets, tradeInfo) : []

  const { hasPendingDeposits, pendingAssets } =
    !isLoading && tradeInfo && user
      ? getOtherUserPendingDeposits(user, users, assets, tradeInfo)
      : { hasPendingDeposits: false, pendingAssets: [] }

  const showCancelComponent = onChainInfo.id !== null && cancelTrade
  const showCreateComponent = onChainInfo.id === null
  const showDepositComponent =
    onChainInfo.id !== null && !onChainInfo.done && assetsToDeposit.length > 0
  const showWaitingComponent =
    onChainInfo.id !== null &&
    !onChainInfo.done &&
    (assetsToDeposit.length === 0 || depositComplete) &&
    hasPendingDeposits
  const showCompletedComponent =
    onChainInfo.done ||
    (onChainInfo.id !== null &&
      !onChainInfo.done &&
      (assetsToDeposit.length === 0 || depositComplete) &&
      !hasPendingDeposits)

  useEffect(() => {
    const fetchTradeInfo = async () => {
      if (onChainInfo.id) {
        const tradeResults = await getTradeInfo(onChainInfo.id)
        console.log('get trade results', tradeResults)
      }
    }

    if (onChainInfo.id) {
      fetchTradeInfo()
    }
  }, [onChainInfo.id])

  console.log('assetsToDeposit', assetsToDeposit)

  return (
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      {showCancelComponent ? (
        <CancelTx />
      ) : showCreateComponent ? (
        <CreateTx
          offerId={offerId}
          chainId={chainId}
          users={users}
          assets={assets}
          onClose={closeModal}
          onFinish={(hash: string, tradeId: string) => {
            setOnChainInfo({ id: tradeId, hash, done: false })
          }}
        />
      ) : showDepositComponent ? (
        <DepositTx
          assets={assetsToDeposit}
          tradeId={BigInt(onChainInfo.id!)}
          onClose={closeModal}
          onFinish={() => {
            setDepositComplete(true)
          }}
        />
      ) : showWaitingComponent ? (
        <WaitingTx tradeId={onchain.id!} onClose={closeModal} />
      ) : showCompletedComponent ? (
        <CompletedTx onClose={closeModal} />
      ) : null}
    </Modal>
  )
}

export default TransactionModal
