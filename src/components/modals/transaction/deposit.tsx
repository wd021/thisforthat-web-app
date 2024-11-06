import React, { useState } from 'react'

import { OnchainTradeInfoAsset } from '@/types/main'
import { SimplifiedNFTAsset } from '@/types/supabase'
import { Close } from '@/icons'
import { Address } from 'viem'

import DepositCard from './depositCard'

const DepositTx = ({
  assets,
  onchainDeposited,
  tradeId,
  onClose,
  onFinish,
}: {
  assets: SimplifiedNFTAsset[]
  onchainDeposited: { token: `0x${string}`; tokenId: bigint }[]
  tradeId: string
  onClose: () => void
  onFinish: () => void
}) => {
  const [onchainDone, setOnchainDone] = useState<
    {
      token: Address
      tokenId: bigint
    }[]
  >(onchainDeposited)

  // loop through assets to see if in onchaindeposited, get count of how many left
  const depositsRemaining = assets.filter((asset) => {
    return !onchainDone.some(
      (done) =>
        done.token.toLowerCase() === asset.collection_contract.toLowerCase() &&
        done.tokenId.toString() === asset.token_id,
    )
  }).length

  return (
    <div className='bg-white rounded-3xl shadow-lg flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
        <div className='flex flex-col'>
          <h2 className='text-xl text-gray-900 font-medium mb-1'>Deposit Your NFTs</h2>
        </div>
        <button className='text-gray-500' onClick={onClose}>
          <Close className='w-5 h-5' />
        </button>
      </div>

      {/* Deposit Section */}
      <div className='bg-white rounded-lg overflow-hidden'>
        {assets.map((asset, index) => {
          return (
            <DepositCard
              key={index}
              tradeId={tradeId}
              asset={asset}
              depositedAssets={onchainDone}
              onFinish={() => {
                setOnchainDone([
                  ...onchainDone,
                  {
                    token: asset.collection_contract as `0x${string}`,
                    tokenId: BigInt(asset.token_id),
                  },
                ])
              }}
            />
          )
        })}
      </div>

      {/* Footer Done */}
      <div className='flex justify-center p-4'>
        <button
          onClick={onFinish}
          disabled={depositsRemaining > 0}
          className='w-full p-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default DepositTx
