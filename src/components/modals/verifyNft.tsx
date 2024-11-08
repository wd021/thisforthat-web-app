'use client'

import Modal from 'react-modal'

import { NftVerifier } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { Close } from '@/icons'
import { getModalStyles } from '@/styles'

const VerifyNft: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  return (
    <div>
      <Modal
        id='react-modal'
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className='p-5 border-b border-gray-200 flex justify-between items-center'>
          <div className='text-xl font-semibold'>Verify NFTs</div>
          <button className='text-gray-500' aria-label='Close modal' onClick={closeModal}>
            <Close className='w-5 h-5' />
          </button>
        </div>
        <NftVerifier onClose={closeModal} />
      </Modal>
    </div>
  )
}

export default VerifyNft
