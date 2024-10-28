import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Modal from 'react-modal'
import { isAddress } from 'viem'

import { NftImporter } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { User } from '@/icons'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { BLOCKED_USERNAMES, MAX_IMAGE_UPLOAD_SIZE } from '@/utils/constants'
import { uploadFile } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const Onboard: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)
  const { showToast } = useToast()

  const [completeScreen, setCompleteScreen] = useState(true)
  const [step, setStep] = useState(1)

  // Profile info state
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [loadingFileUpload, setLoadingFileUpload] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    const errors: { [key: string]: string } = {}
    if (!username.trim()) errors.username = 'Username is required.'
    if (!bio.trim()) errors.bio = 'Bio is required.'
    if (!profileImage) errors.file = 'Profile picture is required.'
    if (!walletAddress.trim()) {
      errors.walletAddress = 'Wallet address is required.'
    } else if (!isAddress(walletAddress)) {
      errors.walletAddress = 'Invalid wallet address.'
    }
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    const normalizedUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

    if (normalizedUsername.length < 3) {
      setFormErrors({
        username: 'Username must be at least 3 characters long.',
      })
      return
    }

    if (BLOCKED_USERNAMES.includes(normalizedUsername)) {
      setFormErrors({
        username: `${username} is not a valid username. Please pick another one.`,
      })
      return
    }

    setLoading(true)

    const { data: user } = await supabase.auth.getSession()
    const { error } = await supabase
      .from('user_profile')
      .upsert({
        id: user.session?.user.id,
        username: normalizedUsername,
        bio,
        profile_pic_url: profileImage,
        wallet: walletAddress,
      })
      .select()

    setLoading(false)

    if (error) {
      showToast(
        `⚠️ Update profile failed. Username might be taken. Please try another one.`,
        2500,
      )
    } else {
      setStep(2)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      setFormErrors({ file: 'File size exceeds 3MB.' })
      return
    }

    setLoadingFileUpload(true)
    const formData = new FormData()
    formData.append('file', file)
    const token = (await supabase.auth.getSession()).data.session?.access_token

    if (!token) {
      setLoadingFileUpload(false)
      alert('Unexpected error. Please try again.')
      return
    }

    const response = await uploadFile(formData, token)
    setLoadingFileUpload(false)

    if (response && response.key) {
      setProfileImage(response.key)
    } else {
      setFormErrors({ file: 'Failed to upload file. Please try again.' })
    }
  }

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  return (
    <Modal
      id='react-modal'
      ariaHideApp={false}
      isOpen={true}
      onRequestClose={() => {
        if (completeScreen) {
          closeModal()
        }
      }}
      style={customStyles}
    >
      <div className='w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full'>
        <div className='p-6 border-b border-gray-200'>
          <h2 className='text-2xl font-bold text-gray-800'>
            {completeScreen
              ? 'Welcome Aboard!'
              : `Step ${step} of 2: ${step === 1 ? 'Create Your Profile' : 'Add Your NFTs'}`}
          </h2>
        </div>
        <div
          className={`flex flex-grow ${isMobile || step === 1 ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          <div className={`p-6 w-full ${step === 2 ? `flex ${isMobile ? 'h-full' : ''}` : ''}`}>
            {completeScreen ? (
              <div className='flex flex-col items-center text-center'>
                <div className='text-7xl mb-6'>🎉</div>

                <h2 className='text-3xl font-bold mb-4 text-gray-800'>
                  Congratulations, <span className='text-blue-600'>{username}</span>!
                </h2>

                <p className='text-lg mb-4 text-gray-600'>
                  You&apos;ve finished setting up your account!
                </p>

                <p className='mb-6 text-gray-600'>
                  It&apos;s time to start swapping. Share your profile with others and check out
                  the NFTs on offer!
                </p>

                <div className='bg-gray-100 px-6 py-3 rounded-full mb-8 select-all'>
                  <p className='font-semibold text-lg text-gray-800'>
                    www.thisforthat.app/<span className='text-blue-600'>{username}</span>
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className='w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg'
                >
                  Let&apos;s Go!
                </button>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <form onSubmit={handleProfileSubmit} className='space-y-6'>
                    <div className='flex items-center space-x-4'>
                      <div
                        {...getRootProps()}
                        className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden'
                      >
                        <input {...getInputProps()} />
                        {profileImage ? (
                          <img
                            src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + profileImage}
                            alt='Profile Picture'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <User width={48} height={48} className='text-gray-400' />
                        )}
                      </div>
                      <div>
                        <button
                          type='button'
                          onClick={open}
                          className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        >
                          {profileImage ? 'Change Picture' : 'Upload Picture'}
                        </button>
                        {loadingFileUpload && <span className='ml-2'>Uploading...</span>}
                      </div>
                    </div>
                    {formErrors.file && (
                      <p className='text-sm text-red-600'>{formErrors.file}</p>
                    )}

                    <div className='space-y-2'>
                      <input
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      />
                      {formErrors.username && (
                        <p className='text-sm text-red-600'>{formErrors.username}</p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <textarea
                        placeholder='Bio'
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        rows={4}
                      />
                      {formErrors.bio && (
                        <p className='text-sm text-red-600'>{formErrors.bio}</p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <input
                        type='text'
                        placeholder='Wallet Address'
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      />
                      {formErrors.walletAddress && (
                        <p className='text-sm text-red-600'>{formErrors.walletAddress}</p>
                      )}
                    </div>

                    <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                      <p className='text-sm text-yellow-700'>
                        This wallet address will be used to receive assets on successful swaps.
                      </p>
                    </div>

                    {/* Desktop buttons */}
                    <div className='hidden lg:flex lg:justify-between'>
                      <button
                        type='button'
                        onClick={async () => {
                          await supabase.auth.signOut()
                          closeModal()
                        }}
                        className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      >
                        Logout
                      </button>
                      <button
                        type='submit'
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Saving...' : 'Next Step'}
                      </button>
                    </div>
                  </form>
                )}
                {step === 2 && <NftImporter onComplete={() => setCompleteScreen(true)} />}
              </>
            )}
          </div>
        </div>
        {/* Mobile buttons */}
        {!completeScreen && step === 1 && (
          <div className='lg:hidden mt-auto border-t border-gray-200 p-4'>
            <button
              type='button'
              onClick={handleProfileSubmit}
              disabled={loading}
              className='w-full mb-2 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              {loading ? 'Saving...' : 'Next Step'}
            </button>
            <button
              type='button'
              onClick={async () => {
                await supabase.auth.signOut()
                closeModal()
              }}
              className='w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default Onboard
