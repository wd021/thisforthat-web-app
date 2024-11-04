import React from 'react'
import { animated, useSpring } from 'react-spring'
import { WriteContractResult } from 'wagmi'

interface TransactionFeedbackProps {
  status: WriteContractResult['status']
  error: Error | null
  onRequestClose: () => void
  onReset: () => void
}

const TransactionFeedback: React.FC<TransactionFeedbackProps> = ({
  status,
  error,
  onRequestClose,
  onReset,
}) => {
  const fadeIn = useSpring({
    opacity: status !== 'idle' ? 1 : 0,
    config: { duration: 200 },
  })

  if (status === 'idle') return null

  return (
    <animated.div
      style={fadeIn}
      className='absolute inset-0 bg-white flex flex-col items-center justify-center z-50 p-6 rounded-[15px]'
    >
      {status === 'pending' && (
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6'></div>
          <h2 className='text-2xl font-bold mb-4'>Initiating Trade</h2>
          <p className='text-lg'>
            Creating the on-chain trade for your NFT swap. This may take a moment.
          </p>
        </div>
      )}
      {status === 'success' && (
        <div className='text-center'>
          <div className='text-7xl mb-6'>📝🔗</div>
          <h2 className='text-3xl font-bold mb-4'>Trade Created!</h2>
          <p className='text-xl mb-2'>
            The on-chain trade for your NFT swap has been initiated.
          </p>
          <p className='text-lg mb-8'>You're one step closer to completing your swap!</p>
          <button
            onClick={onRequestClose}
            className='px-6 py-3 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition-colors duration-200'
          >
            View Trade Details
          </button>
        </div>
      )}
      {status === 'error' && (
        <div className='text-center max-w-md w-full'>
          <div className='text-7xl mb-6'>❌</div>
          <h2 className='text-3xl font-bold mb-4'>Trade Initiation Failed</h2>
          <div className='mb-8 max-h-40 overflow-y-auto bg-gray-100 rounded-lg p-4'>
            <p className='text-lg'>
              {error?.message ||
                "We couldn't create the on-chain trade for your NFT swap. Want to try again?"}
            </p>
          </div>
          <button
            onClick={onReset}
            className='px-6 py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-colors duration-200'
          >
            Retry Trade Creation
          </button>
        </div>
      )}
    </animated.div>
  )
}

export default TransactionFeedback
