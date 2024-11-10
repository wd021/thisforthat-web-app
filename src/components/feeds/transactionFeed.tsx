import React, { useState } from 'react'

import TransactionCard from '@/components/transaction'
import { TxCancelModalInfo, TxModalInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

const TransactionFeed: React.FC<{
  items: TransactionData[]
  setTxModalInfo: (modalInfo: TxModalInfo) => void
  setTxCancelModalInfo: (modalInfo: TxCancelModalInfo) => void
}> = ({ items, setTxModalInfo, setTxCancelModalInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <div>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative p-4 border-l-4 border-blue-400 bg-blue-50 cursor-pointer select-none`}
        >
          <div className='flex items-center justify-between w-full px-1'>
            <div className='flex items-center gap-2'>
              {/* Alert Circle Icon */}
              <svg
                className='w-4 h-4 text-blue-500'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10' />
                <line x1='12' y1='8' x2='12' y2='12' />
                <line x1='12' y1='16' x2='12.01' y2='16' />
              </svg>
              <span className='text-blue-700 font-medium'>Onchain transactions</span>
            </div>
            <svg
              className={`
              w-6 h-6 text-blue-500 transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='6 9 12 15 18 9' />
            </svg>
          </div>
        </div>

        <div
          className={`
          overflow-hidden transition-all duration-200
          ${isExpanded ? 'max-h-96' : 'max-h-0'}
        `}
        >
          <div className='p-4 pt-0 space-y-3 text-sm text-blue-700 border-l-4 border-blue-400 bg-blue-50'>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-blue-200 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5'>
                {1}
              </div>
              <p>Double check NFTs before depositing.</p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-blue-200 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5'>
                {2}
              </div>
              <p>Trade executes automatically when all NFTs are deposited.</p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-blue-200 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5'>
                {3}
              </div>
              <p>If the trade gets cancelled, NFTs are returned to the original holder.</p>
            </div>
          </div>
        </div>
      </div>

      {items.map((item) => (
        <TransactionCard
          key={item.offer_id}
          transaction={item}
          setTxModalInfo={setTxModalInfo}
          setTxCancelModalInfo={setTxCancelModalInfo}
        />
      ))}
    </>
  )
}

export default TransactionFeed
