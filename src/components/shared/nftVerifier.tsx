import React, { useEffect, useState } from 'react'
import { useSignMessage } from 'wagmi'

import { Verified } from '@/icons'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'
import { verifyNFTs } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

import LoadingIndicator from './loadingIndicator'

interface VerifyNFTProps {
  onComplete: () => void
}

interface NFTGroup {
  chainId: string
  walletAddress: string
  nfts: any[]
}

const NftVerifier: React.FC<VerifyNFTProps> = ({ onComplete }) => {
  const { signMessageAsync } = useSignMessage()
  const [nftGroups, setNftGroups] = useState<NFTGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifiedGroups, setVerifiedGroups] = useState<string[]>([])

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
        .select(`id, user_id, nft_id, nfts: nfts!inner (chain_id, wallet_address)`)
        .eq('user_id', userId)
        .eq('nfts.is_verified', false)

      if (error) throw error

      const groupedNfts = data.reduce((acc: { [key: string]: NFTGroup }, item: any) => {
        const key = `${item.nfts.chain_id}-${item.nfts.wallet_address}`
        if (!acc[key]) {
          acc[key] = {
            chainId: item.nfts.chain_id,
            walletAddress: item.nfts.wallet_address,
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

  const handleVerify = async (group: NFTGroup) => {
    const groupKey = `${group.chainId}-${group.walletAddress}`
    setVerifying(groupKey)
    setVerifyError(null)

    try {
      const message = `Verify ownership of NFTs for wallet ${group.walletAddress} on ${
        CHAIN_IDS_TO_CHAINS[group.chainId as unknown as keyof typeof CHAIN_IDS_TO_CHAINS]
      }`
      const signature = await signMessageAsync({ message })
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (!token) throw new Error('User token not found')

      const response = await verifyNFTs(group.walletAddress, group.chainId, signature, token)

      if (response.error) {
        setVerifyError(response.error)
      } else {
        setVerifiedGroups((prev) => [...prev, groupKey])
      }
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : String(error))
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingIndicator />
      </div>
    )
  }

  return (
    <div className='space-y-4 p-4 max-h-[80vh] overflow-y-auto custom-scrollbar'>
      <div className='pl-4 py-2.5 pr-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-r text-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-20 h-20 flex items-center'>
            <Verified chainId={1} isVerified={true} />
          </div>
          <p>
            Verifying your NFTs lets other users know you're the confirmed owner. If you&apos;ve
            moved any NFTs to a different wallet, simply add the NFT again to refresh the
            wallet.
          </p>
        </div>
      </div>

      {verifyError && (
        <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
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
          <p>
            {verifyError === 'Verification failed'
              ? 'Please ensure your wallet is connected.'
              : 'Error verifying NFTs.'}
          </p>
        </div>
      )}

      {nftGroups.length === 0 ? (
        <div className='flex items-center justify-center py-8 text-gray-500'>
          <p>No NFTs to verify.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {nftGroups.map((group, index) => {
            const groupKey = `${group.chainId}-${group.walletAddress}`
            const isVerified = verifiedGroups.includes(groupKey)
            const isVerifying = verifying === groupKey

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isVerified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-blue-900 font-medium'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
                        />
                      </svg>
                      {CHAIN_IDS_TO_CHAINS[group.chainId as keyof typeof CHAIN_IDS_TO_CHAINS]}
                    </div>

                    <div className='flex items-center gap-2 text-gray-500'>
                      {/* Wallet icon */}
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                        />
                      </svg>
                      <code className='bg-gray-100 px-2 py-0.5 rounded text-sm'>
                        {group.walletAddress.slice(0, 10)}...{group.walletAddress.slice(-8)}
                      </code>
                    </div>

                    <div className='flex items-center gap-2 text-gray-500'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                        />
                      </svg>
                      <span className='text-sm'>
                        {group.nfts.length} NFT{group.nfts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerify(group)}
                    disabled={isVerifying || isVerified}
                    className={`
                      px-4 py-1.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                      ${
                        isVerifying
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : isVerified
                            ? 'bg-green-100 text-green-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                      }
                    `}
                  >
                    {isVerifying ? 'Verifying...' : isVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {verifiedGroups.length === nftGroups.length && nftGroups.length > 0 && (
        <div className='flex items-center justify-center gap-3 pt-4'>
          <p className='text-green-600 font-medium text-sm'>All NFTs verified successfully!</p>
          <button
            onClick={onComplete}
            className='px-4 py-1.5 bg-green-500 text-white text-sm rounded-lg font-medium 
                     hover:bg-green-600 transition-colors'
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export default NftVerifier
