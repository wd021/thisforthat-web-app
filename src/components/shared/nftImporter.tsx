import React, { FC, useCallback, useState } from 'react'
import { getAddress, isAddress } from 'viem'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

import { NFTImage } from '@/components/shared'
import { NFTUpload } from '@/types/supabase'
import { getNFTFromUrl, getNFTsForWallet } from '@/utils/apis'
import { CHAIN_LABELS, SUPPORTED_CHAINS } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

import LoadingIndicator from './loadingIndicator'

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

type SearchMode = 'wallet' | 'link'

const NftImporter: FC<{
  displaySkipOption?: boolean
  onComplete: () => void
}> = ({ displaySkipOption = true, onComplete }) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('wallet')
  const [currentWallet, setCurrentWallet] = useState<string>('')
  const [nftLink, setNftLink] = useState<string>('')
  const [currentChain, setCurrentChain] = useState<
    'ethereum' | 'eth' | 'base' | 'arbitrum' | 'optimism' | 'polygon' | 'matic' | 'zksync'
  >('ethereum')
  const [nfts, setNfts] = useState<NFTUpload[]>([])
  const [nextPageKey, setNextPageKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resolvingEns, setResolvingEns] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [selectedNfts, setSelectedNfts] = useState<NFTUpload[]>([])
  const [uploadingNfts, setIsUploadingNfts] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const resolveAddress = useCallback(async (input: string): Promise<string> => {
    if (isAddress(input)) {
      return getAddress(input) // Normalize the address
    }

    if (input.endsWith('.eth')) {
      setResolvingEns(true)
      try {
        const normalized = normalize(input)
        const address = await publicClient.getEnsAddress({
          name: normalized,
        })
        if (!address) throw new Error('ENS name not found')
        return address
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new Error('Failed to resolve ENS name')
      } finally {
        setResolvingEns(false)
      }
    }

    throw new Error('Invalid address or ENS name')
  }, [])

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
          if (nft) {
            setNfts([nft])
          }
          setNextPageKey(null)
        } else {
          // Resolve address before proceeding
          const walletAddress = await resolveAddress(currentWallet)

          if (isInitialSearch) {
            setNfts([])
            setNextPageKey(null)
          }

          let newNfts: NFTUpload[] = []
          const result = await getNFTsForWallet(currentChain, walletAddress, nextPageKey)
          newNfts = result.nfts
          setNextPageKey(result.pageKey)
          setNfts((prev) => (isInitialSearch ? newNfts : [...prev, ...newNfts]))
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch NFTs')
      } finally {
        setIsLoading(false)
      }
    },
    [searchMode, currentChain, nextPageKey, resolveAddress, nftLink, currentWallet],
  )

  const handleSearch = () => handleFetch(true)
  const handleLoadMore = () => handleFetch(false)

  const toggleNftSelection = (nft: NFTUpload) => {
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const nftsToUpload = selectedNfts.map(({ id, ...rest }) => ({
        ...rest,
        user_id: userId,
      }))

      // Upload NFTs, ignoring duplicates
      const { data: initialUpsert, error: nftError } = await supabase
        .from('nfts')
        .upsert(nftsToUpload, {
          onConflict: 'chain_id,collection_contract,token_id',
          ignoreDuplicates: true,
        })
        .select()

      if (nftError) throw nftError

      let upsertedNfts = initialUpsert || []

      // Check if we got back fewer records than we tried to upload
      if (upsertedNfts.length < nftsToUpload.length) {
        // Find the records that weren't returned in initialUpsert
        const missingNfts = nftsToUpload.filter(
          (uploadNft) =>
            !upsertedNfts.some(
              (upserted) =>
                upserted.chain_id === uploadNft.chain_id &&
                upserted.collection_contract === uploadNft.collection_contract &&
                upserted.token_id === uploadNft.token_id,
            ),
        )

        // Fetch the existing records for the missing NFTs
        const { data: existingNfts } = await supabase
          .from('nfts')
          .select()
          .in(
            'chain_id',
            missingNfts.map((nft) => nft.chain_id),
          )
          .in(
            'collection_contract',
            missingNfts.map((nft) => nft.collection_contract),
          )
          .in(
            'token_id',
            missingNfts.map((nft) => nft.token_id),
          )

        upsertedNfts = [...upsertedNfts, ...(existingNfts || [])]
      }

      // Create user_nfts entries directly from selectedNfts and upsertedNfts
      const userNftUpsertData = selectedNfts.map((nft) => ({
        user_id: userId,
        nft_id: upsertedNfts!.find(
          (inserted) =>
            inserted.chain_id === nft.chain_id &&
            inserted.collection_contract === nft.collection_contract &&
            inserted.token_id === nft.token_id,
        )?.id,
        wallet_address: nft.wallet_address,
      }))

      // Upsert to user_nfts, updating wallet_address on conflict
      const { error: userNftError } = await supabase
        .from('user_nfts')
        .upsert(userNftUpsertData, {
          onConflict: 'user_id,nft_id',
          ignoreDuplicates: false, // Set to false so we can update wallet_address
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
              </div>
              <div className='w-full sm:w-32'>
                <select
                  value={currentChain}
                  onChange={(e) =>
                    setCurrentChain(
                      e.target.value as
                        | 'ethereum'
                        | 'eth'
                        | 'base'
                        | 'arbitrum'
                        | 'optimism'
                        | 'polygon'
                        | 'matic'
                        | 'zksync',
                    )
                  }
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
            disabled={isLoading || resolvingEns}
            className='w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading || resolvingEns ? (
              <div className='flex items-center justify-center'>
                <LoadingIndicator className='!w-4 !h-4 border-white !border-[2px]' />
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
      <div className='flex-grow overflow-y-auto custom-scrollbar min-h-0'>
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
            <LoadingIndicator />
          </div>
        ) : nfts.length > 0 ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4'>
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
                    <NFTImage src={nft.image} alt={nft.name} fallback={nft.name} />
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
                  <div className='p-2'>
                    <h3 className='text-xs font-medium text-gray-900 truncate'>{nft.name}</h3>
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
              <LoadingIndicator className='!w-4 !h-4 border-white !border-[2px] mr-2' />
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

export default NftImporter
