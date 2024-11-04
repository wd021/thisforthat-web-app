import React, { useEffect, useRef, useState } from 'react'

import { ChevronUp } from '@/icons'
import { MainTabOption, SubTabOption } from '@/types/main'

const nftSubOptions = [
  { id: 'latest', label: 'Latest', emoji: '🕒' },
  { id: 'following', label: 'Following', emoji: '👥' },
  { id: 'pinned', label: 'Pinned', emoji: '📌' },
]

const offerSubOptions = [
  { id: 'my', label: 'My Offers', emoji: '👤' },
  { id: 'following', label: 'Following', emoji: '👥' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
]

interface MobileTabBarProps {
  mainTab: MainTabOption
  subTab?: SubTabOption
  onNavigationChange: (mainTab: MainTabOption, subTab?: SubTabOption) => void
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({ mainTab, subTab, onNavigationChange }) => {
  const [activePopup, setActivePopup] = useState<'nft' | 'offer' | null>(null)
  const [selectedNftOption, setSelectedNftOption] = useState<SubTabOption>(
    subTab && nftSubOptions.some((opt) => opt.id === subTab) ? subTab : 'latest',
  )
  const [selectedOfferOption, setSelectedOfferOption] = useState<SubTabOption>(
    subTab && offerSubOptions.some((opt) => opt.id === subTab) ? subTab : 'my',
  )

  const popupRef = useRef<HTMLDivElement>(null)

  const handleMainTabClick = (tab: MainTabOption) => {
    if (tab === mainTab) {
      return
    }

    if (tab === 'nft') {
      onNavigationChange('nft', selectedNftOption)
    } else if (tab === 'offer') {
      onNavigationChange('offer', selectedOfferOption)
    } else {
      onNavigationChange(tab)
    }
  }

  const handleCaretClick = (tab: 'nft' | 'offer', e: React.MouseEvent) => {
    e.stopPropagation()
    setActivePopup(activePopup === tab ? null : tab)
  }

  const handleOptionSelect = (mainTab: 'nft' | 'offer', optionId: SubTabOption) => {
    if (
      (mainTab === 'nft' && selectedNftOption === optionId) ||
      (mainTab === 'offer' && selectedOfferOption === optionId)
    ) {
      return
    }

    if (mainTab === 'nft') {
      setSelectedNftOption(optionId)
      onNavigationChange('nft', optionId)
    } else {
      setSelectedOfferOption(optionId)
      onNavigationChange('offer', optionId)
    }
    setActivePopup(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const TabContent = ({
    type,
    emoji,
    label,
    sublabel,
  }: {
    type: MainTabOption
    emoji: string
    label: string
    sublabel: string
  }) => (
    <div className='flex items-center'>
      <span className={`mr-2 text-xl ${mainTab === type ? 'text-gray-900' : 'text-gray-600'}`}>
        {emoji}
      </span>
      <div className='flex flex-col items-start'>
        <span
          className={`text-sm ${mainTab === type ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
        >
          {label}
        </span>
        <span className={`text-xs ${mainTab === type ? 'text-gray-900' : 'text-gray-600'}`}>
          {sublabel}
        </span>
      </div>
    </div>
  )

  return (
    <div className='relative w-full flex lg:hidden'>
      {activePopup && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={() => setActivePopup(null)}
        />
      )}

      {activePopup && (
        <div
          ref={popupRef}
          className='fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl z-50 overflow-hidden'
        >
          <div className='p-3 border-b border-gray-100'>
            <h3 className='text-lg font-semibold'>
              {activePopup === 'nft' ? 'NFT Options' : 'Offer Options'}
            </h3>
          </div>
          <div className='py-1'>
            {(activePopup === 'nft' ? nftSubOptions : offerSubOptions).map((option) => (
              <button
                key={option.id}
                className='w-full flex items-center px-4 py-3 hover:bg-gray-50'
                onClick={() => handleOptionSelect(activePopup, option.id as SubTabOption)}
              >
                <span className='text-xl mr-3'>{option.emoji}</span>
                <span className='flex-1 text-left'>{option.label}</span>
                {(activePopup === 'nft' ? selectedNftOption : selectedOfferOption) ===
                  option.id && <span className='text-blue-600'>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30'>
        <div className='flex items-stretch h-16'>
          <button
            className={`flex-1 flex items-center justify-center ${
              mainTab === 'nft' ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleMainTabClick('nft')}
          >
            <div className='flex items-center'>
              <TabContent
                type='nft'
                emoji='🖼️'
                label='NFTs'
                sublabel={
                  nftSubOptions.find((opt) => opt.id === selectedNftOption)?.label || ''
                }
              />
              <ChevronUp
                className={`w-4 h-4 sm:w-6 sm:h-6 sm:ml-4 ml-2.5 transform transition-transform duration-200 ${
                  activePopup === 'nft' ? 'rotate-180' : ''
                } ${mainTab === 'nft' ? 'text-gray-900' : 'text-gray-400'}`}
                onClick={(e) => handleCaretClick('nft', e)}
              />
            </div>
          </button>

          <button
            className={`flex-1 flex items-center justify-center ${
              mainTab === 'offer' ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleMainTabClick('offer')}
          >
            <div className='flex items-center'>
              <TabContent
                type='offer'
                emoji='🤝'
                label='Offers'
                sublabel={
                  offerSubOptions.find((opt) => opt.id === selectedOfferOption)?.label || ''
                }
              />
              <ChevronUp
                className={`w-4 h-4 sm:w-6 sm:h-6 sm:ml-4 ml-2.5 transform transition-transform duration-200 ${
                  activePopup === 'offer' ? 'rotate-180' : ''
                } ${mainTab === 'offer' ? 'text-gray-900' : 'text-gray-400'}`}
                onClick={(e) => handleCaretClick('offer', e)}
              />
            </div>
          </button>

          <button
            className={`flex-1 flex items-center justify-center ${
              mainTab === 'transactions' ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleMainTabClick('transactions')}
          >
            <TabContent
              type='transactions'
              emoji='⛓️'
              label='Transactions'
              sublabel='Onchain'
            />
          </button>
        </div>
      </div>

      <div className='h-16' />
    </div>
  )
}

export default MobileTabBar
