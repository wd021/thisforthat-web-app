import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { LoadMore } from '@/components/shared/buttons'
import { ChainLogo, Close } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { ProfileMinimal, SimplifiedNFTAsset, UserNFT } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS, GRID_ITEMS_PER_PAGE, MAX_NFTS_PER_SWAP } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

import OverlayGrid from './overlayGrid'

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

  useEffect(() => {
    fetchUserNFTs(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const fetchUserNFTs = async (page: number) => {
    const rangeStart = (page - 1) * GRID_ITEMS_PER_PAGE
    const rangeEnd = page * GRID_ITEMS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('user_nfts')
      .select('*, nfts!user_nfts_nft_id_fkey(*)')
      .eq('user_id', user.id)
      .eq('nfts.chain_id', chainId)
      .not('nfts', 'is', null)
      .range(rangeStart, rangeEnd)

    if (error) {
      showToast(`⚠️ Error fetching NFTs`, 2500)
      console.error('Error fetching NFTs:', error)
    } else {
      setAvailableNFTs((prev) => [...prev, ...data])
      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    }
  }

  const handleItemSelect = useCallback(
    (item: UserNFT) => {
      if (item.nfts.chain_id !== chainId) {
        showToast(`⚠️ For now, you can only select NFTs on the same chain`, 2500)
        return
      }

      const itemFormatted: SimplifiedNFTAsset = {
        nft_id: item.nfts.id,
        name: item.nfts.name,
        image: item.nfts.image,
        collection_contract: item.nfts.collection_contract,
        token_id: item.nfts.token_id,
        token_type: item.nfts.token_type,
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
    const nextPage = page + 1
    setPage(nextPage)
    fetchUserNFTs(nextPage)
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-white lg:rounded-lg p-4 w-full h-full max-w-2xl flex flex-col'
      >
        <div className='flex items-center justify-between mb-2'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>
              Select NFTs to Swap (Max {MAX_NFTS_PER_SWAP})
            </h2>
            <div className='flex items-center'>
              <ChainLogo chainId={chainId} className='w-4 h-4 mr-1.5' />
              <span className='text-sm font-medium text-gray-700'>
                {CHAIN_IDS_TO_CHAINS[chainId as keyof typeof CHAIN_IDS_TO_CHAINS]}
              </span>
            </div>
          </div>
          <button onClick={onClose}>
            <Close className='w-6 h-6' />
          </button>
        </div>
        <div className='flex flex-col items-center overflow-y-auto custom-scrollbar overflow-x-hidden mb-4'>
          <OverlayGrid
            items={availableNFTs}
            selectedItemIds={selectedItemIds}
            onSelect={handleItemSelect}
            chainId={chainId}
          />
          {hasMore && (
            <LoadMore
              className='!bg-gray-100 my-4 hover:bg-gray-200'
              onClick={handleLoadMore}
              isLoading={false}
            />
          )}
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
