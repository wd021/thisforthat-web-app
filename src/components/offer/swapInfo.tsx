import type { FC } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import { NFTImage } from '@/components/shared'
import { Heart, SwapArrows } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import type { NFTAsset, OfferData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

interface LikeButtonProps {
  isLiked: boolean
  likesCount: number
  onLike: () => void
  className?: string
}

const LikeButton: FC<LikeButtonProps> = ({
  isLiked,
  likesCount = 0,
  onLike,
  className = '',
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation()
      onLike()
    }}
    className={`ml-3 inline-flex  items-center space-x-1 p-1  hover:bg-gray-100  rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 ${className}`}
  >
    <Heart className='h-4 w-4' fill={isLiked ? 'currentColor' : 'none'} />
    {likesCount > 0 && <span className='text-xs font-medium'>{likesCount}</span>}
  </button>
)

interface OfferSideProps {
  assets: NFTAsset[]
  username: string
  profilePic: string
  isExpanded: boolean
  userLikes: Record<string, boolean>
  optimisticCounts: Record<string, number>
  onLike: (nftId: string, currentLikeState: boolean) => void
}

const OfferSide: FC<OfferSideProps> = ({
  assets,
  username,
  profilePic,
  isExpanded,
  userLikes,
  optimisticCounts,
  onLike,
}) => (
  <div className='p-3 rounded-lg bg-gray-50 space-y-2 w-full'>
    <div className='flex items-center gap-2 mb-2'>
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profilePic}
        alt={username}
        className='w-6 h-6 rounded-full ml-2 object-cover'
      />
      <div className='flex items-center justify-between w-full'>
        <span className='text-sm font-medium'>{username}</span>
      </div>
    </div>
    <div className='space-y-2'>
      {assets?.map((asset) => (
        <div
          key={asset.nft_id}
          className={`flex items-center justify-between group transition-transform duration-200 ${isExpanded ? 'w-full bg-white rounded-lg p-2' : ''}`}
        >
          <Link
            href={`/nfts/${asset.nft_id}`}
            target='_blank'
            className='flex items-center space-x-2 flex-1'
          >
            <div className={`relative flex ${isExpanded ? 'h-12 w-12' : 'h-10 w-10'}`}>
              <NFTImage
                src={asset.image}
                alt={asset.name}
                fallback={asset.name}
                rounded='all'
              />
            </div>
            {isExpanded && (
              <div className='flex min-w-0 flex-col gap-y-0.5'>
                <span className='truncate text-sm font-medium text-gray-900'>{asset.name}</span>
                <span className='text-xs text-gray-500'>{asset.collection_name}</span>
              </div>
            )}
          </Link>
          {isExpanded && (
            <LikeButton
              isLiked={!!userLikes[asset.offer_nft_id]}
              likesCount={optimisticCounts[asset.offer_nft_id] ?? asset.like_count ?? 0}
              onLike={() => onLike(asset.offer_nft_id, !!userLikes[asset.offer_nft_id])}
            />
          )}
        </div>
      ))}
    </div>
  </div>
)

interface TradeOfferProps {
  offer: OfferData
  isOpenOffer: boolean
  isExpanded: boolean
  userLikes: Record<string, boolean>
  optimisticCounts: Record<string, number>
  onLike: (nftId: string, currentLikeState: boolean) => void
}

