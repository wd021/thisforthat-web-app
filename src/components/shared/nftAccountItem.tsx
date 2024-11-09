import React from 'react'
import Link from 'next/link'

import { NFTImage, VerifiedBadge } from '@/components/shared'
import { Profile, UserNFT } from '@/types/supabase'

const NFTImageWrapper: React.FC<{ item: UserNFT; profile: Profile }> = ({ item, profile }) => (
  <div className='flex flex-col bg-white shadow-md rounded-lg relative'>
    <NFTImage src={item.nfts.image} alt={item.nfts.name} fallback={item.nfts.name} />
    <div className='flex justify-between px-3 py-1.5'>
      <div
        className='flex items-center w-full truncate'
        onClick={(e) => {
          e.preventDefault()
          window.open(`/${profile.username}`, '_blank')
        }}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${profile?.profile_pic_url}`}
          alt={profile?.username}
          className='w-6 h-6 rounded-full'
        />
        <span className='text-lg ml-2 text-gray-700 font-semibold'>{profile?.username}</span>
      </div>
      <VerifiedBadge
        id={item.nft_id}
        name={item.nfts.name}
        collectionName={item.nfts.collection_name}
        tokenId={item.nfts.token_id}
        isVerified={item.nfts.is_verified && item.nfts.user_id === item.user_id}
        className='w-8 h-8 flex items-center justify-center shrink-0'
        chainId={item.nfts.chain_id.toString()}
        collectionContract={item.nfts.collection_contract}
      />
    </div>
  </div>
)

const NFTAccountItem: React.FC<{ item: UserNFT; profile: Profile }> = ({ item, profile }) => {
  return (
    <Link href={`/nfts/${item.nfts.id}`}>
      <NFTImageWrapper item={item} profile={profile} />
    </Link>
  )
}

export default NFTAccountItem
