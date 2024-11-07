import { NFTImage } from '@/components/shared'
import { UserNFT } from '@/types/supabase'

const OverlayGrid: React.FC<{
  items: UserNFT[]
  selectedItemIds: Set<string>
  onSelect: (item: UserNFT) => void
  chainId: number
}> = ({ items, selectedItemIds, onSelect, chainId }) => (
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4'>
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
    <div
      onClick={() => !isDisabled && onSelect(item)}
      className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-4 ring-blue-500 shadow-lg' : 'hover:shadow-lg border border-gray-200'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className='relative aspect-square'>
        <NFTImage src={item.nfts.image} alt={item.nfts.name} fallback={item.nfts.name} />
        {isSelected && (
          <div className='absolute top-2 right-2 bg-blue-500 rounded-full p-1.5'>
            <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' />
            </svg>
          </div>
        )}
      </div>
      <div className='p-3'>
        <h3 className='text-sm font-medium text-gray-900 truncate'>{item.nfts.name}</h3>
        {/* You can add collection name here if available in your UserNFT type */}
        {item.nfts.collection_name && (
          <p className='text-xs text-gray-500 mt-1 truncate'>{item.nfts.collection_name}</p>
        )}
      </div>
    </div>
  )
}

export default OverlayGrid
