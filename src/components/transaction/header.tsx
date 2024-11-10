import React from 'react'
import Link from 'next/link'

import { ChainLogo, Expand } from '@/icons'
import { TransactionData } from '@/types/supabase'

const Icons = {
  ChevronRight: () => (
    <svg
      className='w-4 h-4 text-gray-600'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
    </svg>
  ),
  ChevronDown: () => (
    <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
    </svg>
  ),
  ChevronUp: () => (
    <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
    </svg>
  ),
}

const UserInfo: React.FC<{ username: string; profilePic: string }> = ({
  username,
  profilePic,
}) => (
  <Link href={`/${username}`} target='_blank' className='flex items-center gap-1.5 group'>
    <div className='h-5 w-5 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-gray-100'>
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profilePic}
        alt={username}
        className='w-full h-full object-cover'
      />
    </div>
    <span className='text-sm font-semibold'>{username}</span>
  </Link>
)

const Header: React.FC<{
  fullPage: boolean
  transaction: TransactionData
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}> = ({ fullPage, transaction, isExpanded, setIsExpanded }) => {
  return (
    <div className='flex items-center justify-between pl-2 py-0'>
      <div className='flex items-center gap-x-2'>
        <ChainLogo chainId={transaction.chain_id} className='w-6 h-6' />
        <div className='flex items-center space-x-2 bg-yellow-100 rounded-full py-2 px-3'>
          <div className='flex items-center gap-x-1'>
            <UserInfo
              username={transaction.creator_username}
              profilePic={transaction.creator_profile_pic_url}
            />
            <Icons.ChevronRight />
            <UserInfo
              username={transaction.counterparty_username}
              profilePic={transaction.counterparty_profile_pic_url}
            />
          </div>
        </div>
      </div>

      <div className='flex items-center'>
        {!fullPage && (
          <>
            <Link
              href={`/transactions/${transaction.offer_id}`}
              target='_blank'
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-full'
              onClick={(e) => e.stopPropagation()}
            >
              <Expand className='w-6 h-6' />
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-full'
            >
              {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Header
