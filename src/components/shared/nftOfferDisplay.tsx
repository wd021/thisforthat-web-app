import React, { useState } from 'react'
import Link from 'next/link'

import { NFTImage } from '@/components/shared'
import { ChainLogo } from '@/icons'

interface NFT {
  id: string
  image: string
  name: string
}

const NFTItem: React.FC<{ nft: NFT; size: 'small' | 'medium' | 'large'; isOpen: boolean }> = ({
  nft,
  size,
  isOpen,
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  }

  return (
    <Link
      href={`/nft/${nft.id}`}
      target='_blank'
      className={`flex items-center ${isOpen ? 'space-x-2 p-1 w-full' : ''} rounded-md overflow-hidden transition-all duration-200 ${
        isOpen ? 'bg-white bg-opacity-50 hover:bg-opacity-75' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`${sizeClasses[size]} relative rounded-md overflow-hidden flex-shrink-0`}>
        <NFTImage
          src={nft.image}
          alt={nft.name}
          rounded='all'
          hoverOn={false}
          fallback={nft.name}
        />
      </div>
      {isOpen && (
        <span className='text-xs font-medium text-gray-800 truncate flex-grow'>{nft.name}</span>
      )}
    </Link>
  )
}

const OfferColumn: React.FC<{
  offers: NFT[]
  size: 'small' | 'medium' | 'large'
  isOpen: boolean
}> = ({ offers, size, isOpen }) => {
  return (
    <div className={`${isOpen ? 'w-[calc(50%-1rem)] space-y-1' : 'flex gap-x-2'}`}>
      {offers.map((nft) => (
        <NFTItem key={nft.id} nft={nft} size={size} isOpen={isOpen} />
      ))}
    </div>
  )
}

const SwapDivider: React.FC<{ size: 'small' | 'medium' | 'large'; isOpen: boolean }> = ({
  size,
  isOpen,
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  }

  return (
    <div
      className={`flex items-center justify-center ${isOpen ? 'px-2' : 'mx-2'} flex-shrink-0`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full bg-white bg-opacity-50 flex items-center justify-center`}
      >
        <svg
          className={`w-${size === 'small' ? '4' : '5'} h-${size === 'small' ? '4' : '5'} text-gray-600`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
          />
        </svg>
      </div>
    </div>
  )
}

const NFTOfferDisplay: React.FC<{
  userAOffers: NFT[]
  userBOffers: NFT[]
  size?: 'small' | 'medium' | 'large'
  defaultOpen?: boolean
  status?: 'completed' | 'cancelled' | 'accepted' | 'pending'
}> = ({
  userAOffers,
  userBOffers,
  size = 'small',
  defaultOpen = false,
  status = 'pending',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const containerPadding = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4',
  }

  const bgGradient = {
    completed: 'bg-gradient-to-r from-green-100 to-emerald-100',
    cancelled: 'bg-gradient-to-r from-rose-100 to-red-100',
    accepted: 'bg-gradient-to-r from-green-100 to-emerald-100',
    pending: 'bg-gradient-to-r from-amber-100 to-yellow-100',
  }

  return (
    <div
      className={`cursor-pointer w-full ${bgGradient[status]} ${containerPadding[size]} rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative ${!isOpen ? 'pr-10' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(!isOpen)
      }}
    >
      <div
        className={`absolute ${isOpen ? 'top-2 right-2' : 'top-1/2 -translate-y-1/2 right-2'} bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 transition-all duration-400 z-10`}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-4 w-4 text-gray-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          {isOpen ? (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          ) : (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          )}
        </svg>
      </div>
      <div
        className={`flex items-center w-full overflow-y-hidden overflow-x-auto hide-scrollbar ${isOpen ? 'justify-between' : ''}`}
      >
        <ChainLogo chainId={8453} className='shrink-0 w-4 h-4 mr-2.5' />
        <OfferColumn offers={userAOffers} size={size} isOpen={isOpen} />
        <SwapDivider size={size} isOpen={isOpen} />
        <OfferColumn offers={userBOffers} size={size} isOpen={isOpen} />
      </div>
    </div>
  )
}

export default NFTOfferDisplay
