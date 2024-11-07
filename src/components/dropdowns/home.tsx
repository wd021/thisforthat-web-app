import React, { useEffect, useRef, useState } from 'react'

import { MainTabOption, SubTabOption } from '@/types/main'

type TabOption = {
  id: string
  label: string
  emoji: string
}

const nftSubOptions: TabOption[] = [
  { id: 'latest', label: 'Latest', emoji: '🕒' },
  { id: 'following', label: 'My Friends', emoji: '👥' },
  { id: 'pinned', label: 'Pinned', emoji: '📌' },
]

const offerSubOptions: TabOption[] = [
  { id: 'my', label: 'My Offers', emoji: '👤' },
  { id: 'following', label: 'My Friends', emoji: '👥' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
]

interface HomeDropdownProps {
  mainTab: MainTabOption
  subTab?: SubTabOption
  onNavigationChange: (mainTab: MainTabOption, subTab?: SubTabOption) => void
}

const HomeDropdown: React.FC<HomeDropdownProps> = ({ mainTab, subTab, onNavigationChange }) => {
  const [activeDropdown, setActiveDropdown] = useState<'nft' | 'offer' | null>(null)
  const [selectedNftOption, setSelectedNftOption] = useState<SubTabOption>(
    subTab && nftSubOptions.some((opt) => opt.id === subTab) ? subTab : 'latest',
  )
  const [selectedOfferOption, setSelectedOfferOption] = useState<SubTabOption>(
    subTab && offerSubOptions.some((opt) => opt.id === subTab) ? subTab : 'my',
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

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
    } else if (mainTab === 'offer') {
      setSelectedOfferOption(subTab)
      onNavigationChange('offer', subTab)
    }
    setActiveDropdown(null)
  }

  const handleMainClick = (type: MainTabOption) => {
    if (type === mainTab) {
      return
    }

    if (type === 'nft') {
      onNavigationChange('nft', selectedNftOption)
    } else if (type === 'offer') {
      onNavigationChange('offer', selectedOfferOption)
    } else {
      onNavigationChange(type)
    }
    setActiveDropdown(null)
  }

  const handleDropdownClick = (type: 'nft' | 'offer', e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === type ? null : type)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='hidden lg:flex justify-center w-full relative'>
      <div ref={dropdownRef} className='bg-gray-100 rounded-xl p-1 flex gap-1 mt-8 mb-2'>
        {/* NFTs Tab */}
        <div className='relative'>
          <div
            className={`
              flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
              ${mainTab === 'nft' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
            `}
          >
            <button
              className='flex items-center flex-grow'
              onClick={() => handleMainClick('nft')}
            >
              <span className='mr-2 text-lg'>🖼️</span>
              <div className='flex flex-col items-start'>
                <span className='font-medium'>NFTs</span>
                <span className='text-xs text-gray-500'>
                  {nftSubOptions.find((opt) => opt.id === selectedNftOption)?.label}
                </span>
              </div>
            </button>
            <button
              className='ml-2 p-1 rounded-full hover:bg-gray-100'
              onClick={(e) => handleDropdownClick('nft', e)}
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  activeDropdown === 'nft' ? 'rotate-180' : ''
                }`}
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
              </svg>
            </button>
          </div>

          {activeDropdown === 'nft' && (
            <div className='absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg py-1 min-w-[180px] z-10'>
              {nftSubOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleItemClick('nft', option.id as SubTabOption)}
                  className={`
                    flex items-center w-full px-4 py-2 text-sm transition-colors duration-150
                    ${
                      selectedNftOption === option.id
                        ? 'bg-gray-50 text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className='mr-2'>{option.emoji}</span>
                  <span className=''>{option.label}</span>
                  {selectedNftOption === option.id && (
                    <svg
                      className='ml-auto w-4 h-4 text-blue-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Offers Tab */}
        <div className='relative'>
          <div
            className={`
              flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
              ${mainTab === 'offer' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
            `}
          >
            <button
              className='flex items-center flex-grow'
              onClick={() => handleMainClick('offer')}
            >
              <span className='mr-2 text-lg'>🤝</span>
              <div className='flex flex-col items-start'>
                <span className='font-medium'>Offers</span>
                <span className='text-xs text-gray-500'>
                  {offerSubOptions.find((opt) => opt.id === selectedOfferOption)?.label}
                </span>
              </div>
            </button>
            <button
              className='ml-2 p-1 rounded-full hover:bg-gray-100'
              onClick={(e) => handleDropdownClick('offer', e)}
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  activeDropdown === 'offer' ? 'rotate-180' : ''
                }`}
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
              </svg>
            </button>
          </div>

          {activeDropdown === 'offer' && (
            <div className='absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg py-1 min-w-[180px] z-10'>
              {offerSubOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleItemClick('offer', option.id as SubTabOption)}
                  className={`
                    flex items-center w-full px-4 py-2 text-sm transition-colors duration-150
                    ${
                      selectedOfferOption === option.id
                        ? 'bg-gray-50 text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className='mr-2'>{option.emoji}</span>
                  <span className=''>{option.label}</span>
                  {selectedOfferOption === option.id && (
                    <svg
                      className='ml-auto w-4 h-4 text-blue-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transactions Tab */}
        <div
          className={`
            flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
            ${mainTab === 'transactions' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
          `}
        >
          <button className='flex items-center' onClick={() => handleMainClick('transactions')}>
            <span className='mr-2 text-lg'>⛓️</span>
            <div className='flex flex-col items-start'>
              <span className='font-medium'>Transactions</span>
              <span className='text-xs text-gray-500'>Onchain</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeDropdown
