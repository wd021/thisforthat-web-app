import { useEffect, useState } from 'react'

import { HomeDropdown, HomeTabBar } from '@/components/dropdowns'
import { NFTGrid, OfferFeed, TransactionFeed } from '@/components/home'
import { Offer, Transaction } from '@/components/modals'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { MainTabOption, OfferModalInfo, SubTabOption, TxModalInfo } from '@/types/main'
import { NFTGridItem, OfferData, TransactionData } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

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

const LoadingState: React.FC = () => (
  <div className='w-full flex flex-col items-center justify-center mt-[150px]'>
    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600'></div>
  </div>
)

const NoResultsState: React.FC<{ mainTab: MainTabOption; subTab: SubTabOption }> = ({
  mainTab,
  subTab,
}) => {
  const getMessage = () => {
    if (mainTab === 'nft') {
      switch (subTab) {
        case 'following':
          return {
            title: 'No NFTs from following',
            description: 'No NFTs from those you are following. Go follow some people!',
          }
        case 'pinned':
          return {
            title: 'No pinned NFTs',
            description: 'When you pin a NFT, it will show up here',
          }
        default:
          return {
            title: 'No NFTs found',
            description: 'Try checking back later',
          }
      }
    }

    if (mainTab === 'offer') {
      switch (subTab) {
        case 'my':
          return {
            title: 'No offers yet',
            description: 'Offers you make and receive will appear here',
          }
        case 'following':
          return {
            title: 'No offers from following',
            description: 'Offers activity of those you follow will show up here',
          }
        case 'favorites':
          return {
            title: 'No favorite offers',
            description: 'When you favorite an offer, it will show up here',
          }
        default:
          return {
            title: 'No offers available',
            description: 'Check back later for new updates',
          }
      }
    }

    // Transactions tab
    return {
      title: 'No transactions yet',
      description: 'When you agree on an offer, it will show up here to transact onchain',
    }
  }

  const message = getMessage()

  return (
    <div className='w-full flex flex-col items-center justify-center mt-[150px] px-16 text-center'>
      <div className='text-gray-400 text-6xl mb-4'>🔍</div>
      <h3 className='text-xl font-semibold text-gray-700 mb-2'>{message.title}</h3>
      <p className='text-gray-500'>{message.description}</p>
    </div>
  )
}

