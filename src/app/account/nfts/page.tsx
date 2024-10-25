'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { Footer } from '@/components'
import { AddNft, VerifyNft } from '@/components/modals'
import { NFTAccountItem } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { useNFTs } from '@/hooks/supabase'
import { Add, VerifyIcon } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { Profile, UserNFT } from '@/types/supabase'

const Header: React.FC<{ setModal: (modal: 'add' | 'verify' | null) => void }> = ({
  setModal,
}) => {
  return (
    <header className='border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <h1 className='text-2xl font-semibold text-gray-800'>My NFTs</h1>
          <div className='flex space-x-3'>
            <HeaderButton onClick={() => setModal('add')} icon={<Add />}>
              Add NFTs
            </HeaderButton>
            <HeaderButton onClick={() => setModal('verify')} icon={<VerifyIcon />}>
              Verify NFTs
            </HeaderButton>
          </div>
        </div>
      </div>
    </header>
  )
}

const HeaderButton: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ onClick, icon, children }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className='flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150'
  >
    <span className='mr-1.5'>{icon}</span>
    <span>{children}</span>
  </motion.button>
)

const NFTGrid: React.FC<{
  userNfts: UserNFT[]
  profile: Profile
  hasMore: boolean
  loadMore: () => void
}> = ({ userNfts, profile, hasMore, loadMore }) => (
  <div className='flex-grow overflow-y-auto hide-scrollbar'>
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 mb-16'>
      {userNfts.map((userNft) => (
        <NFTAccountItem key={userNft.id} item={userNft} profile={profile} />
      ))}
    </div>
    {userNfts.length > 0 && hasMore && (
      <div className='w-full flex items-center justify-center my-8'>
        <button
          onClick={loadMore}
          className='px-10 py-3 text-lg rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-300'
        >
          Load More
        </button>
      </div>
    )}
  </div>
)

const AccountNFTSPage: React.FC = () => {
  const isMobile = useIsMobile()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [modal, setModal] = useState<'add' | 'verify' | null>(null)
  const { userNfts, hasMore, fetchUserNfts, loadMore } = useNFTs()

  useEffect(() => {
    if (user) {
      fetchUserNfts(user?.id, 1)
    }
  }, [user, fetchUserNfts])

  if (!loading && !user) {
    router.push('/')
  }

  return (
    <>
      <div className='absolute top-[75px] bottom-0 w-full flex'>
        <div
          className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${isMobile ? 'mb-16' : 'mb-[50px]'}`}
        >
          <Header setModal={setModal} />
          <div className='max-w-7xl mx-auto p-3 md:p-6 flex flex-col flex-grow overflow-hidden'>
            <NFTGrid
              userNfts={userNfts}
              profile={profile!}
              hasMore={hasMore}
              loadMore={() => user?.id && loadMore(user.id)}
            />
          </div>
        </div>
        {!isMobile && <Footer />}
      </div>
      {modal === 'add' && <AddNft closeModal={() => setModal(null)} />}
      {modal === 'verify' && <VerifyNft closeModal={() => setModal(null)} />}
    </>
  )
}

export default AccountNFTSPage
