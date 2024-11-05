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
    <ul className='flex flex-wrap justify-center items-center p-2'>
      {navItems.map((item) => (
        <li key={item.id} className='m-2'>
          <button
            onClick={() => handleItemClick(item.id)}
            className={`
              flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border borer-gray-200
              ${
                tabOption === item.id
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className='mr-2 text-lg'>{item.emoji}</span>
            <span className='font-medium'>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default UserDropdown
