import React from 'react'
import Link from 'next/link'
import { useModal } from 'connectkit'
import { useAccount } from 'wagmi'

const STATUS_PENDING = ['open', 'created']

// Using the same icons as ActionButton
const Icons = {
  accept: (className: string) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
    </svg>
  ),
  decline: (className: string) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M6 18L18 6M6 6l12 12'
      />
    </svg>
  ),
  counter: (className: string) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
      />
    </svg>
  ),
}

const StatusMessage: React.FC<{
  status: string
  counterparty: string
  childOfferId: string | null
}> = ({ status, counterparty, childOfferId }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
      case 'onchain_cancelled':
      case 'onchain_completed':
        return {
          message: `accepted`,
          className: 'text-green-700 bg-green-100',
        }
      case 'rejected':
        return {
          message: `rejected`,
          className: 'text-red-700 bg-red-100',
        }
      case 'countered':
      case 'countered-open':
        return {
          message: (
            <Link
              href={`/offers/${childOfferId}`}
              target='_blank'
              onClick={(e) => {
                e.stopPropagation()

                if (!childOfferId) {
                  e.preventDefault()
                }
              }}
            >
              countered
            </Link>
          ),
          className: 'text-blue-700 bg-blue-100',
        }
      default:
        return {
          message: 'Status unknown',
          className: 'text-gray-700 bg-gray-100',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${config.className}`}>
      <span className='text-sm font-semibold'>{config.message}</span>
      {(status === 'countered' || status === 'countered-open') && (
        <svg
          className='text-blue-700'
          fill='none'
          height='14'
          width='14'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <line x1='7' x2='17' y1='17' y2='7' />
          <polyline points='7 7 17 7 17 17' />
        </svg>
      )}
    </div>
  )
}

const ActionButton: React.FC<{
  onClick: (e: React.MouseEvent) => void
  variant: 'accept' | 'decline' | 'counter'
  disabled?: boolean
}> = ({ onClick, variant, disabled }) => {
  const variants = {
    accept: 'bg-green-500 text-white hover:bg-green-600 border-transparent',
    decline: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
    counter: 'bg-blue-500 text-white hover:bg-blue-600 border-transparent',
  }

  const labels = {
    accept: 'Accept',
    decline: 'Reject',
    counter: 'Counter',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        flex items-center space-x-1.5 px-2.5 py-1
        rounded-full border text-sm font-semibold
        shadow-sm hover:shadow
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:shadow-sm
      `}
    >
      {Icons[variant]('w-4 h-4')}
      <span>{labels[variant]}</span>
    </button>
  )
}

const Footer: React.FC<{
  counterparty: string
  isCounterparty?: boolean
  childOfferId: string | null
  status: string
  onCounter: (e: React.MouseEvent) => void
  onAccept: (e: React.MouseEvent) => void
  onDecline: (e: React.MouseEvent) => void
}> = ({
  counterparty,
  isCounterparty,
  childOfferId,
  status,
  onCounter,
  onAccept,
  onDecline,
}) => {
  const isPending = STATUS_PENDING.includes(status)

  return (
    <div className='flex items-center justify-end mt-4'>
      {isPending ? (
        <>
          {isCounterparty ? (
            <>
              {status === 'open' ? (
                <div className='flex items-center space-x-3'>
                  <ActionButton variant='decline' onClick={onDecline} />
                  <ActionButton variant='counter' onClick={onCounter} />
                </div>
              ) : (
                <div className='flex items-center space-x-3'>
                  <ActionButton variant='decline' onClick={onDecline} />
                  <ActionButton variant='counter' onClick={onCounter} />
                  <ActionButton variant='accept' onClick={onAccept} />
                </div>
              )}
            </>
          ) : (
            <div className='flex items-center space-x-2 px-4 py-2 rounded-full text-gray-700 bg-gray-50'>
              <svg
                className='w-5 h-5 text-gray-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span className='text-sm font-medium'>Waiting for {counterparty} to decide</span>
            </div>
          )}
        </>
      ) : (
        <StatusMessage
          status={status}
          counterparty={counterparty}
          childOfferId={childOfferId}
        />
      )}
    </div>
  )
}

export default Footer
