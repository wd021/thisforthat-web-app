import React, { useEffect, useRef, useState } from 'react'

import { GridTabOption } from '@/types/main'

interface GridNavItem {
  id: GridTabOption
  label: string
  emoji: string
}

const nftSubOptions: GridNavItem[] = [
  { id: 'home', label: 'Explore', emoji: '🖼️' },
  { id: 'followers', label: 'Following', emoji: '👥' },
  { id: 'pinned', label: 'My Pinned', emoji: '📌' },
]

const HomeDropdown: React.FC<{
  tabOption: GridTabOption
  onNavigationChange: (tabOption: GridTabOption) => void
}> = ({ tabOption, onNavigationChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedNftOption, setSelectedNftOption] = useState<GridTabOption>('home')
  const dropdownRef = useRef<HTMLUListElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentNftOption =
    nftSubOptions.find((option) => option.id === selectedNftOption) || nftSubOptions[0]

  const handleItemClick = (id: GridTabOption) => {
    if (id === tabOption) return // Prevent unnecessary navigation change

    if (id === 'home' || id === 'followers' || id === 'pinned') {
      setSelectedNftOption(id)
      onNavigationChange(id)
      setIsDropdownOpen(false)
    } else {
      onNavigationChange(id)
    }
  }

  const handleCaretClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='relative'>
      <ul className='flex flex-wrap justify-center items-center px-2 mt-4'>
        <li className='m-2'>
          <button
            ref={buttonRef}
            onClick={() => handleItemClick(selectedNftOption)}
            className={`
              flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border border-gray-200
              ${
                tabOption !== 'offers'
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className='mr-2 text-lg'>{currentNftOption.emoji}</span>
            <span className='font-medium'>{currentNftOption.label}</span>
            <span
              className='ml-2 cursor-pointer inline-flex items-center justify-center w-6 h-6'
              onClick={handleCaretClick}
            >
              <svg className='w-6 h-6 fill-current' viewBox='0 0 20 20'>
                <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
              </svg>
            </span>
          </button>
        </li>
        <li className='m-2'>
          <button
            onClick={() => handleItemClick('offers')}
            className={`
              flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border border-gray-200
              ${
                tabOption === 'offers'
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className='mr-2 text-lg'>🤝</span>
            <span className='font-medium'>My Offers</span>
          </button>
        </li>
      </ul>
      {isDropdownOpen && (
        <ul
          ref={dropdownRef}
          className='absolute left-1/2 transform -translate-x-1/2 mt-2 py-2 w-40 bg-white rounded-md shadow-xl z-10'
        >
          {nftSubOptions.map((option) => (
            <li key={option.id}>
              <button
                onClick={() => handleItemClick(option.id)}
                className={`
                  flex items-center w-full px-4 py-2 text-sm
                  ${selectedNftOption === option.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span className='mr-2'>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HomeDropdown
