import { AnimatePresence, motion } from 'framer-motion'

import { NFTImage } from '@/components/shared'
import { SimplifiedNFTAsset } from '@/types/supabase'

const OfferGrid: React.FC<{
  items: SimplifiedNFTAsset[]
  onRemoveItem: (itemId: string) => void
}> = ({ items, onRemoveItem }) => (
  <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-4'>
    <AnimatePresence>
      {items.map((item) => (
        <NFTItem key={item.nft_id} item={item} onRemove={onRemoveItem} />
      ))}
    </AnimatePresence>
  </div>
)

const NFTItem: React.FC<{
  item: SimplifiedNFTAsset
  onRemove: (itemId: string) => void
}> = ({ item, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className='relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md 
    transition-all duration-200 cursor-pointer group'
  >
    <NFTImage src={item.image} alt={item.name} fallback={item.name} />
    <div
      className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 
      group-hover:opacity-100 transition-opacity duration-200'
      onClick={() => onRemove(item.nft_id)}
    >
      <span className='text-white font-medium'>Remove</span>
    </div>
  </motion.div>
)

export default OfferGrid
