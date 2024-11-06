import { useEffect, useState } from 'react'
import { decodeEventLog } from 'viem'
import { useAccount } from 'wagmi'

import { useCancelTrade } from '@/hooks'
import { Close } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { supabase } from '@/utils/supabaseClient'

interface WaitingTxProps {
  offerId: string
  tradeId: string // Changed to string since it likely comes from the database
  chainId: number
  onClose: () => void
  onFinish?: () => void
}

interface TradeError extends Error {
  code?: number
  message: string
}

const WaitingTx = ({ offerId, tradeId, chainId, onClose, onFinish }: WaitingTxProps) => {
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useAccount()

  const {
    cancelTrade,
    isCancelling,
    transactionStatus,
    hash,
    txReceipt,
    isConfirming,
    isConfirmed,
  } = useCancelTrade({
    chainId,
    tradeId, // Now accepts string
  })

  useEffect(() => {
    const updateOffer = async (hash: string) => {
      try {
        const { error } = await supabase
          .from('offers')
          .update({
            status: 'onchain_cancelled',
            onchain_tx: hash,
          })
          .match({ id: offerId })
          .select()

        if (error) {
          console.error('Error updating offer:', error)
          showToast('⚠️ Error updating offer status. Please try again.')
          return
        }

        showToast('✅ Trade cancelled successfully')
        onFinish?.()
        onClose()
      } catch (error) {
        console.error('Error updating offer:', error)
        showToast('⚠️ Error updating offer status. Please try again.')
      }
    }

    if (isConfirmed && hash) {
      updateOffer(hash)
    }
  }, [hash, isConfirmed, offerId, onClose, onFinish, showToast])

  const handleCancelTrade = async () => {
    if (!isConnected) {
      showToast('⚠️ Please connect your wallet to cancel the trade')
      return
    }

    try {
      setError(null)
      console.log('cancel trade')
      await cancelTrade()
    } catch (err) {
      let errorMessage = 'Something went wrong while cancelling the trade.'

      const tradeError = err as TradeError

      if (tradeError.code === 4001) {
        errorMessage = 'Please connect your wallet to continue.'
      } else if (tradeError.message?.includes('network')) {
        errorMessage = 'Please switch to the correct network and try again.'
      } else if (tradeError.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to cancel the contract.'
      }

      setError(errorMessage)
      showToast(`⚠️ ${errorMessage}`)
    }
  }

  const renderCancelButton = () => {
    if (isCancelling || isConfirming) {
      return (
        <button
          disabled
          className='w-full mt-4 p-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg flex items-center justify-center'
        >
          <div className='w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2' />
          {isConfirming ? 'Confirming Cancellation' : 'Cancelling Trade'}
        </button>
      )
    }

    return (
      <button
        onClick={handleCancelTrade}
        className='w-full mt-4 p-4 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
      >
        Cancel Trade
      </button>
    )
  }

  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl animate-fadeIn'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl text-gray-900 font-medium'>Waiting For Deposits</h2>
          <button className='text-gray-500' onClick={onClose}>
            <Close className='w-5 h-5' />
          </button>
        </div>
      </div>
      <div className='px-6 py-12 space-y-6'>
        <div className='flex flex-col items-center'>
          <div className='text-5xl'>🔒</div>
          <h3 className='text-xl font-medium text-gray-900 my-2'>Your NFTs Are Deposited</h3>
          <p className='text-gray-600 text-center max-w-md'>
            Once the counterparty has finished depositing, the trade will automatically execute.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingTx
