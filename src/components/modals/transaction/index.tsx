import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'

import { useIsMobile, useTradeInfo } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { TradeInfo } from '@/types/main'
import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'

import CancelTx from './cancel'
import CompletedTx from './completed'
import CreateTx from './create'
import DepositTx from './deposit'

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

const TradeCreationModal: React.FC<{
  offerId: string
  cancelTrade: boolean
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
  closeModal: () => void
}> = ({ offerId, cancelTrade, onchain, chainId, users, assets, closeModal }) => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  const { tradeInfo, isLoading, refetch } = useTradeInfo(onchain.id)

  const assetsToDeposit =
    !isLoading && tradeInfo && user ? getAssetsToDeposit(user, users, assets, tradeInfo) : []

  const showCancelComponent = onchain.id !== null && cancelTrade
  const showCreateComponent = onchain.id === null
  const showDepositComponent = onchain.id !== null && !onchain.done
  const showCompletedComponent = onchain.done

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
          onFinish={() => {}}
        />
      ) : showDepositComponent ? (
        <DepositTx assets={assetsToDeposit} tradeId={BigInt(onchain.id!)} onFinish={() => {}} />
      ) : showCompletedComponent ? (
        <CompletedTx />
      ) : null}
    </Modal>
  )
}

export default TradeCreationModal
