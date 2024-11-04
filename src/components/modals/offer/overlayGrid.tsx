import { motion } from 'framer-motion'

import { NFTImage } from '@/components/shared'
import { ChainLogo } from '@/icons'
import { UserNFT } from '@/types/supabase'

const OverlayGrid: React.FC<{
  items: UserNFT[]
  selectedItemIds: Set<string>
  onSelect: (item: UserNFT) => void
  chainId: number
}> = ({ items, selectedItemIds, onSelect, chainId }) => (
  <div className='grid grid-cols-2 md:grid-cols-3 gap-4 p-4'>
    {items.map((item) => (
      <NFTItem
        key={item.id}
        item={item}
        isSelected={selectedItemIds.has(item.nfts.id)}
        onSelect={onSelect}
        chainId={chainId}
      />
    ))}
  </div>
)

const NFTItem: React.FC<{
  item: UserNFT
  isSelected: boolean
  onSelect: (item: UserNFT) => void
  chainId: number
}> = ({ item, isSelected, onSelect, chainId }) => {
  const isDisabled = item.nfts.chain_id !== chainId

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      className={`p-2 border-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-all duration-200 ${
        isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !isDisabled && onSelect(item)}
    >
      <div className='relative'>
        <NFTImage src={item.nfts.image} alt={item.nfts.name} fallback={item.nfts.name} />
        <div className='absolute top-2 right-2'>
          <ChainLogo chainId={item.nfts.chain_id} className='w-6 h-6' />
        </div>
      </div>
      <p className='text-sm mt-2 text-center font-semibold text-gray-800 truncate'>
        {item.nfts.name}
      </p>
    </motion.div>
  )
}

export default OverlayGrid
