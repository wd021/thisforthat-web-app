import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Etherscan, Opensea, Verified } from '@/icons'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'
import { getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'

interface NFTInfoPopupProps {
  id: string
  name: string
  isVerified: boolean
  chainId: string
  collectionName: string
  collectionContract: string
  tokenId: string
  className?: string
}

const VerifiedBadge: React.FC<NFTInfoPopupProps> = ({
  name,
  isVerified,
  chainId,
  collectionName,
  collectionContract,
  tokenId,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const togglePopup = () => setIsOpen(!isOpen)

  const options = [
    {
      label: 'View on OpenSea',
      logo: Opensea,
      getUrl: () => getOpenSeaUrl(chainId, collectionContract, tokenId),
    },
    {
      label: 'View on Explorer',
      logo: Etherscan,
      getUrl: () => getBlockExplorerUrl(chainId, collectionContract, tokenId),
    },
  ]

  return (
    <div className={`relative ${className}`}>
      <motion.button
        ref={buttonRef}
        type='button'
        onClick={(e) => {
          e.preventDefault()
          togglePopup()
        }}
        className='w-full h-full p-1 mb-0.5 rounded-full'
        aria-label='NFT Information'
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Verified chainId={Number(chainId)} isVerified={isVerified} className='w-full h-full' />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='fixed z-[100] w-64 rounded-xl shadow-lg bg-white ring-1 ring-black/5 overflow-hidden backdrop-blur-sm'
            style={{
              top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 0,
              left: buttonRef.current
                ? buttonRef.current.getBoundingClientRect().left - 200
                : 0,
            }}
          >
            <div className='p-4 space-y-1.5'>
              <div className='text-sm font-semibold text-gray-900 truncate'>{name}</div>
              {collectionName && <div className='text-sm text-gray-500'>{collectionName}</div>}
            </div>

            <div className='border-t border-gray-100'>
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(option.getUrl(), '_blank', 'noopener,noreferrer')
                    togglePopup()
                  }}
                  className='flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                >
                  <option.logo className='w-4 h-4 mr-3 text-gray-400' />
                  {option.label}
                </button>
              ))}
            </div>

            <div className='border-t border-gray-100 p-4 bg-gray-50'>
              <div className='flex items-center space-x-3'>
                <div className='flex-shrink-0'>
                  <Verified
                    chainId={Number(chainId)}
                    isVerified={isVerified}
                    className='w-5 h-5'
                  />
                </div>
                <span
                  className={`text-sm ${isVerified ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                >
                  {isVerified
                    ? `Verified on ${CHAIN_IDS_TO_CHAINS[String(chainId) as unknown as keyof typeof CHAIN_IDS_TO_CHAINS]}`
                    : `Not verified on ${CHAIN_IDS_TO_CHAINS[String(chainId) as unknown as keyof typeof CHAIN_IDS_TO_CHAINS]}`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VerifiedBadge
