import React, { FC, useCallback, useState } from 'react'
import { isAddress } from 'viem'
import { useEnsAddress } from 'wagmi'

import { NFT } from '@/types/supabase'
import { getNFTFromUrl, getNFTsForWallet } from '@/utils/apis'
import { CHAIN_LABELS, SUPPORTED_CHAINS } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

interface NftSelectorProps {
  displaySkipOption?: boolean
  onComplete: () => void
}

type SearchMode = 'wallet' | 'link'

const NftSelector: FC<NftSelectorProps> = ({ displaySkipOption = true, onComplete }) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('wallet')
  const [currentWallet, setCurrentWallet] = useState<string>('')
  const [nftLink, setNftLink] = useState<string>('')
  const [currentChain, setCurrentChain] = useState<string>('ethereum')
  const [nfts, setNfts] = useState<NFT[]>([])
  const [nextPageKey, setNextPageKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([])
  const [uploadingNfts, setIsUploadingNfts] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const { data: ensAddress, isLoading: isResolvingEns } = useEnsAddress({
    name: currentWallet,
    query: {
      enabled: currentWallet.endsWith('.eth'),
    },
  })

  const resolveAddress = useCallback((): string => {
    if (isAddress(currentWallet)) return currentWallet
    if (ensAddress) return ensAddress
    throw new Error('Invalid address or unresolved ENS name')
  }, [currentWallet, ensAddress])

  const validateNftLink = (link: string): boolean => {
    const supportedPlatforms = ['opensea.io', 'blur.io', 'cryptopunks.app']
    try {
      const url = new URL(link)
      return supportedPlatforms.some((platform) => url.hostname.includes(platform))
    } catch {
      return false
    }
  }

  const handleFetch = useCallback(
    async (isInitialSearch: boolean = false) => {
      setIsLoading(true)
      setHasSearched(true)
      setError('')

      try {
        if (searchMode === 'link') {
          if (!validateNftLink(nftLink)) {
            throw new Error('Please enter a valid OpenSea, Blur, or CryptoPunks link')
          }
          const nft = await getNFTFromUrl(nftLink)
          setNfts([nft])
          setNextPageKey(null)
        } else {
          const walletAddress = resolveAddress()
          if (isInitialSearch) {
            setNfts([])
            setNextPageKey(null)
          }

          let newNfts: NFT[] = []
          if (nextPageKey === null && currentChain === 'ethereum') {
            // const [punks, results] = await Promise.all([
            //   // getCryptoPunksforWallet(currentChain, walletAddress),
            //   getNFTsForWallet(currentChain, walletAddress, nextPageKey),
            // ])
            const result = await getNFTsForWallet(currentChain, walletAddress, nextPageKey)
            newNfts = result.nfts
            setNextPageKey(result.pageKey)
          } else {
            const results = await getNFTsForWallet(currentChain, walletAddress, nextPageKey)
            newNfts = results.nfts
            setNextPageKey(results.pageKey)
          }

          setNfts((prev) => (isInitialSearch ? newNfts : [...prev, ...newNfts]))
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch NFTs')
      } finally {
        setIsLoading(false)
      }
    },
    [searchMode, currentChain, nextPageKey, resolveAddress, nftLink],
  )

  const handleSearch = () => handleFetch(true)
  const handleLoadMore = () => handleFetch(false)

  const toggleNftSelection = (nft: NFT) => {
    setSelectedNfts((prev) =>
      prev.some((item) => item.id === nft.id)
        ? prev.filter((item) => item.id !== nft.id)
        : [...prev, nft],
    )
  }

  const uploadNFTs = async () => {
    try {
      setIsUploadingNfts(true)

      const userId = (await supabase.auth.getSession()).data.session?.user.id
      if (!userId) throw new Error('User session not found')

      const nftsToUpload = selectedNfts.map(({ id, possible_spam, ...rest }) => ({
        ...rest,
        user_id: userId,
      }))

      const { data: upsertedNfts, error: nftError } = await supabase
        .from('nfts')
        .upsert(nftsToUpload, {
          onConflict: 'chain_id,collection_contract,token_id',
          ignoreDuplicates: true,
        })
        .select()

      if (nftError) throw nftError

      const userNftUpsertData = upsertedNfts!.map((nft) => ({
        user_id: userId,
        nft_id: nft.id,
      }))

      const { error: userNftError } = await supabase
        .from('user_nfts')
        .upsert(userNftUpsertData, {
          onConflict: 'user_id,nft_id',
          ignoreDuplicates: true,
        })

      if (userNftError) throw userNftError

      onComplete()
    } catch (error) {
      console.error('Error uploading NFTs:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload NFTs')
    } finally {
      setIsUploadingNfts(false)
    }
  }

  return (
    <div className='flex flex-col w-full space-y-6'>
      {/* Search Mode Tabs */}
      <div className='flex rounded-lg bg-gray-100 p-1'>
        <button
          onClick={() => setSearchMode('wallet')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            searchMode === 'wallet'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Search by Wallet
        </button>
        <button
          onClick={() => setSearchMode('link')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            searchMode === 'link'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Search by Link
        </button>
      </div>

      <div className='space-y-4'>
        {/* Search Inputs */}
        <div className='flex flex-col sm:flex-row gap-3'>
          {searchMode === 'link' ? (
            <div className='flex-grow'>
              <input
                type='text'
                placeholder='Paste OpenSea, Blur, or CryptoPunk link'
                value={nftLink}
                onChange={(e) => setNftLink(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          ) : (
            <>
              <div className='flex-grow'>
                <input
                  type='text'
                  placeholder='Enter wallet or ENS address'
                  value={currentWallet}
                  onChange={(e) => setCurrentWallet(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                {isResolvingEns && (
                  <span className='mt-1 text-xs text-gray-500'>Resolving ENS...</span>
                )}
              </div>
              <div className='w-full sm:w-32'>
                <select
                  value={currentChain}
                  onChange={(e) => setCurrentChain(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white'
                >
                  {SUPPORTED_CHAINS.filter(
                    (chain, index, self) => index === self.findIndex((t) => t === chain),
                  ).map((chain) => (
                    <option key={chain} value={chain}>
                      {CHAIN_LABELS[chain as keyof typeof CHAIN_LABELS]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button
            onClick={handleSearch}
            disabled={isLoading || isResolvingEns}
            className='w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin' />
                <span className='ml-2'>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}
      </div>

      {/* NFT Grid */}
      <div className='flex-grow overflow-y-auto min-h-0'>
        {!hasSearched ? (
          <div className='flex flex-col items-center justify-center h-64 text-gray-500'>
            <div className='mb-4'>
              <svg
                className='w-16 h-16 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
            <p className='text-center text-lg'>
              {searchMode === 'wallet'
                ? 'Enter a wallet or ENS address to view NFTs'
                : 'Paste a link from OpenSea, Blur, or CryptoPunks'}
            </p>
          </div>
        ) : isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin' />
          </div>
        ) : nfts.length > 0 ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
              {nfts.map((nft) => (
                <div
                  key={nft.id}
                  onClick={() => toggleNftSelection(nft)}
                  className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedNfts.some((item) => item.id === nft.id)
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-lg border border-gray-200'
                  }`}
                >
                  <div className='relative aspect-square'>
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className='w-full h-full object-cover'
                      loading='lazy'
                    />
                    {nft.possible_spam && (
                      <div className='absolute top-0 left-0 right-0 bg-red-500 text-white text-xs py-1 px-2 text-center'>
                        Potential Spam
                      </div>
                    )}
                    {selectedNfts.some((item) => item.id === nft.id) && (
                      <div className='absolute top-2 right-2 bg-blue-500 rounded-full p-1.5'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className='p-3'>
                    <h3 className='text-sm font-medium text-gray-900 truncate'>{nft.name}</h3>
                    <p className='text-xs text-gray-500 mt-1 truncate'>{nft.collection_name}</p>
                  </div>
                </div>
              ))}
            </div>

            {nextPageKey && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className='w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        ) : (
          <div className='flex justify-center items-center h-64 text-gray-500'>
            No NFTs found
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className={`mt-6 flex flex-col-reverse sm:flex-row items-center gap-3 ${
          displaySkipOption ? 'sm:justify-between' : 'sm:justify-end'
        }`}
      >
        {displaySkipOption && (
          <button
            onClick={onComplete}
            className='w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center'
          >
            Skip For Now
          </button>
        )}
        <button
          onClick={uploadNFTs}
          disabled={selectedNfts.length === 0 || uploadingNfts}
          className='w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {uploadingNfts ? (
            <div className='flex items-center justify-center'>
              <div className='w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2' />
              <span>Uploading...</span>
            </div>
          ) : (
            `Import ${selectedNfts.length} NFT${selectedNfts.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  )
}

export default NftSelector
