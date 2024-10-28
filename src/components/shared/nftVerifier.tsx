import React, { useEffect, useState } from 'react'
import { useSignMessage } from 'wagmi'

import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'
import { verifyNFTs } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

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
        CHAIN_IDS_TO_CHAINS[group.chainId as keyof typeof CHAIN_IDS_TO_CHAINS]
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
        <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='p-4 max-h-[80vh] overflow-y-auto'>
      {verifyError && (
        <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
          <p>
            {verifyError === 'Verification failed'
              ? 'Verification failed. Please ensure your wallet is connected and try again.'
              : 'Error verifying NFTs. Please try again.'}
          </p>
        </div>
      )}
      {nftGroups.length === 0 ? (
        <p className='text-center text-gray-600'>No NFTs to verify.</p>
      ) : (
        <div className='space-y-2'>
          {nftGroups.map((group, index) => {
            const groupKey = `${group.chainId}-${group.walletAddress}`
            const isVerified = verifiedGroups.includes(groupKey)
            const isVerifying = verifying === groupKey

            return (
              <div
                key={index}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm'
              >
                <div className='flex flex-col flex-grow gap-y-1'>
                  <p className='font-medium'>
                    {CHAIN_IDS_TO_CHAINS[group.chainId as keyof typeof CHAIN_IDS_TO_CHAINS]}
                  </p>
                  <p className='text-gray-500 font-mono'>{`${group.walletAddress}`}</p>
                  <p className='text-gray-500'>
                    {group.nfts.length} NFT{group.nfts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleVerify(group)}
                  disabled={isVerifying || isVerified}
                  className={`px-3 py-1 rounded text-white font-medium text-sm transition-colors
                    ${
                      isVerifying
                        ? 'bg-blue-400 cursor-not-allowed'
                        : isVerified
                          ? 'bg-green-500 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  {isVerifying ? 'Verifying...' : isVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
            )
          })}
          <div className='mt-2 pl-4 py-3 pr-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r text-sm'>
            If you&apos;ve moved any NFTs to a different wallet, simply add the NFT again and
            the wallet info will refresh.
          </div>
        </div>
      )}
      {verifiedGroups.length === nftGroups.length && nftGroups.length > 0 && (
        <div className='mt-4 text-center'>
          <p className='text-green-600 font-medium mb-2'>All NFTs verified successfully!</p>
          <button
            onClick={onComplete}
            className='px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors'
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export default NftVerifier
