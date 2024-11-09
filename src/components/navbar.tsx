'use client'

import { FC, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'

import { AccountDropdown, NotificationDropdown } from '@/components/dropdowns'
import { Login as LoginModal, Onboard as OnboardModal } from '@/components/modals'
import { LoadingIndicator } from '@/components/shared'
import { useIsMobile } from '@/hooks'
import { Close, Hamburger, Login, Search, Verified } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { DISCORD_LINK } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

const Navbar: FC = () => {
  const router = useRouter()
  const { user, loading, profile, hasProfile, updateLastSeen } = useAuth()
  const isMobile = useIsMobile()

  const [notifications, setNotifications] = useState<any[]>([])
  const [newNotificationsCount, setNewNotificationsCount] = useState(0)

  const [modal, setModal] = useState<boolean | 'login' | 'onboard'>(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<{ nfts: any[]; users: any[] }>({
    nfts: [],
    users: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 3) {
      setSearchResults({ nfts: [], users: [] })
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const nftResults = await supabase
      .from('nfts')
      .select('id, name, image, chain_id, collection_name, is_verified')
      .ilike('name', `%${term}%`)
      .limit(5)

    const userResults = await supabase
      .from('user_profile')
      .select('id, username, profile_pic_url')
      .ilike('username', `%${term}%`)
      .limit(5)

    setSearchResults({
      nfts: nftResults.data || [],
      users: userResults.data || [],
    })

    setIsSearching(false)
  }, [])

  const debouncedSearch = useCallback(
    debounce((term: string) => performSearch(term), 300),
    [performSearch],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setShowResults(true)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (user && !loading && !hasProfile) {
      setModal('onboard')
    }
  }, [user, loading, hasProfile])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const renderButtons = (isMobileMenu = false) => (
    <>
      {user && (
        <>
          {isMobileMenu ? (
            <>
              <Link
                href='/account/nfts'
                onClick={toggleMenu}
                className='flex items-center text-xl mb-4'
              >
                My NFTs
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href='/notifications'
                onClick={toggleMenu}
              >
                Notifications
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href='/account/profile'
                onClick={toggleMenu}
              >
                Edit Profile
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href={`/${profile?.username}`}
                onClick={toggleMenu}
              >
                View Profile
              </Link>
              <button
                className='flex items-center text-xl mb-4'
                onClick={async () => {
                  await supabase.auth.signOut()
                  toggleMenu()
                  router.push('/')
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NotificationDropdown
                notifications={notifications}
                newCount={newNotificationsCount}
                onOpen={() => {
                  if (newNotificationsCount > 0) {
                    updateLastSeen('notif')
                  }
                }}
              />
              <AccountDropdown username={profile?.username || ''} />
            </>
          )}
        </>
      )}
      {!user && (
        <button
          className={`flex items-center ${
            isMobileMenu
              ? 'text-xl mb-4'
              : 'bg-black text-white rounded-md px-4 py-2 cursor-pointer font-semibold h-[44px]'
          }`}
          onClick={() => setModal('login')}
        >
          <Login
            className={`${isMobileMenu ? 'w-6 h-6 mr-2' : 'w-6 h-6'} ${
              isMobileMenu ? 'text-black' : 'text-white'
            }`}
          />
          <div className={isMobileMenu ? '' : 'ml-1'}>Login</div>
        </button>
      )}
    </>
  )

  const getLatestNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    setNotifications(data)
    const newCount = data.filter(
      (notif) => new Date(notif.created_at) > new Date(profile?.notif_last_seen || 0),
    ).length
    setNewNotificationsCount(newCount)
  }

  useEffect(() => {
    if (profile) {
      getLatestNotifications()
    }
  }, [profile])

  return (
    <>
      <nav className='z-[55] top-0 fixed w-full bg-white flex justify-between items-center px-2 h-[75px] border-b border-gray-200'>
        <Link href='/'>
          <img src='/logo_header.png' className='h-[55px] p-1.5 fill' alt='Logo' />
        </Link>
        <div className='flex-1 max-w-xl mx-4'>
          <div className='relative' ref={searchRef}>
            <input
              type='text'
              placeholder='Find User or NFT'
              className='w-full px-4 h-[44px] pl-10 pr-4 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={() => setShowResults(true)}
            />
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search />
            </div>
            {showResults && (
              <div className='absolute min-h-[50px] mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10'>
                {isSearching ? (
                  <div className='p-4 flex justify-center items-center'>
                    <LoadingIndicator />
                  </div>
                ) : (
                  <>
                    {searchResults.nfts.length > 0 && (
                      <div className='p-2'>
                        <h3 className='text-sm font-semibold mb-1'>NFTs</h3>
                        {searchResults.nfts.map((nft) => (
                          <Link
                            key={nft.id}
                            href={`/nfts/${nft.id}`}
                            className='flex items-center hover:bg-gray-100 p-2 rounded'
                            onClick={() => {
                              setShowResults(false)
                              setSearchTerm('')
                              setSearchResults({ nfts: [], users: [] })
                            }}
                          >
                            <Verified
                              chainId={Number(nft.chain_id)}
                              isVerified={nft.is_verified}
                              className='w-6 h-6 mr-4'
                            />
                            {/* eslint-disable-next-line */}
                            <img src={nft.image} className='w-10 h-10 rounded-md' />
                            <div className='ml-2 flex flex-col gap-y-1'>
                              <div className='text-sm'>{nft.name}</div>
                              <div className='flex text-xs text-gray-500'>
                                {nft.collection_name}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.users.length > 0 && (
                      <div className='p-2'>
                        <h3 className='text-sm font-semibold mb-1'>Users</h3>
                        {searchResults.users.map((user) => (
                          <Link
                            key={user.id}
                            href={`/${user.username}`}
                            className='flex items-center hover:bg-gray-100 p-2 rounded'
                            onClick={() => {
                              setShowResults(false)
                              setSearchTerm('')
                              setSearchResults({ nfts: [], users: [] })
                            }}
                          >
                            {/* eslint-disable-next-line */}
                            <img
                              src={
                                process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                                user.profile_pic_url
                              }
                              className='w-8 h-8 rounded-full'
                            />
                            <div className='ml-2'>{user.username}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.nfts.length === 0 &&
                      searchResults.users.length === 0 &&
                      searchTerm.length > 0 && (
                        <div className='p-4 text-center text-gray-500'>No results found</div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {isMobile ? (
          <button onClick={toggleMenu} className='p-2'>
            <Hamburger className='w-8' />
          </button>
        ) : loading ? (
          <div className='flex gap-x-2 h-[44px] relative mr-2 w-[150px]' />
        ) : (
          <div className='flex gap-x-2 h-[44px] relative mr-2'>{renderButtons()}</div>
        )}
      </nav>
      {isMobile && isMenuOpen && (
        <div className='fixed inset-0 bg-white z-[60] flex flex-col'>
          <div className='flex justify-end p-4'>
            <button onClick={toggleMenu} className='p-2'>
              <Close className='w-8 h-8' />
            </button>
          </div>
          <div className='flex-1 flex flex-col px-7 items-end'>{renderButtons(true)}</div>
          <div className='p-4 text-center text-sm text-gray-500'>
            <p>© TFT Labs</p>
            <div className='mt-2 space-x-2'>
              <Link
                href='/about'
                onClick={() => {
                  toggleMenu()
                }}
              >
                About
              </Link>
              <Link
                href='/legal/terms'
                onClick={() => {
                  toggleMenu()
                }}
              >
                Terms
              </Link>
              <Link
                href='/legal/privacy'
                onClick={() => {
                  toggleMenu()
                }}
              >
                Privacy
              </Link>
              <Link href={DISCORD_LINK} target='_blank'>
                Discord
              </Link>
            </div>
          </div>
        </div>
      )}
      {modal === 'login' && <LoginModal closeModal={() => setModal(false)} />}
      {modal === 'onboard' && <OnboardModal closeModal={() => setModal(false)} />}
    </>
  )
}

export default Navbar
