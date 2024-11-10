import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { useModal } from 'connectkit'
import { useAccount } from 'wagmi'

import { ErrorBubble, LoadingIndicator, WalletStatus } from '@/components/shared'
import { useCancelTrade, useIsMobile } from '@/hooks'
import { Checkmark, Close } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { ProfileMinimal } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

const CancelTx = ({
  transactionInfo,
  closeModal,
  onCancelTrade,
}: {
  transactionInfo: {
    status: string
    offerId: string
    onchain: {
      id: string
      hash: string
      done: boolean
    }
    chainId: number
    users: {
      creator: ProfileMinimal
      counterparty: ProfileMinimal
    }
  }
  closeModal: () => void
  onCancelTrade: (offerId: string) => void
}) => {
  const { showToast } = useToast()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  const [error, setError] = useState<string | null>(null)
  const { setOpen } = useModal()
  const { isConnected } = useAccount()

  const [cancelComplete, setCancelComplete] = useState(false)

  const {
    cancelTrade,
    isLoading,
    isConfirmed,
    error: cancelError,
    isError,
  } = useCancelTrade({
    tradeId: transactionInfo.onchain.id,
  })

  useEffect(() => {
    if (isConnected) {
      handleCancelTrade()
    } else {
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const updateOffer = async () => {
      try {
        const { error } = await supabase
          .from('offers')
          .update({
            status: 'onchain_cancelled',
            onchain_done: true,
          })
          .match({ id: transactionInfo.offerId })

        if (error) {
          console.error('Error updating offer status:', error)
          showToast('⚠️ Error updating offer status. Please try again.')
        } else {
          onCancelTrade(transactionInfo.offerId)
          setCancelComplete(true)
        }
      } catch (error) {
        console.error('Error updating offer status:', error)
        showToast('⚠️ Error updating offer status. Please try again.')
      }
    }

    if (isConfirmed) {
      updateOffer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, transactionInfo])

  const handleCancelTrade = async () => {
    try {
      if (!isConnected) {
        setOpen(true)
        return
      }

      await cancelTrade()
    } catch (error) {
      let errorMessage = 'Something went wrong while cancelling trade.'

      const tradeError = error as { code?: number; message: string }

      if (tradeError.message?.includes('User rejected the request')) {
        errorMessage = 'Transaction cancelled.'
      } else if (tradeError.message?.includes('network')) {
        errorMessage = 'Please switch to the correct network and try again.'
      } else if (tradeError.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to create the contract.'
      } else if (tradeError.message?.includes('NotParticipant')) {
        errorMessage = 'Only participant wallet can cancel trade.'
      } else if (tradeError.code === 4001) {
        errorMessage = 'Please connect your wallet to continue.'
      }

      console.error('Error creating contract:', error)
      setError(errorMessage)
    }
  }

  const renderContent = () => {
    if (isLoading || isConfirmed) {
      const loadingText = isConfirmed ? 'Confirming Cancellation' : 'Cancelling Trade'
      const subText = isConfirmed
        ? 'Please wait while your transaction is being confirmed'
        : 'Please confirm the transaction in your wallet'

      return (
        <div className='flex flex-col items-center space-y-3'>
          <LoadingIndicator className='border-red-500' />
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
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <div className='bg-white lg:rounded-2xl shadow-lg flex flex-col overflow-hidden h-full'>
        <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
          <div className='flex flex-col'>
            <h2 className='text-xl text-gray-900 font-medium mb-1'>Cancel Trade</h2>
          </div>
          <button className='text-gray-500' onClick={closeModal}>
            <Close className='w-5 h-5' />
          </button>
        </div>
        {cancelComplete ? (
          <>
            <div className='p-4'>
              <div className='bg-white rounded-lg overflow-hidden mb-6'>
                <div className='p-4 flex flex-col items-center'>
                  <div className='mb-6 bg-green-100 rounded-full p-3'>
                    <Checkmark className='w-10 h-10 text-green-500' />
                  </div>
                  <div className='text-center'>
                    Swap cancelled. NFTs have been returned to the original owner&apos;s wallet.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='flex-1 flex items-center justify-center px-6 py-12'>
              {renderContent()}
            </div>

            <div className='p-4'>
              <WalletStatus />
            </div>

            {(isError || error) && (
              <div className='p-4 pt-0'>
                <ErrorBubble
                  errorMsg={error ? error : cancelError ? cancelError?.message : ''}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default CancelTx
