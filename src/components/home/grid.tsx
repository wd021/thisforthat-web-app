import { useEffect, useState } from 'react'

import { HomeDropdown } from '@/components/dropdowns'
import { NFTFeedItem, NFTOfferItem } from '@/components/shared'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { GridTabOption } from '@/types/main'
import {
  NFTFeedItem as NFTFeedItemType,
  OfferFeedItem as OfferFeedItemType,
} from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

const OfferGrid: React.FC<{
  items: OfferFeedItemType[]
  userId: string
  viewOffer: (item: OfferFeedItemType) => void
}> = ({ items, userId, viewOffer }) => (
  <div className='p-3 md:p-6 grid grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-6 mb-12'>
    {items.map((item) => (
      <NFTOfferItem
        key={item.id}
        item={item}
        viewOffer={viewOffer}
        userId={userId}
        statusDetailed={true}
      />
    ))}
  </div>
)

const NFTGrid: React.FC<{
  items: NFTFeedItemType[]
  makeOffer: (item: NFTFeedItemType) => void
  pinItem: (item: NFTFeedItemType) => void
}> = ({ items, makeOffer, pinItem }) => (
  <div className='p-3 md:p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 mb-16'>
    {items.map((item) => (
      <NFTFeedItem key={item.nft_id} item={item} makeOffer={makeOffer} pinItem={pinItem} />
    ))}
  </div>
)

const LoadMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className='w-full flex items-center justify-center my-4'>
    <button
      onClick={onClick}
      className='px-10 py-3 text-lg rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-300'
    >
      Load More
    </button>
  </div>
)

const Grid: React.FC<{
  setMakeOfferItem: (item: NFTFeedItemType) => void
  setViewOfferItem: (item: OfferFeedItemType) => void
}> = ({ setMakeOfferItem, setViewOfferItem }) => {
  const { user, loading } = useAuth()
  const { showToast } = useToast()

  const [items, setItems] = useState<(NFTFeedItemType | OfferFeedItemType)[]>([])
  const [tabOption, setTabOption] = useState<GridTabOption>('home')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchItems = async (tabOption: GridTabOption, page: number) => {
    if (tabOption !== 'home' && !user) {
      setItems([])
      setPage(1)
      setHasMore(false)
      return
    }

    const rangeStart = (page - 1) * GRID_ITEMS_PER_PAGE
    const rangeEnd = page * GRID_ITEMS_PER_PAGE - 1

    let query
    const baseParams = {
      current_user_id: user?.id || null,
      range_start: rangeStart,
      range_end: rangeEnd,
    }

    // Build query based on tab option
    switch (tabOption) {
      case 'home':
        query = supabase.rpc('get_home_feed', baseParams)
        break
      case 'followers':
        query = supabase.rpc('get_following_feed', baseParams)
        break
      case 'pinned':
        query = supabase.rpc('get_pinned_feed', baseParams)
        break
      case 'offers':
        query = supabase
          .from('user_offers')
          .select(
            '*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)',
          )
          .or(`user_id.eq.${user?.id},user_id_counter.eq.${user?.id}`)
          .order('updated_at', { ascending: false })
          .range(rangeStart, rangeEnd)
        break
      default:
        query = supabase.rpc('get_home_feed', baseParams)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      showToast(`⚠️ Error fetching items`, 2500)
      console.error('Error fetching items:', error)
      return
    }

    // Update items based on page and tab option
    if (page === 1) {
      setItems(data)
    } else {
      setItems((prevItems) => {
        const isOffer = tabOption === 'offers'
        const newItems = data.filter(
          (newItem: OfferFeedItemType | NFTFeedItemType) =>
            !prevItems.some((prevItem: OfferFeedItemType | NFTFeedItemType) =>
              isOffer
                ? (prevItem as OfferFeedItemType).id === (newItem as OfferFeedItemType).id
                : (prevItem as NFTFeedItemType).nft_id === (newItem as NFTFeedItemType).nft_id,
            ),
        )
        return [...prevItems, ...newItems]
      })
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE)
  }

  useEffect(() => {
    if (tabOption && !loading) {
      fetchItems(tabOption, 1)
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabOption, loading])

  const makeOffer = async (nft: NFTFeedItemType) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.nft_user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    setMakeOfferItem(nft)
  }

  const viewOffer = async (offer: OfferFeedItemType) => {
    setViewOfferItem(offer)
  }

  const pinItem = async (nft: NFTFeedItemType) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase.from('user_pins').upsert(
      [
        {
          user_id: user?.id,
          nft_id: nft.nft_id,
        },
      ],
      {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      },
    )

    if (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
      return
    }
  }

  const handleTabChange = (newTabOption: GridTabOption) => {
    if (newTabOption !== 'home' && !user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    setItems([])
    setPage(1)
    setHasMore(false)
    setTabOption(newTabOption)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(tabOption, nextPage)
  }

  return (
    <div className='w-full overflow-y-auto hide-scrollbar'>
      {user && <HomeDropdown tabOption={tabOption} onNavigationChange={handleTabChange} />}
      {user && tabOption === 'offers' ? (
        <OfferGrid
          items={items as OfferFeedItemType[]}
          userId={user.id}
          viewOffer={viewOffer}
        />
      ) : (
        <NFTGrid items={items as NFTFeedItemType[]} makeOffer={makeOffer} pinItem={pinItem} />
      )}
      {items.length > 0 && hasMore && <LoadMoreButton onClick={handleLoadMore} />}
    </div>
  )
}

export default Grid
