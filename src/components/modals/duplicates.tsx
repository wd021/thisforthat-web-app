import React from 'react'
import Modal from 'react-modal'
import Link from 'next/link'

import { useIsMobile } from '@/hooks'
import { getModalStyles } from '@/styles'

const Duplicates: React.FC<{
  users: any[]
  closeModal: () => void
}> = ({ users, closeModal }) => {
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  return (
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <div className='flex flex-col h-full lg:h-auto overflow-y-auto hide-scrollbar'>
        <div className='p-4 border-b border-gray-200 sticky top-0'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-bold'>NFT Holders</h2>
            <button
              onClick={closeModal}
              className='text-gray-500 hover:text-gray-700 transition-colors'
            >
              ✕
            </button>
          </div>
        </div>
        <div className='m-4 bg-amber-50 border border-amber-200 rounded-md p-3'>
          <p className='text-sm text-amber-700'>
            Multiple users have added this NFT to their account. This duplication will be
            resolved once a user verifies their ownership.
          </p>
        </div>
        <div className='flex-1 overflow-y-auto hide-scrollbar'>
          {users.map((user) => (
            <Link
              key={user.user_profile.id}
              href={`/${user.user_profile.username}`}
              className='flex items-center p-4 border-b border-gray-100 last:border-0'
            >
              <img
                src={
                  process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                  user.user_profile.profile_pic_url
                }
                alt={user.user_profile.username}
                className='w-10 h-10 rounded-full'
              />
              <div className='ml-3 flex-1 font-semibold'>{user.user_profile.username}</div>
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default Duplicates
