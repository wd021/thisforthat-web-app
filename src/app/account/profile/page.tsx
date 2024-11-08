'use client'

import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { isAddress } from 'viem'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { Profile } from '@/types/supabase'
import { BLOCKED_USERNAMES, MAX_IMAGE_UPLOAD_SIZE } from '@/utils/constants'
import { uploadFile } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const AccountProfilePage: React.FC = () => {
  const isMobile = useIsMobile()
  const router = useRouter()
  const { user, loading: loadingUser, profile: initialProfile } = useAuth()
  const { showToast } = useToast()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingFileUpload, setLoadingFileUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile])

  const handleSaveProfile = async () => {
    if (!profile) return

    setErrors({})
    const newErrors: { [key: string]: string } = {}

    if (!profile.username?.trim()) {
      newErrors.username = 'Username is required.'
    } else if (BLOCKED_USERNAMES.includes(profile.username)) {
      newErrors.username = `${profile.username} is not a valid username. Please pick another one.`
    } else if (profile.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long.'
    }

    if (!profile.bio?.trim()) {
      newErrors.bio = 'Bio is required.'
    }

    if (!profile.wallet?.trim()) {
      newErrors.wallet = 'Wallet address is required.'
    } else if (!isAddress(profile.wallet)) {
      newErrors.wallet = 'Invalid wallet address.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const updatedProfile = { ...initialProfile, ...profile }
      const { error } = await supabase
        .from('user_profile')
        .upsert({
          id: user?.id,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          profile_pic_url: updatedProfile.profile_pic_url,
          wallet: updatedProfile.wallet,
        })
        .select()

      if (error) throw error
      showToast('✅ Profile updated successfully!', 2500)
    } catch (error) {
      showToast('⚠️ Update profile failed. Username might be taken. Please try another.', 2500)
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      alert('File size exceeds 3MB.')
      return
    }

    setLoadingFileUpload(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = (await supabase.auth.getSession()).data.session?.access_token

      if (!token) throw new Error('No access token found')

      const response = await uploadFile(formData, token)

      if (response && response.key) {
        setProfile((prevProfile) =>
          prevProfile ? { ...prevProfile, profile_pic_url: response.key } : prevProfile,
        )
      }
    } catch (error) {
      alert('Unexpected error. Please try again.')
    } finally {
      setLoadingFileUpload(false)
    }
  }

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  if (!loadingUser && !user) {
    router.push('/')
  }

  if (!profile) {
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='loader'></div>
      </div>
    )
  }

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full py-8 px-4 relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'}`}
      >
        <div className='max-w-screen-md mx-auto'>
          <div className='text-2xl font-bold mb-8 text-gray-800'>Edit Profile</div>
          <div className='space-y-6'>
            <ProfilePicture
              profile={profile}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              open={open}
              loadingFileUpload={loadingFileUpload}
            />
            <BasicInformation profile={profile} setProfile={setProfile} errors={errors} />
            <SaveButton handleSaveProfile={handleSaveProfile} loading={loading} />
          </div>
        </div>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

interface ProfilePictureProps {
  profile: Profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRootProps: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInputProps: any
  open: () => void
  loadingFileUpload: boolean
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profile,
  getRootProps,
  getInputProps,
  open,
  loadingFileUpload,
}) => (
  <div className='bg-white rounded-lg shadow-md p-6'>
    <h2 className='text-xl font-semibold mb-4'>Profile Picture</h2>
    <div className='flex items-center'>
      <div
        {...getRootProps()}
        className='w-24 h-24 shrink-0 bg-gray-200 rounded-full overflow-hidden cursor-pointer'
      >
        <input {...getInputProps()} />
        {profile.profile_pic_url ? (
          <img
            src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${profile.profile_pic_url}`}
            alt='Profile Picture'
            className='w-full h-full object-cover bg-white'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-400'>
            <svg
              className='w-12 h-12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              ></path>
            </svg>
          </div>
        )}
      </div>
      <div className='ml-4'>
        <button
          type='button'
          onClick={open}
          className='px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
        >
          {profile.profile_pic_url ? 'Change Picture' : 'Upload Picture'}
        </button>
        {loadingFileUpload && <div className='ml-2 inline-block loader'></div>}
      </div>
    </div>
  </div>
)

interface BasicInformationProps {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>
  errors: { [key: string]: string }
}

const BasicInformation: React.FC<BasicInformationProps> = ({ profile, setProfile, errors }) => (
  <div className='bg-white rounded-lg shadow-md p-6'>
    <h2 className='text-xl font-semibold mb-4'>Basic Information</h2>
    <div className='space-y-4'>
      <div>
        <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>
          Username
        </label>
        <input
          type='text'
          id='username'
          value={profile.username || ''}
          onChange={(e) => {
            const normalizedUsername = e.target.value
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
            setProfile({ ...profile, username: normalizedUsername })
          }}
          className='mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
        />
        {errors.username && <p className='mt-1 text-sm text-red-600'>{errors.username}</p>}
      </div>
      <div>
        <label htmlFor='bio' className='block text-sm font-medium text-gray-700 mb-1'>
          Bio
        </label>
        <textarea
          id='bio'
          value={profile.bio || ''}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={3}
          className='mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
        />
        {errors.bio && <p className='mt-1 text-sm text-red-600'>{errors.bio}</p>}
      </div>
      <div>
        <label htmlFor='wallet' className='block text-sm font-medium text-gray-700 mb-1'>
          Wallet Address
        </label>
        <input
          type='text'
          id='wallet'
          value={profile.wallet || ''}
          onChange={(e) => setProfile({ ...profile, wallet: e.target.value })}
          className='mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
        />
        {errors.wallet && <p className='mt-1 text-sm text-red-600'>{errors.wallet}</p>}
      </div>
      <div className='mt-2 pl-4 py-3 pr-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-r text-sm'>
        Your receiving wallet – where NFTs will be delivered to you in swaps.
      </div>
    </div>
  </div>
)

interface SaveButtonProps {
  handleSaveProfile: () => Promise<void>
  loading: boolean
}

const SaveButton: React.FC<SaveButtonProps> = ({ handleSaveProfile, loading }) => (
  <button
    onClick={handleSaveProfile}
    className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50'
    disabled={loading}
  >
    {loading ? 'Saving...' : 'Save Changes'}
  </button>
)

export default AccountProfilePage
