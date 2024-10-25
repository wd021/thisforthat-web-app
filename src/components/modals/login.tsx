import React from 'react'
import Modal from 'react-modal'

import { useIsMobile } from '@/hooks'
import { Google } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { supabase } from '@/utils/supabaseClient'

const Login: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const { showToast } = useToast()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
        },
      })
    } catch (error) {
      showToast(`⚠️ Login failed`, 2500)
      console.error('Login failed:', error)
    }
  }

  return (
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
    >
      <div className='flex flex-col p-4 items-center text-center h-full justify-center lg:h-auto lg:justify-normal overflow-y-auto hide-scrollbar'>
        <CloseButton onClick={closeModal} />
        <Logo />
        <Title />
        <Features />
        <LoginButton onClick={handleGoogleSignIn} />
        <TermsNote />
      </div>
    </Modal>
  )
}

const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    className='absolute top-0 right-0 w-[75px] h-[75px] flex items-center justify-center cursor-pointer'
    onClick={onClick}
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='18' y1='6' x2='6' y2='18'></line>
      <line x1='6' y1='6' x2='18' y2='18'></line>
    </svg>
  </div>
)

const Logo: React.FC = () => <img src='/logo.png' alt='NFT Swap Logo' className='w-64 h-64' />

const Title: React.FC = () => (
  <div className='text-3xl mb-8 font-semibold'>
    NFTs Were Made
    <br />
    For Swapping
  </div>
)

const Features: React.FC = () => (
  <div className='gap-y-2 flex flex-col mb-4'>
    <div>🌈 Dive into a world of NFT enthusiasts</div>
    <div>🚀 Elevate your collection to new heights</div>
    <div>🎭 Experience the joy of NFT swapping</div>
  </div>
)

const LoginButton: React.FC<{ onClick: () => Promise<void> }> = ({ onClick }) => (
  <div className='my-6 flex flex-col items-center gap-y-6'>
    <button
      onClick={onClick}
      className='w-[325px] text-xl bg-black text-white font-bold px-4 py-3 rounded-lg transition duration-300 ease-in-out transform lg:hover:-translate-y-1 lg:hover:scale-110 cursor-pointer flex items-center justify-center'
    >
      <Google className='mr-4 w-8 h-8' />
      <div>Let&apos;s Go</div>
    </button>
  </div>
)

const TermsNote: React.FC = () => (
  <p className='mt-4 text-sm text-gray-500'>
    By signing in, you agree to our{' '}
    <a href='/terms' className='underline'>
      Terms
    </a>{' '}
    and{' '}
    <a href='/privacy' className='underline'>
      Privacy Policy
    </a>
  </p>
)

export default Login
