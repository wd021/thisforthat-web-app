import React from 'react'
import Modal from 'react-modal'

import { useIsMobile } from '@/hooks'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { supabase } from '@/utils/supabaseClient'

const GoogleLoginButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className='group relative w-full max-w-[325px] flex items-center justify-center gap-x-3 
                 rounded-lg bg-white px-4 py-3 text-base font-semibold 
                 shadow-md transition duration-200 ease-in-out
                 hover:shadow-lg hover:bg-gray-50 
                 border border-gray-300
                 disabled:opacity-70 disabled:cursor-not-allowed'
    >
      <svg className='h-6 w-6' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
        <path
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          fill='#4285F4'
        />
        <path
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          fill='#34A853'
        />
        <path
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          fill='#FBBC05'
        />
        <path
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          fill='#EA4335'
        />
      </svg>
      <span className='text-gray-900 flex-1 text-center'>Continue with Google</span>
    </button>
  )
}

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

const Logo: React.FC = () => (
  <img src='/splash.png' alt='NFT Swap Logo' className='mt-12 w-64 h-64' />
)

const Features: React.FC = () => (
  <div className='gap-y-2 flex flex-col my-4'>
    <div className='text-lg px-16'>
      NFTs were made to be swapped. Meet fellow enthusiasts, make trades, negotiate, and have a
      blast while building your collection.
    </div>
  </div>
)

const LoginButton: React.FC<{ onClick: () => Promise<void> }> = ({ onClick }) => (
  <div className='my-6 flex flex-col items-center gap-y-6'>
    <GoogleLoginButton onClick={onClick} />
  </div>
)

const TermsNote: React.FC = () => (
  <p className='mb-4 text-sm text-gray-500'>
    By signing in, you agree to our{' '}
    <a href='/terms' target='_blank' className='underline'>
      Terms
    </a>{' '}
    and{' '}
    <a href='/privacy' target='_blank' className='underline'>
      Privacy Policy
    </a>
  </p>
)

export default Login
