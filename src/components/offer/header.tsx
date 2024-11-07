import Link from 'next/link'

import { ChainLogo, Expand, Star } from '@/icons'
import { OfferData } from '@/types/supabase'

const Icons = {
  ChevronRight: () => (
    <svg
      className='w-4 h-4 text-gray-600'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
    </svg>
  ),
  ChevronDown: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
    </svg>
  ),
  ChevronUp: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
    </svg>
  ),
}

const UserInfo: React.FC<{ username: string; profilePic: string }> = ({
  username,
  profilePic,
}) => (
  <div className='flex items-center space-x-2'>
    <Link
      href={`/${username}`}
      target='_blank'
      className='h-6 w-6 rounded-full overflow-hidden flex-shrink-0'
    >
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profilePic}
        alt={username}
        className='w-full h-full object-cover'
      />
    </Link>
    <span className='text-sm font-medium'>{username}</span>
  </div>
)

const FavoriteButton: React.FC<{
  fullPage: boolean
  isFavorited: boolean
  onClick: () => void
}> = ({ fullPage, isFavorited, onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={`p-1.5 hover:bg-gray-100 rounded-full ${isFavorited ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500 transition-colors`}
  >
    <Star className={`${fullPage ? 'w6 h-6' : 'w-4 h-4'}`} filled={isFavorited} />
  </button>
)

const Header = ({
  fullPage,
  offer,
  onFavorite,
  isExpanded,
  setIsExpanded,
}: {
  fullPage: boolean
  offer: OfferData
  onFavorite: () => void
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}) => {
  return (
    <div className='flex items-center justify-between p-2 pt-0 pb-4'>
      <div className='flex items-center space-x-2'>
        <ChainLogo chainId={offer.chain_id} className='w-5 h-5' />
        <div className='flex items-center gap-x-1'>
          <UserInfo
            username={offer.creator_username}
            profilePic={offer.creator_profile_pic_url}
          />
          <Icons.ChevronRight />
          <UserInfo
            username={offer.counterparty_username}
            profilePic={offer.counterparty_profile_pic_url}
          />
        </div>
      </div>
      <div className='flex items-center space-x-2.5'>
        <FavoriteButton
          fullPage={fullPage}
          isFavorited={offer.favorited_by_user}
          onClick={onFavorite}
        />
        {!fullPage && (
          <>
            <Link
              href={`/offers/${offer.offer_id}`}
              target='_blank'
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-full'
              onClick={(e) => e.stopPropagation()}
            >
              <Expand className='w-4 h-4' />
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-full'
            >
              {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Header
