import React, { useEffect, useState } from 'react'
import { useModal } from 'connectkit'
import { useAccount, useChainId, useSignMessage } from 'wagmi'

import { LoadingIndicator, NFTImage, WalletStatus } from '@/components/shared'
import { ChainLogo, Checkmark, Verified, Wallet } from '@/icons'
import { CHAIN_IDS_TO_CHAINS, NFT_VERIFY_LIMIT, PUNK_VERIFY_LIMIT } from '@/utils/constants'
import { verifyNFTs } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

interface NFTGroup {
  chainId: string
  walletAddress: string
  nfts: any[]
}

interface VerificationResult {
  validVerifications: number
  punkVerifications: number
  limitReached: boolean
  punkLimitReached: boolean
  remainingVerifications: number
  remainingPunkVerifications: number
}

const SelectionLimitsInfo: React.FC<{ hasCryptoPunks: boolean }> = ({ hasCryptoPunks }) => (
  <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700'>
    <div className='flex items-center gap-2'>
      <div className='w-2 h-2 rounded-full bg-blue-500' />
      <span>You can verify up to {NFT_VERIFY_LIMIT} NFTs at once</span>
    </div>
    {hasCryptoPunks && (
      <div className='flex items-center gap-2 mt-2'>
        <div className='w-2 h-2 rounded-full bg-blue-500' />
        <span>Maximum {PUNK_VERIFY_LIMIT} CryptoPunks per verification</span>
      </div>
    )}
  </div>
)

const VerificationStatus: React.FC<{
  verifyError: string | null
}> = ({ verifyError }) => (
  <>
    <WalletStatus />
    {verifyError && (
      <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4'>
        <svg
          className='w-4 h-4 flex-shrink-0'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <span>{verifyError}</span>
      </div>
    )}
  </>
)

interface NFTGroup {
  chainId: number
  walletAddress: string
  nfts: any[] // Replace 'any' with your NFT type
}

interface ChainMapping {
  [key: number]: string
}