const Grid: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const { showToast } = useToast()

  const [items, setItems] = useState<(NFTGridItem | OfferData | TransactionData)[]>([])
  const [mainTab, setMainTab] = useState<MainTabOption>('nft')
  const [subTab, setSubTab] = useState<SubTabOption>('latest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const [offerModalInfo, setOfferModalInfo] = useState<OfferModalInfo | null>(null)
  const [txModalInfo, setTxModalInfo] = useState<TxModalInfo | null>(null)

  const fetchItems = async (mainTab: MainTabOption, subTab: SubTabOption, page: number) => {
    setIsLoading(true)

    // Only allow non-authenticated access to latest NFTs
    if (!(mainTab === 'nft' && subTab === 'latest') && !user) {
      setItems([])
      setPage(1)
      setHasMore(false)
      setIsLoading(false)
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

    // Build query based on main tab and subtab
    switch (mainTab) {
      case 'nft':
        switch (subTab) {
          case 'latest':
            query = supabase.rpc('get_home_feed', baseParams)
            break
          case 'following':
            query = supabase.rpc('get_following_feed', baseParams)
            break
          case 'pinned':
            query = supabase.rpc('get_pinned_feed', baseParams)
            break
          default:
            query = supabase.rpc('get_home_feed', baseParams)
        }
        break
      case 'offer':
        switch (subTab) {
          case 'my':
            query = supabase.rpc('get_user_offers', baseParams)
            break
          case 'following':
            query = supabase.rpc('get_following_offers', baseParams)
            break
          case 'favorites':
            query = supabase.rpc('get_favorited_offers', baseParams)
            break
          default:
            query = supabase.rpc('get_user_offers', baseParams)
        }
        break
      case 'transactions':
        query = supabase.rpc('get_user_transactions', baseParams)
        break
      default:
        query = supabase.rpc('get_home_feed', baseParams)
    }

    try {
      // Execute query
      const { data, error } = await query

      if (error) {
        throw error
      }

      // Update items based on page
      if (page === 1) {
        setItems(data || [])
      } else {
        setItems((prevItems) => {
          const isOffer = mainTab !== 'nft'
          const newItems = data.filter(
            (newItem: OfferData | NFTGridItem) =>
              !prevItems.some((prevItem: OfferData | TransactionData | NFTGridItem) =>
                isOffer
                  ? (prevItem as OfferData | TransactionData).offer_id ===
                    (newItem as OfferData | TransactionData).offer_id
                  : (prevItem as NFTGridItem).nft_id === (newItem as NFTGridItem).nft_id,
              ),
          )
          return [...prevItems, ...newItems]
        })
      }

      setHasMore(data?.length === GRID_ITEMS_PER_PAGE)
    } catch (error) {
      showToast(`⚠️ Error fetching items`, 2500)
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
      setIsFirstLoad(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(true)
      fetchItems(mainTab, subTab, 1)
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, subTab, authLoading])

  const newOffer = async (nft: NFTGridItem) => {
    if (!user || !profile) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.nft_user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    const modalInfo = {
      offerId: null,
      chainId: nft.nft_chain_id,
      users: {
        creator: {
          id: user.id,
          username: profile.username,
          profile_pic_url: profile.profile_pic_url,
          wallet: profile.wallet,
        },
        counterparty: {
          id: nft.nft_user_id,
          username: nft.nft_user_id_username,
          profile_pic_url: nft.nft_user_id_profile_pic_url,
          wallet: nft.nft_user_id_wallet,
        },
      },
      assets: {
        creator: [],
        counterparty: [
          {
            nft_id: nft.nft_id,
            name: nft.nft_name,
            image: nft.nft_image,
            collection_contract: nft.nft_collection_contract,
            token_id: nft.nft_token_id,
            token_type: nft.nft_token_type,
          },
        ],
      },
    }

    setOfferModalInfo(modalInfo)
  }

  const pinItem = async (nft: NFTGridItem) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase
      .from('user_pins')
      .upsert([{ user_id: user?.id, nft_id: nft.nft_id }], {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      })

    if (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
      return
    }
  }

  const handleTabChange = (newMainTab: MainTabOption, newSubTab?: SubTabOption) => {
    if (!(newMainTab === 'nft' && newSubTab === 'latest') && !user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    setIsFirstLoad(true)
    setPage(1)
    setHasMore(false)
    setItems([])
    setMainTab(newMainTab)
    if (newSubTab) {
      setSubTab(newSubTab)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(mainTab, subTab, nextPage)
  }

  const renderContent = () => {
    if (isFirstLoad || authLoading) {
      return <LoadingState />
    }

    if (!isLoading && items.length === 0) {
      return <NoResultsState mainTab={mainTab} subTab={subTab} />
    }

    return (
      <>
        {mainTab === 'offer' ? (
          <div className='px-4 max-w-[740px] mx-auto flex flex-col gap-y-4 my-6'>
            <OfferFeed
              items={items as OfferData[]}
              setOfferModalInfo={setOfferModalInfo}
              setTxModalInfo={setTxModalInfo}
              setItems={setItems}
            />
          </div>
        ) : mainTab === 'transactions' ? (
          <div className='px-4 max-w-[740px] mx-auto flex flex-col gap-y-4 my-6'>
            <TransactionFeed
              items={items as TransactionData[]}
              setTxModalInfo={setTxModalInfo}
            />
          </div>
        ) : (
          <NFTGrid items={items as NFTGridItem[]} newOffer={newOffer} pinItem={pinItem} />
        )}
        {items.length > 0 && hasMore && <LoadMoreButton onClick={handleLoadMore} />}
      </>
    )
  }

  console.log('txModalInfo', txModalInfo)

  return (
    <>
      <div className='w-full overflow-y-auto hide-scrollbar'>
        <HomeDropdown mainTab={mainTab} subTab={subTab} onNavigationChange={handleTabChange} />
        <div className='max-w-screen-xl mx-auto'>{renderContent()}</div>
        <HomeTabBar mainTab={mainTab} subTab={subTab} onNavigationChange={handleTabChange} />
      </div>
      {offerModalInfo && (
        <Offer {...offerModalInfo} closeModal={() => setOfferModalInfo(null)} />
      )}
      {txModalInfo && <Transaction {...txModalInfo} closeModal={() => setTxModalInfo(null)} />}
    </>
  )
}

export default Grid
