import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { useToast } from '@/providers/toastProvider'
import { ProfileMinimal, SimplifiedNFTAsset, UserNFT } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE, MAX_NFTS_PER_SWAP } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

import OverlayGrid from './overlayGrid'

const LoadMoreButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className='bg-gray-100 py-2 px-6 text-gray-600 hover:bg-gray-200 transition-colors duration-300 text-sm font-medium my-4 mx-auto rounded-full shadow-sm flex items-center'
    onClick={onClick}
  >
    <span>Load More</span>
  </motion.button>
)

const SelectNFT: FC<{
  chainId: number
  user: ProfileMinimal
  selectedNFTs: SimplifiedNFTAsset[]
  onSelect: (user: ProfileMinimal, nfts: SimplifiedNFTAsset[]) => void
  onClose: () => void
}> = ({ chainId, user, selectedNFTs, onSelect, onClose }) => {
  const { showToast } = useToast()
  const [availableNFTs, setAvailableNFTs] = useState<UserNFT[]>([])
  const [selectedItems, setSelectedItems] = useState(selectedNFTs)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [hasOtherChainNFTs, setHasOtherChainNFTs] = useState(false)

  useEffect(() => {
    fetchUserNFTs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, page])

  const fetchUserNFTs = async () => {
    const rangeStart = (page - 1) * GRID_ITEMS_PER_PAGE
    const rangeEnd = page * GRID_ITEMS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('user_nfts')
      .select('*, nfts!user_nfts_nft_id_fkey(*)')
      .eq('user_id', user?.id)
      .range(rangeStart, rangeEnd)

    if (error) {
      showToast(`⚠️ Error fetching NFTs`, 2500)
      console.error('Error fetching NFTs:', error)
    } else {
      setAvailableNFTs((prev) => [...prev, ...data])
      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
      setHasOtherChainNFTs(data.some((nft) => nft.nfts.chain_id !== chainId))
    }
  }

  const handleItemSelect = useCallback(
    (item: UserNFT) => {
      if (item.nfts.chain_id !== chainId) {
        showToast(`⚠️ For now, you can only select NFTs on the same chain`, 2500)
        return
      }

      const itemFormatted = {
        nft_id: item.nfts.id,
        name: item.nfts.name,
        image: item.nfts.image,
      }

      setSelectedItems((prevItems) => {
        const isSelected = prevItems.some(
          (selected) => selected.nft_id === itemFormatted.nft_id,
        )
        let updatedSelection
        if (isSelected) {
          updatedSelection = prevItems.filter(
            (selected) => selected.nft_id !== itemFormatted.nft_id,
          )
        } else {
          if (prevItems.length < MAX_NFTS_PER_SWAP) {
            updatedSelection = [...prevItems, itemFormatted]
          } else {
            showToast(`⚠️ You can select a maximum of ${MAX_NFTS_PER_SWAP} NFTs`, 2500)
            return prevItems
          }
        }
        onSelect(user, updatedSelection)
        return updatedSelection
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, onSelect, chainId],
  )

  const selectedItemIds = useMemo(
    () => new Set(selectedItems.map((item) => item.nft_id)),
    [selectedItems],
  )

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-white rounded-lg p-6 w-full h-full max-w-2xl flex flex-col'
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Select NFTs to Swap (Max {MAX_NFTS_PER_SWAP})
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors duration-200'
          >
            <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        {hasOtherChainNFTs && (
          <div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4'>
            <p className='font-bold'>Note:</p>
            <p>
              Currently you can only swap assets on the same chain. Cross-chain swaps are coming
              soon.
            </p>
          </div>
        )}

        <div className='overflow-y-auto overflow-x-hidden mb-4'>
          <OverlayGrid
            items={availableNFTs}
            selectedItemIds={selectedItemIds}
            onSelect={handleItemSelect}
            chainId={chainId}
          />
          {hasMore && <LoadMoreButton onClick={handleLoadMore} />}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='w-full mt-auto bg-yellow-400 text-gray-800 py-3 px-6 rounded-lg shadow-md cursor-pointer font-semibold text-lg transition-all duration-200 flex items-center justify-center'
          onClick={onClose}
        >
          <span className='text-xl font-semibold'>Done</span>
        </motion.button>
      </motion.div>
    </div>
  )
}

export default SelectNFT
