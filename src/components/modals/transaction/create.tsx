import React, { useEffect, useState } from 'react'
import { useModal } from 'connectkit'
import { decodeEventLog } from 'viem'
import { useAccount } from 'wagmi'

import { WalletStatus } from '@/components/shared'
import { useCreateTrade } from '@/hooks'
import { Close } from '@/icons'
import { useToast } from '@/providers/toastProvider'
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
  onClose: () => void
  onFinish: (hash: string, tradeId: string) => void
}> = ({ offerId, chainId, users, assets, onClose, onFinish }) => {
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const { setOpen } = useModal()
  const { isConnected } = useAccount()

  const {
    createTradeContract,
    isCreatingContract,
    transactionStatus,
    hash,
    txReceipt,
    isConfirmed,
    isConfirming,
  } = useCreateTrade({
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

        if (error) {
          console.error('Error creating contract:', error)
          showToast('⚠️ Error creating contract. Please try again.')
          onClose()
          return
        }

        // If update returned no data (meaning it didn't update because values existed),
        // fetch the existing record
        if (!data?.length) {
          const { data: existingOffer } = await supabase
            .from('offers')
            .select('onchain_trade_id, onchain_tx')
            .match({ id: offerId })
            .single()

          onFinish(existingOffer?.onchain_tx, existingOffer?.onchain_trade_id)
        } else {
          onFinish(hash, tradeId.toString())
        }
      } catch (error) {
        console.error('Error creating contract:', error)
        showToast('⚠️ Error creating contract. Please try again.')
        onClose()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, isConfirmed, txReceipt, offerId])

  useEffect(() => {
    if (isConnected) {
      handleCreateTrade()
    } else {
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateTrade = async (): Promise<void> => {
    try {
      setError(null)

      if (!isConnected) {
        setOpen(true)
        return
      }

      await createTradeContract()
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
    if (isCreatingContract || isConfirming || transactionStatus === 'pending' || isConfirmed) {
      const loadingText =
        isConfirming || isConfirmed ? 'Confirming Transaction' : 'Creating Contract'
      const subText =
        isConfirming || isConfirmed
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
      <div className='flex flex-col'>
        <button
          onClick={createTradeContract}
          className={`rounded-full flex items-center justify-center text-lg px-8 py-4 bg-blue-500 text-white`}
        >
          Create Contract
        </button>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl shadow-lg flex flex-col overflow-hidden'>
      <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
        <div className='flex flex-col'>
          <h2 className='text-xl text-gray-900 font-medium mb-1'>Create Swap Contract</h2>
        </div>
        <button className='text-gray-500' onClick={onClose}>
          <Close className='w-5 h-5' />
        </button>
      </div>

      <div className='flex-1 flex items-center justify-center px-6 py-12'>
        {renderContent()}
      </div>

      <div className='p-4'>
        <WalletStatus />
      </div>
      {error && (
        <div className='p-4 pt-0'>
          <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
            <svg
              className='w-4 h-4 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateTx
