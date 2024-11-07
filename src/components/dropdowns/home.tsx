import React, { useEffect, useRef, useState } from 'react'

import { MainTabOption, SubTabOption } from '@/types/main'

// Define the base option type
type TabOption = {
  id: string
  label: string
  emoji: string
}

const nftSubOptions: TabOption[] = [
  { id: 'latest', label: 'Latest', emoji: '🕒' },
  { id: 'following', label: 'Following', emoji: '👥' },
  { id: 'pinned', label: 'Pinned', emoji: '📌' },
]

const offerSubOptions: TabOption[] = [
  { id: 'my', label: 'My Offers', emoji: '👤' },
  { id: 'following', label: 'Following', emoji: '👥' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
]

interface HomeDropdownProps {
  mainTab: MainTabOption
  subTab?: SubTabOption
  onNavigationChange: (mainTab: MainTabOption, subTab?: SubTabOption) => void
}

const HomeDropdown: React.FC<HomeDropdownProps> = ({ mainTab, subTab, onNavigationChange }) => {
  const [isNftDropdownOpen, setIsNftDropdownOpen] = useState(false)
  const [isOfferDropdownOpen, setIsOfferDropdownOpen] = useState(false)
  const [selectedNftOption, setSelectedNftOption] = useState<SubTabOption>(
    subTab && nftSubOptions.some((opt) => opt.id === subTab) ? subTab : 'latest',
  )
  const [selectedOfferOption, setSelectedOfferOption] = useState<SubTabOption>(
    subTab && offerSubOptions.some((opt) => opt.id === subTab) ? subTab : 'my',
  )

  const nftDropdownRef = useRef<HTMLUListElement>(null)
  const offerDropdownRef = useRef<HTMLUListElement>(null)
  const nftButtonRef = useRef<HTMLDivElement>(null)
  const offerButtonRef = useRef<HTMLDivElement>(null)

  const handleItemClick = (mainTab: MainTabOption, subTab: SubTabOption) => {
    if (
      (mainTab === 'nft' && selectedNftOption === subTab) ||
      (mainTab === 'offer' && selectedOfferOption === subTab)
    ) {
      return
    }

    if (mainTab === 'nft') {
      setSelectedNftOption(subTab)
      onNavigationChange('nft', subTab)
      setIsNftDropdownOpen(false)
      setIsOfferDropdownOpen(false)
    } else if (mainTab === 'offer') {
      setSelectedOfferOption(subTab)
      onNavigationChange('offer', subTab)
      setIsNftDropdownOpen(false)
      setIsOfferDropdownOpen(false)
    }
  }

  const handleMainClick = (type: MainTabOption) => {
    if (type === mainTab) {
      return
    }

    if (type === 'nft') {
      onNavigationChange('nft', selectedNftOption)
      setIsNftDropdownOpen(false)
      setIsOfferDropdownOpen(false)
    } else if (type === 'offer') {
      onNavigationChange('offer', selectedOfferOption)
      setIsNftDropdownOpen(false)
      setIsOfferDropdownOpen(false)
    } else {
      onNavigationChange(type)
      setIsNftDropdownOpen(false)
      setIsOfferDropdownOpen(false)
    }
  }

  const handleCaretClick = (type: 'nft' | 'offer', e: React.MouseEvent) => {
    e.stopPropagation()
    if (type === 'nft') {
      setIsNftDropdownOpen(!isNftDropdownOpen)
      setIsOfferDropdownOpen(false)
    } else {
      setIsOfferDropdownOpen(!isOfferDropdownOpen)
      setIsNftDropdownOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !nftDropdownRef.current?.contains(event.target as Node) &&
        !nftButtonRef.current?.contains(event.target as Node) &&
        !offerDropdownRef.current?.contains(event.target as Node) &&
        !offerButtonRef.current?.contains(event.target as Node)
      ) {
        setIsNftDropdownOpen(false)
        setIsOfferDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='hidden lg:flex justify-center w-full relative'>
      <ul className='flex flex-wrap justify-center items-center px-2 mt-4'>
        <li className='m-2 relative'>
          <div
            ref={nftButtonRef}
            className={`
              flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border border-gray-200
              ${
                mainTab === 'nft'
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <button
              className='flex items-center flex-grow'
              onClick={() => handleMainClick('nft')}
            >
              <span className='mr-2 text-lg'>🖼️</span>
              <div className='flex flex-col items-start'>
                <span className='leading-none'>NFTs</span>
                <span className='text-xs opacity-70'>
                  {nftSubOptions.find((opt) => opt.id === selectedNftOption)?.label}
                </span>
              </div>
            </button>
            <button
              className='ml-2 inline-flex items-center justify-center w-6 h-6'
              onClick={(e) => handleCaretClick('nft', e)}
            >
              <svg className='w-6 h-6 fill-current' viewBox='0 0 20 20'>
                <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
              </svg>
            </button>
          </div>
          {isNftDropdownOpen && (
            <ul
              ref={nftDropdownRef}
              className='absolute left-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-10'
            >
              {nftSubOptions.map((option) => (
                <li key={option.id}>
                  <button
                    onClick={() => handleItemClick('nft', option.id as SubTabOption)}
                    className={`
                      flex items-center w-full px-4 py-2 text-sm transition-colors duration-150
                      ${
                        selectedNftOption === option.id
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className='mr-2'>{option.emoji}</span>
                    <span>{option.label}</span>
                    {selectedNftOption === option.id && (
                      <span className='ml-auto text-blue-600'>✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className='m-2 relative'>
          <div
            ref={offerButtonRef}
            className={`
              flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border border-gray-200
              ${
                mainTab === 'offer'
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <button
              className='flex items-center flex-grow'
              onClick={() => handleMainClick('offer')}
            >
              <span className='mr-2 text-lg'>🤝</span>
              <div className='flex flex-col items-start'>
                <span className='leading-none'>Offers</span>
                <span className='text-xs opacity-70'>
                  {offerSubOptions.find((opt) => opt.id === selectedOfferOption)?.label}
                </span>
              </div>
            </button>
            <button
              className='ml-2 inline-flex items-center justify-center w-6 h-6'
              onClick={(e) => handleCaretClick('offer', e)}
            >
              <svg className='w-6 h-6 fill-current' viewBox='0 0 20 20'>
                <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
              </svg>
            </button>
          </div>
          {isOfferDropdownOpen && (
            <ul
              ref={offerDropdownRef}
              className='absolute left-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-10'
            >
              {offerSubOptions.map((option) => (
                <li key={option.id}>
                  <button
                    onClick={() => handleItemClick('offer', option.id as SubTabOption)}
                    className={`
                      flex items-center w-full px-4 py-2 text-sm transition-colors duration-150
                      ${
                        selectedOfferOption === option.id
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className='mr-2'>{option.emoji}</span>
                    <span>{option.label}</span>
                    {selectedOfferOption === option.id && (
                      <span className='ml-auto text-blue-600'>✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className='m-2'>
          <button
            onClick={() => handleMainClick('transactions')}
            className={`
              flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border border-gray-200
              ${
                mainTab === 'transactions'
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className='mr-2 text-lg'>⛓️</span>
            <div className='flex flex-col items-start'>
              <span className='leading-none'>Transactions</span>
              <span className='text-xs opacity-70'>Onchain</span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  )
}

export default HomeDropdown
