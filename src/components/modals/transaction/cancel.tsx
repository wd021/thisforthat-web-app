import React, { useEffect } from 'react'
import { useModal } from 'connectkit'
import { useAccount } from 'wagmi'

import { WalletStatus } from '@/components/shared'
import { useCancelTrade } from '@/hooks'
import { Close } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { supabase } from '@/utils/supabaseClient'

const CancelTx = ({ offerId, transaction, onClose, onFinish }) => {
  const { showToast } = useToast()
  const { setOpen } = useModal()
  const { isConnected } = useAccount()

  const {
    cancelTrade,
    isLoading,
    isConfirmed,
    error: tradeError,
    isError,
    reset,
  } = useCancelTrade({
    tradeId: transaction.onchain_trade_id!,
  })

  useEffect(() => {
    if (isConnected) {
      handleCancelTrade()
    } else {
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    const updateOffer = async () => {
      try {
        const { error } = await supabase
          .from('offers')
          .update({
            status: 'cancelled',
          })
          .match({ id: offerId })

        if (error) {
          console.error('Error updating offer status:', error)
          showToast('⚠️ Error updating offer status. Please try again.')
          onClose()
          return
        }

        onFinish()
      } catch (error) {
        console.error('Error updating offer status:', error)
        showToast('⚠️ Error updating offer status. Please try again.')
        onClose()
      }
    }

    if (isConfirmed) {
      updateOffer()
    }
  }, [isConfirmed, offerId, onClose, onFinish, showToast])

  const handleCancelTrade = async () => {
    try {
      if (!isConnected) {
        setOpen(true)
        return
      }

      await cancelTrade()
    } catch (error) {
      console.error('Error canceling trade:', error)
      reset()
    }
  }

  const renderContent = () => {
    if (isLoading || isConfirmed) {
      const loadingText = isConfirmed ? 'Confirming Cancellation' : 'Canceling Trade'
      const subText = isConfirmed
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
          onClick={handleCancelTrade}
          className='rounded-full flex items-center justify-center text-lg px-8 py-4 bg-red-500 text-white hover:bg-red-600'
        >
          Cancel Trade
        </button>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl shadow-lg flex flex-col overflow-hidden'>
      <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
        <div className='flex flex-col'>
          <h2 className='text-xl text-gray-900 font-medium mb-1'>Cancel Trade</h2>
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

      {isError && (
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
            <span>{tradeError?.message || 'An error occurred while canceling the trade.'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CancelTx