const NFTGroupSelection: React.FC<{
  nftGroups: NFTGroup[]
  handleGroupSelect: (group: NFTGroup) => void
  CHAIN_IDS_TO_CHAINS: ChainMapping
}> = ({ nftGroups, handleGroupSelect, CHAIN_IDS_TO_CHAINS }) => {
  return (
    <div className='space-y-2.5'>
      {nftGroups.map((group, index) => (
        <div
          key={index}
          className='group relative p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-50 cursor-pointer transition-all duration-200 ease-in-out'
          onClick={() => handleGroupSelect(group)}
        >
          <div className='flex items-center gap-5'>
            {/* Large Chain Logo */}
            <div className='w-12 h-12 flex-shrink-0'>
              <ChainLogo chainId={Number(group.chainId)} />
            </div>

            {/* Info Section */}
            <div className='flex-grow space-y-1'>
              {/* Chain Name */}
              <div className='text-gray-900 font-medium'>
                {
                  CHAIN_IDS_TO_CHAINS[
                    group.chainId as unknown as keyof typeof CHAIN_IDS_TO_CHAINS
                  ]
                }
              </div>

              {/* Wallet Address */}
              <div className='font-mono text-sm text-gray-500'>
                {group.walletAddress.slice(0, 10)}...{group.walletAddress.slice(-8)}
              </div>

              {/* NFT Count */}
              <div className='text-sm text-gray-500'>
                {group.nfts.length} NFT{group.nfts.length !== 1 ? 's' : ''} to verify
              </div>
            </div>

            {/* Arrow Icon */}
            <div className='flex-shrink-0 text-gray-400 group-hover:translate-x-0.5 transition-transform duration-200'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const NFTVerifier: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setOpen } = useModal()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const [nftGroups, setNftGroups] = useState<NFTGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<NFTGroup | null>(null)
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set())
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    setLoading(true)
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id
      if (!userId) throw new Error('User session not found')

      const { data, error } = await supabase
        .from('user_nfts')
        .select(`id, user_id, nft_id, wallet_address, nfts!inner(*)`)
        .eq('user_id', userId)

      if (error) throw error

      const groupedNfts = data.reduce((acc: { [key: string]: NFTGroup }, item: any) => {
        // Skip if the NFT is already verified by the current user
        if (item.nfts.is_verified && item.nfts.user_id === userId) {
          return acc
        }

        const key = `${item.nfts.chain_id}-${item.wallet_address}`
        if (!acc[key]) {
          acc[key] = {
            chainId: item.nfts.chain_id,
            walletAddress: item.wallet_address,
            nfts: [],
          }
        }
        acc[key].nfts.push(item.nfts)
        return acc
      }, {})

      setNftGroups(Object.values(groupedNfts))
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = (group: NFTGroup) => {
    setSelectedGroup(group)
    setSelectedNFTs(new Set())
    setVerificationResult(null)
    setVerifyError(null)
  }

  const handleNFTSelect = (nftId: string) => {
    const newSelected = new Set(selectedNFTs)
    if (selectedNFTs.has(nftId)) {
      newSelected.delete(nftId)
    } else {
      const selectedPunks = countSelectedByType('CRYPTOPUNK')
      const totalSelected = selectedNFTs.size
      const nft = selectedGroup?.nfts.find((n) => n.id === nftId)

      if (nft?.token_type === 'CRYPTOPUNK' && selectedPunks >= PUNK_VERIFY_LIMIT) {
        setVerifyError(`Cannot select more than ${PUNK_VERIFY_LIMIT} CryptoPunks at once`)
        return
      }
      if (totalSelected >= NFT_VERIFY_LIMIT) {
        setVerifyError(`Cannot select more than ${NFT_VERIFY_LIMIT} NFTs at once`)
        return
      }

      newSelected.add(nftId)
      setVerifyError(null)
    }
    setSelectedNFTs(newSelected)
  }

  const countSelectedByType = (type: string) => {
    if (!selectedGroup) return 0
    return Array.from(selectedNFTs).filter(
      (id) => selectedGroup.nfts.find((nft) => nft.id === id)?.token_type === type,
    ).length
  }

  const handleVerify = async () => {
    if (!selectedGroup) return
    if (!isConnected) {
      setOpen(true)
      return
    }

    setVerifying(true)
    setVerifyError(null)

    try {
      const message = `Verify ownership of NFTs for wallet ${selectedGroup.walletAddress} on ${
        CHAIN_IDS_TO_CHAINS[
          selectedGroup.chainId as unknown as keyof typeof CHAIN_IDS_TO_CHAINS
        ]
      }`

      const signature = await signMessageAsync({ message })
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (!token) throw new Error('User token not found')

      const response = await verifyNFTs(
        selectedGroup.walletAddress,
        selectedGroup.chainId,
        signature,
        Array.from(selectedNFTs),
        token,
      )

      if (response.error) {
        setVerifyError(
          typeof response.error === 'string' ? response.error : 'Verification failed.',
        )
      } else {
        setVerificationResult(response)
        await fetchNFTs()
      }
    } catch (error) {
      console.error('Error verifying NFTs:', error)
      setVerifyError(error instanceof Error ? error.message : 'Error verifying NFTs')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingIndicator />
      </div>
    )
  }

  if (verificationResult) {
    return (
      <div className='fixed inset-0 z-50'>
        {/* Backdrop */}
        <div className='absolute inset-0 bg-black/50 transition-opacity' onClick={onClose} />

        {/* Modal */}
        <div className='absolute inset-0 flex items-center justify-center p-4'>
          <div
            className='relative bg-white rounded-xl max-w-sm w-full p-6 text-center shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className='bg-green-50 p-4 rounded-full inline-block mb-4'>
              <Checkmark className='w-12 h-12 text-green-500' />
            </div>

            {/* Title */}
            <h3 className='text-lg font-semibold text-gray-900'>Verification Complete</h3>

            {/* Done Button */}
            <button
              onClick={onClose}
              className='mt-6 w-full p-3 bg-blue-500 text-white rounded-lg font-medium 
                     hover:bg-blue-600 transition-colors focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGroup) {
    const hasCryptoPunks = selectedGroup.nfts.some((nft) => nft.token_type === 'CRYPTOPUNK')

    return (
      <div className='relative flex flex-col h-full min-h-0'>
        {/* Fixed header */}
        <div className='flex-shrink-0 p-4 pb-0'>
          <SelectionLimitsInfo hasCryptoPunks={hasCryptoPunks} />
        </div>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {selectedGroup.nfts.map((nft) => (
              <div
                key={nft.id}
                className={`
                  relative border rounded-xl overflow-hidden cursor-pointer transition-all
                  ${selectedNFTs.has(nft.id) ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}
                `}
                onClick={() => handleNFTSelect(nft.id)}
              >
                <div className='aspect-square bg-gray-100'>
                  <NFTImage src={nft.image} alt={nft.name} fallback={nft.name} />
                </div>
                <div className='p-2 bg-white'>
                  <div className='text-xs font-medium truncate'>
                    {nft.name || `#${nft.token_id}`}
                  </div>
                  <div className='text-xs text-gray-500'>{nft.collection_name}</div>
                </div>
                {selectedNFTs.has(nft.id) && (
                  <div className='absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                    <Checkmark className='w-4 h-4 text-white' />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed footer */}
        <div className='flex-shrink-0 p-4 border-t bg-white md:rounded-b-lg'>
          <button
            onClick={handleVerify}
            disabled={verifying || selectedNFTs.size === 0}
            className={`
              w-full p-4 rounded-lg font-medium transition-all
              ${
                verifying || selectedNFTs.size === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {verifying ? (
              <span className='flex items-center justify-center gap-2'>
                <LoadingIndicator className='!w-4 !h-4 !border-[2px] !border-gray-300 !border-t-transparent' />
                Verifying...
              </span>
            ) : (
              `Verify ${selectedNFTs.size} NFT${selectedNFTs.size !== 1 ? 's' : ''}`
            )}
          </button>
          <div className='mt-3'>
            <VerificationStatus verifyError={verifyError} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='flex-1 overflow-y-auto custom-scrollbar p-4'>
        <div className='space-y-4'>
          <div className='p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r'>
            <div className='flex items-center gap-3'>
              <div className='w-20 h-20 flex items-center'>
                <Verified chainId={1} isVerified={true} />
              </div>
              <p className='text-blue-700'>
                Verifying your NFTs lets other users know you&apos;re the confirmed owner.
                Select a wallet to begin verification.
              </p>
            </div>
          </div>

          {nftGroups.length === 0 ? (
            <div className='flex items-center justify-center py-8 text-gray-500'>
              <p>No NFTs to verify.</p>
            </div>
          ) : (
            <div className='space-y-3'>
              <NFTGroupSelection
                nftGroups={nftGroups}
                handleGroupSelect={handleGroupSelect}
                CHAIN_IDS_TO_CHAINS={CHAIN_IDS_TO_CHAINS}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NFTVerifier
