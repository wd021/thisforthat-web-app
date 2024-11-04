import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { FC } from 'react'

import { NFTImage } from '@/components/shared'
import { ChainLogo, Heart, SwapArrows } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import type { NFTAsset, OfferData } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'
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
    className={`
      ml-4 
      inline-flex 
      items-center 
      space-x-1.5 
      p-1.5 
      hover:bg-gray-100 
      rounded-full 
      transition-colors
      ${isLiked ? 'text-red-500' : 'text-gray-500'}
      hover:text-red-500
      ${className}
    `}
  >
    <Heart className='h-5 w-5' fill={isLiked ? 'currentColor' : 'none'} />
    {likesCount > 0 && <span className='text-xs font-medium'>{likesCount}</span>}
  </button>
)

interface OfferSideProps {
  assets: NFTAsset[]
  isExpanded: boolean
  side: 'creator' | 'counterparty'
  userLikes: Record<string, boolean>
  optimisticCounts: Record<string, number>
  onLike: (nftId: string, currentLikeState: boolean) => void
}

const OfferSide: FC<OfferSideProps> = ({
  assets,
  isExpanded,
  side,
  userLikes,
  optimisticCounts,
  onLike,
}) => (
  <div
    className={`
      flex 
      flex-col 
      ${isExpanded ? 'flex-1 h-full p-4' : ''} 
      ${side === 'creator' && isExpanded ? 'border-r border-gray-200' : ''}
    `}
  >
    <div className={isExpanded ? 'flex-1' : ''}>
      <div className={`flex ${isExpanded ? 'flex-col space-y-4' : 'flex-row space-x-6'}`}>
        {assets?.map((asset) => (
          <div
            key={asset.nft_id}
            className={`
              flex 
              items-center 
              justify-between 
              group 
              transition-transform 
              duration-200
              ${isExpanded ? 'w-full' : ''}
            `}
          >
            <Link
              href={`/nfts/${asset.nft_id}`}
              target='_blank'
              className='flex items-center space-x-2'
            >
              <div className={`relative flex ${isExpanded ? 'h-14 w-14' : 'h-12 w-12'}`}>
                <NFTImage
                  src={asset.image}
                  alt={asset.name}
                  fallback={asset.name}
                  rounded='all'
                />
              </div>
              <div className='flex min-w-0 flex-col py-0.5'>
                <span className='truncate pl-0.5 text-sm font-medium text-gray-900'>
                  {asset.name}
                </span>
                <span className='mt-0.5 flex items-center'>
                  <ChainLogo chainId={asset.chain_id} className='h-3 w-3' />
                  <span className='ml-1 text-sm text-gray-600'>
                    {CHAIN_IDS_TO_CHAINS[asset.chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]}
                  </span>
                </span>
              </div>
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
  if (isOpenOffer && offer.counterparty_assets[0]) {
    return (
      <div className='mb-2' onClick={(e) => e.stopPropagation()}>
        <Link
          href={`/nfts/${offer.counterparty_assets[0].nft_id}`}
          target='_blank'
          className='flex items-start space-x-2.5 rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-50'
        >
          <div className={`relative flex ${isExpanded ? 'h-14 w-14' : 'h-12 w-12'}`}>
            <NFTImage
              src={offer.counterparty_assets[0].image}
              alt={offer.counterparty_assets[0].name}
              fallback={offer.counterparty_assets[0].name}
              rounded='all'
            />
          </div>
          <div className='flex min-w-0 flex-col py-0.5'>
            <span className='truncate text-sm font-medium text-gray-900'>
              {offer.counterparty_assets[0].name}
            </span>
            <span className='mt-0.5 flex items-center'>
              <ChainLogo chainId={offer.counterparty_assets[0].chain_id} className='h-3 w-3' />
              <span className='ml-1 text-sm text-gray-600'>
                {
                  CHAIN_IDS_TO_CHAINS[
                    offer.counterparty_assets[0].chain_id as keyof typeof CHAIN_IDS_TO_CHAINS
                  ]
                }
              </span>
            </span>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className='mb-2' onClick={(e) => e.stopPropagation()}>
      <div
        className={`
          flex 
          rounded-lg 
          bg-gray-50 
          overflow-x-auto 
          custom-scrollbar
          ${!isExpanded ? 'items-center p-3 custom-scrollbar' : ''}
        `}
      >
        <OfferSide
          assets={offer.creator_assets}
          isExpanded={isExpanded}
          side='creator'
          userLikes={userLikes}
          optimisticCounts={optimisticCounts}
          onLike={onLike}
        />

        {!isExpanded && (
          <div className='flex items-center px-4'>
            <div className='rounded-full border border-gray-100 bg-white/80 p-1.5 shadow-sm'>
              <SwapArrows />
            </div>
          </div>
        )}

        <OfferSide
          assets={offer.counterparty_assets}
          isExpanded={isExpanded}
          side='counterparty'
          userLikes={userLikes}
          optimisticCounts={optimisticCounts}
          onLike={onLike}
        />
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
