import React from 'react'

import { UserTabOption } from '@/types/main'

interface UserNavItem {
  id: string
  label: string
  emoji: string
}

const navItems: UserNavItem[] = [
  { id: 'nfts', label: 'NFTS', emoji: '🖼️' },
  { id: 'pinned', label: 'Pins', emoji: '📌' },
  { id: 'offers', label: 'Offers', emoji: '🤝' },
]

const UserDropdown: React.FC<{
  tabOption: string
  onNavigationChange: (id: UserTabOption) => void
}> = ({ tabOption, onNavigationChange }) => {
  const handleItemClick = (id: string) => {
    onNavigationChange(id as UserTabOption)
  }

  return (
    <div className='flex justify-center w-full'>
      <div className='bg-gray-100 rounded-xl p-1 flex gap-1 my-4'>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
              ${tabOption === item.id ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}
            `}
          >
            <button className='flex items-center' onClick={() => handleItemClick(item.id)}>
              <span className='mr-2 text-lg'>{item.emoji}</span>
              <div className='flex flex-col items-start'>
                <span className='font-medium'>{item.label}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserDropdown
