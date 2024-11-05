import React, { useEffect, useState } from 'react'
import { useModal } from 'connectkit'
import { decodeEventLog } from 'viem'
import { useAccount } from 'wagmi'

import { useCreateTrade } from '@/hooks'
import { Close } from '@/icons'
import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

interface TradeError extends Error {
  code?: number
  message: string
}

const CreateTx: React.FC<{
  offerId: string
  chainId: number
  users: {
    creator: ProfileMinimal
    counterparty: ProfileMinimal
  }
  assets: {
    creator: SimplifiedNFTAsset[]
    counterparty: SimplifiedNFTAsset[]
  }
  onFinish: () => void
}> = ({ offerId, chainId, users, assets, onFinish }) => {
  const [error, setError] = useState<string | null>(null)
  const { setOpen } = useModal()
  const { isConnected } = useAccount()

  const { createTradeOnChain, hash, txReceipt, isConfirmed, isConfirming } = useCreateTrade({
    chainId,
    users,
    assets,
  })

  useEffect(() => {
    const updateOffer = async (hash: string, tradeId: bigint) => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .update({
            onchain_trade_id: tradeId.toString(),
            onchain_tx: hash,
          })
          .match({ id: offerId })
          .is('onchain_trade_id', null)
          .is('onchain_tx', null)
          .select()

        console.log('accept_offer', data, error)

        // if success, proceed to deposit assets
      } catch (error) {
        console.error('Error updating Supabase:', error)
      }
    }

    if (isConfirmed && txReceipt) {
      const decodedLog = decodeEventLog({
        abi: [
          {
            type: 'event',
            name: 'TradeCreated',
            inputs: [
              { name: 'tradeId', type: 'uint256', indexed: true, internalType: 'uint256' },
              { name: 'tradeHash', type: 'bytes32', indexed: true, internalType: 'bytes32' },
            ],
            anonymous: false,
          },
        ],
        data: txReceipt.logs[0].data,
        topics: txReceipt.logs[0].topics,
      })

      const tradeId = decodedLog.args.tradeId
      updateOffer(hash!, tradeId)
    }
  }, [hash, isConfirmed, txReceipt, offerId])

  useEffect(() => {
    if (isConnected) {
      handleCreateTrade()
    } else {
      setOpen(true)
    }
  }, [])

  const handleCreateTrade = async (): Promise<void> => {
    try {
      setError(null)
      console.log('create trade onchain')
      await createTradeOnChain()
    } catch (err) {
      let errorMessage = 'Something went wrong while creating the trade.'

      const tradeError = err as TradeError

      if (tradeError.code === 4001) {
        errorMessage = 'Please connect your wallet to continue.'
      } else if (tradeError.message?.includes('network')) {
        errorMessage = 'Please switch to the correct network and try again.'
      } else if (tradeError.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to create the contract.'
      }

      setError(errorMessage)
    }
  }

  const renderContent = () => {
    if (error) {
      return (
        <div className='flex flex-col items-center space-y-4'>
          <div className='text-red-500'>{error}</div>
          <button
            onClick={() => void handleCreateTrade()}
            className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors'
          >
            Create Contract
          </button>
        </div>
      )
    }

    if (isConfirmed) {
      return <div className='text-gray-900'>Contract created successfully!</div>
    }

    const loadingText = isConfirming ? 'Confirming Transaction' : 'Creating Contract'
    const subText = isConfirming
      ? 'Please wait while your transaction is being confirmed'
      : 'Please confirm the transaction in your wallet'

    return (
      <div className='flex flex-col items-center space-y-3'>
        <div className='w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-900 text-base'>{loadingText}</p>
        <p className='text-gray-500 text-sm'>{subText}</p>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl shadow-lg flex flex-col overflow-hidden'>
      <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
        <div className='flex flex-col'>
          <h2 className='text-xl text-gray-900 font-medium mb-1'>Complete Your Swap</h2>
          <p className='text-gray-500 text-sm'>
            Follow these steps to complete the swap safely
          </p>
        </div>
        <button className='text-gray-500' onClick={onFinish}>
          <Close className='w-5 h-5' />
        </button>
      </div>

      <div className='flex-1 flex items-center justify-center px-6 py-12'>
        {renderContent()}
      </div>

      <div className='px-6 pb-6 pt-4 text-center bg-gray-50'>
        <p className='text-sm text-gray-500 '>
          This swap is secured by a smart contract. Assets will be exchanged automatically once
          both deposits are complete.
        </p>
      </div>
    </div>
  )
}

export default CreateTx