const TradeOffer: FC<TradeOfferProps> = ({
  offer,
  isOpenOffer,
  isExpanded,
  userLikes,
  optimisticCounts,
  onLike,
}) => {
  if (isOpenOffer) {
    const openAsset = offer.counterparty_assets[0]

    return (
      <div
        className='mb-2 flex justify-between p-3 w-full rounded-lg bg-gray-50'
        onClick={(e) => {
          if (isExpanded) {
            e.stopPropagation()
          }
        }}
      >
        <Link
          href={`/nfts/${openAsset.nft_id}`}
          target='_blank'
          className='flex items-center space-x-2.5 transition-colors hover:bg-gray-50'
          onClick={(e) => {
            if (!isExpanded) {
              e.preventDefault()
            }
          }}
        >
          <div className={`relative flex ${isExpanded ? 'h-14 w-14' : 'h-12 w-12'}`}>
            <NFTImage
              src={openAsset.image}
              alt={openAsset.name}
              fallback={openAsset.name}
              rounded='all'
            />
          </div>
          {isExpanded && (
            <div className='flex min-w-0 flex-col gap-y-0.5'>
              <span className='truncate text-sm font-medium text-gray-900'>
                {openAsset.name}
              </span>
              <span className='text-xs text-gray-500'>{openAsset.collection_name}</span>
            </div>
          )}
        </Link>
        {isExpanded && (
          <LikeButton
            isLiked={!!userLikes[offer.counterparty_assets[0].offer_nft_id]}
            likesCount={
              optimisticCounts[offer.counterparty_assets[0].offer_nft_id] ??
              offer.counterparty_assets[0].like_count ??
              0
            }
            onLike={() =>
              onLike(
                offer.counterparty_assets[0].offer_nft_id,
                !!userLikes[offer.counterparty_assets[0].offer_nft_id],
              )
            }
          />
        )}
      </div>
    )
  }

  return (
    <div
      className='mb-2'
      onClick={(e) => {
        if (isExpanded) {
          e.stopPropagation()
        }
      }}
    >
      <div className='flex w-full'>
        {/* Compact View */}
        {!isExpanded && (
          <div className='bg-gray-50 rounded-lg p-4 w-full'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='flex -space-x-2'>
                  {offer.creator_assets.map((asset) => (
                    <div key={asset.nft_id} className='w-12 h-12'>
                      <NFTImage
                        src={asset.image}
                        alt={asset.name}
                        fallback={asset.name}
                        rounded='all'
                        rings={true}
                      />
                    </div>
                  ))}
                </div>
                <div className='p-2 bg-white rounded-full shadow-sm'>
                  <SwapArrows />
                </div>
                <div className='flex -space-x-2'>
                  {offer.counterparty_assets.map((asset) => (
                    <div key={asset.nft_id} className='w-12 h-12'>
                      <NFTImage
                        src={asset.image}
                        alt={asset.name}
                        fallback={asset.name}
                        rounded='all'
                        rings={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className='w-full space-y-3 space-x-0 flex flex-col md:flex-row md:justify-between md:space-y-0 md:space-x-4'>
            <OfferSide
              assets={offer.creator_assets}
              username={offer.creator_username}
              profilePic={offer.creator_profile_pic_url}
              isExpanded={isExpanded}
              userLikes={userLikes}
              optimisticCounts={optimisticCounts}
              onLike={onLike}
            />
            <OfferSide
              assets={offer.counterparty_assets}
              username={offer.counterparty_username}
              profilePic={offer.counterparty_profile_pic_url}
              isExpanded={isExpanded}
              userLikes={userLikes}
              optimisticCounts={optimisticCounts}
              onLike={onLike}
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface SwapInfoProps {
  offer: OfferData
  isOpenOffer: boolean
  isExpanded: boolean
}

const SwapInfo: FC<SwapInfoProps> = ({ offer, isOpenOffer, isExpanded }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})
  const [optimisticCounts, setOptimisticCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const counts: Record<string, number> = {}
    const allAssets = [...offer.creator_assets, ...offer.counterparty_assets]
    allAssets.forEach((asset) => {
      counts[asset.offer_nft_id] = asset.like_count ?? 0
    })
    setOptimisticCounts(counts)
  }, [offer])

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user || !isExpanded) return

      const offerNftIds = [
        ...offer.creator_assets.map((a) => a.offer_nft_id),
        ...offer.counterparty_assets.map((a) => a.offer_nft_id),
      ]

      const { data, error } = await supabase
        .from('offer_nft_likes')
        .select('offer_nft_id')
        .eq('user_id', user.id)
        .in('offer_nft_id', offerNftIds)

      if (error) {
        console.error('Error fetching likes:', error)
        return
      }

      const likes: Record<string, boolean> = {}
      data.forEach((like) => {
        likes[like.offer_nft_id] = true
      })
      setUserLikes(likes)
    }

    fetchLikes()
  }, [user, isExpanded, offer])

  const handleLike = async (offerNftId: string, currentLikeState: boolean) => {
    if (!user) {
      showToast('⚠️ You have to login first', 2500)
      return
    }

    setUserLikes((prev) => ({
      ...prev,
      [offerNftId]: !currentLikeState,
    }))

    setOptimisticCounts((prev) => ({
      ...prev,
      [offerNftId]: (prev[offerNftId] ?? 0) + (currentLikeState ? -1 : 1),
    }))

    try {
      if (!currentLikeState) {
        const { error } = await supabase
          .from('offer_nft_likes')
          .insert({ user_id: user.id, offer_nft_id: offerNftId })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('offer_nft_likes')
          .delete()
          .match({ user_id: user.id, offer_nft_id: offerNftId })

        if (error) throw error
      }
    } catch (error) {
      setUserLikes((prev) => ({
        ...prev,
        [offerNftId]: currentLikeState,
      }))

      setOptimisticCounts((prev) => ({
        ...prev,
        [offerNftId]: (prev[offerNftId] ?? 0) + (currentLikeState ? 1 : -1),
      }))

      showToast('⚠️ Error updating like', 2500)
      console.error('Error updating like:', error)
    }
  }

  return (
    <TradeOffer
      offer={offer}
      isOpenOffer={isOpenOffer}
      isExpanded={isExpanded}
      userLikes={userLikes}
      optimisticCounts={optimisticCounts}
      onLike={handleLike}
    />
  )
}

export default SwapInfo
