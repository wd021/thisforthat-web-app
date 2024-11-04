import { NFTGridObject } from '@/components/shared'
import { NFTGridItem } from '@/types/supabase'

const NFTGrid: React.FC<{
  items: NFTGridItem[]
  newOffer: (item: NFTGridItem) => void
  pinItem: (item: NFTGridItem) => void
}> = ({ items, newOffer, pinItem }) => (
  <div className='p-4 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:px-12 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-24'>
    {items.map((item) => (
      <NFTGridObject key={item.nft_id} item={item} newOffer={newOffer} pinItem={pinItem} />
    ))}
  </div>
)

export default NFTGrid
