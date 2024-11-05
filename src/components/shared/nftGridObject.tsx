import { FC } from 'react'
import Link from 'next/link'

import { NFTImage, VerifiedBadge } from '@/components/shared'
import { NFTGridItem } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

const NFTGridObject: FC<{
  item: NFTGridItem
  newOffer: (nft: NFTGridItem) => void
  pinItem: (nft: NFTGridItem) => void
}> = ({ item, newOffer, pinItem }) => {
  const navigateToUser = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.open(`/${item.nft_user_id_username}`, '_blank')
  }

  return (
    <Link href={`/nfts/${item.nft_id}`}>
      <div className='bg-white rounded-lg shadow-md relative hover:shadow-lg'>
        <NFTImage src={item.nft_image} alt={item.nft_name} fallback={item.nft_name} />
        <div className='flex justify-between pl-3 pr-2 py-1.5'>
          <div className='flex items-center w-full mr-2 truncate'>
            <img
              src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${item?.nft_user_id_profile_pic_url}`}
              alt={item?.nft_user_id_username}
              className='w-6 h-6 rounded-full'
              onClick={navigateToUser}
            />
            <span className='text-lg ml-2 text-gray-700 font-semibold'>
              {item?.nft_user_id_username}
            </span>
          </div>
          <VerifiedBadge
            id={item.nft_id}
            name={item.nft_name}
            chainName={
              CHAIN_IDS_TO_CHAINS[item.nft_chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]
            }
            collectionName={item.nft_collection_name}
            tokenId={item.nft_token_id}
            isVerified={item.nft_is_verified}
            className='w-10 h-10 flex items-center justify-center'
            chainId={item.nft_chain_id.toString()}
            collectionContract={item.nft_collection_contract}
          />
        </div>
      </div>
      <div className='mt-2 flex gap-x-2 gap-y-2 w-full p-0.5 overflow-hidden'>
        <div className='flex w-full gap-x-2'>
          <button
            className='mb-1 w-full flex justify-center items-center bg-yellow-50 px-3 py-1 rounded-md hover:bg-yellow-100 transition-colors duration-200 shadow-md'
            onClick={(e) => {
              e.preventDefault()
              newOffer(item)
            }}
          >
            <span className='flex items-center mr-2 text-2xl'>🤝</span>
            <span className='text-gray-800 font-semibold'>Offer</span>
          </button>
          <button
            className={`mb-1 flex justify-center items-center bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors duration-200 shadow-md`}
            onClick={(e) => {
              e.preventDefault()
              pinItem(item)
            }}
          >
            <span className='flex items-center text-lg'>📌</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default NFTGridObject
