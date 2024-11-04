import { ProfileMinimal, SimplifiedNFTAsset } from '@/types/supabase'

import OfferGrid from './offerGrid'

const UserSection: React.FC<{
  bg: string
  user: ProfileMinimal
  items: SimplifiedNFTAsset[]
  showSelectScreen: (user: ProfileMinimal) => void
  onRemoveItem: (itemId: string) => void
}> = ({ bg, user, items, showSelectScreen, onRemoveItem }) => (
  <div className={`p-6 relative ${bg} border-b border-gray-200`}>
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
          alt={user?.username}
          className='w-12 h-12 rounded-full border-2 border-white shadow-md object-cover'
        />
        <div className='ml-3'>
          <div className='text-lg font-semibold text-gray-900'>{user?.username}</div>
          <div className='text-sm text-gray-500'>{items.length} NFTs selected</div>
        </div>
      </div>
      <button
        className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm 
        hover:bg-blue-600 transition-colors duration-200 focus:outline-none 
        focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 font-medium'
        onClick={() => showSelectScreen(user)}
      >
        Add NFT
      </button>
    </div>
    <OfferGrid items={items} onRemoveItem={onRemoveItem} />
  </div>
)

export default UserSection
