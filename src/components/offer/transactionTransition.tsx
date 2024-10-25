import React from 'react'

import { NFTOfferDisplay } from '@/components/shared'
import { ChainLogo } from '@/icons'

interface Asset {
  id: string
  name: string
  image: string
}

interface User {
  username: string
  profile_pic_url: string
}

interface TransitionScreenProps {
  user: User
  counterUser: User
  userAssets: Asset[]
  counterUserAssets: Asset[]
  chainId: number
  chainName: string
}

const TransactionTransition: React.FC<TransitionScreenProps> = ({
  user,
  counterUser,
  userAssets,
  counterUserAssets,
  chainId,
  chainName,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gray-100 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden'>
        <div className='p-6 space-y-6'>
          <div className='flex justify-center items-center space-y-4 flex-col'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600'></div>
          </div>

          <NFTOfferDisplay
            userAOffers={userAssets}
            userBOffers={counterUserAssets}
            size='medium'
            defaultOpen={false}
            status='accepted'
          />

          <div className='text-lg text-gray-600 text-center'>
            Assets deposited. Processing swap onchain..
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionTransition
