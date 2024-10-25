'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { NFTOfferDisplay } from '@/components/shared'
import { Chain } from '@/icons'
// import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

interface TransactionProps {
  transaction: {
    id: string
    user_id: string
    status: 'in_progress' | 'completed'
    chain_id: string
    created_at: string
    offer: {
      user: any[]
      userCounter: any[]
    }
    user: {
      username: string
      profile_pic_url: string
    }
    counter_user: {
      username: string
      profile_pic_url: string
    }
    progress: {
      user: { deposited: number; total: number }
      counter_user: { deposited: number; total: number }
    }
  }
  userId: string
  selectOffer: (id: string) => void
  newCount: number
  onOpen: () => void
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

const ProgressBar: React.FC<{ progress: number; status: string }> = ({ progress, status }) => {
  const getBarColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className='w-full bg-gray-200 rounded-full h-2'>
      <div
        className={`${getBarColor(status)} h-2 rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}

const FeedItem: React.FC<TransactionProps> = ({ transaction, selectOffer }) => {
  const totalDeposited = 5
  const totalRequired = 14
  const overallProgress = (totalDeposited / totalRequired) * 100

  return (
    <div
      className='p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0'
      onClick={() => selectOffer(transaction.id)}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='text-sm font-medium'>Ethereum</div>
        <StatusBadge status={transaction.status} />
      </div>

      <ProgressBar progress={overallProgress} status={transaction.status} />

      <div className='mt-4'>
        <NFTOfferDisplay
          userAOffers={transaction.offer.user}
          userBOffers={transaction.offer.userCounter}
          size='small'
          status='completed'
        />
      </div>
    </div>
  )
}

const TransactionsDropdown: React.FC<TransactionsProps> = ({
  transactions,
  userId,
  selectOffer,
  newCount,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    if (!isOpen && newCount > 0) {
      onOpen()
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className='h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
      >
        <Chain className='w-[40px] h-[40px]' />
        {newCount > 0 && (
          <span className='z-10 absolute top-[4px] right-[4px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full'>
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10'>
          <div className='flex flex-col h-[480px]'>
            {' '}
            {/* Fixed height for the dropdown */}
            {/* Header */}
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold'>Transactions</h3>
            </div>
            {/* Scrollable content */}
            <div className='flex-grow overflow-y-auto hide-scrollbar'>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <FeedItem
                    key={transaction.id}
                    transaction={transaction}
                    userId={userId}
                    selectOffer={selectOffer}
                  />
                ))
              ) : (
                <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                  <Chain className='w-12 h-12' />
                  <h3 className='text-lg font-semibold my-2'>No Swaps</h3>
                  <p className='text-sm text-gray-500 px-6'>
                    This is where you&apos;ll see all your onchain activity. When you agree to a
                    swap, it will show up here.
                  </p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className='p-4 border-t border-gray-200'>
              <Link
                href='/transactions'
                className='text-blue-500 hover:underline text-sm font-medium'
              >
                Show All Transactions
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsDropdown
