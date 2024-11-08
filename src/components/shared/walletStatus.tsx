import { useModal } from 'connectkit'
import { useAccount, useChainId, useDisconnect } from 'wagmi'

import { PowerOff, Wallet } from '@/icons'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'
import { trimAddress } from '@/utils/helpers'

interface WalletStatusProps {
  className?: string
}

export default function WalletStatus({ className = '' }: WalletStatusProps) {
  const chainId = useChainId()
  const { setOpen } = useModal()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()

  return (
    <div
      className={`p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 cursor-pointer ${className}`}
      onClick={() => {
        if (isConnected) {
          disconnect()
        } else {
          setOpen(true)
        }
      }}
    >
      <div className='flex items-center'>
        <Wallet className='w-4 h-4 text-blue-500' />
        {isConnected ? (
          <>
            <span className='ml-2'>
              Connected to {trimAddress(address || '')} on{' '}
              {CHAIN_IDS_TO_CHAINS[chainId as keyof typeof CHAIN_IDS_TO_CHAINS]}
            </span>
            <PowerOff className='ml-auto w-4 h-4 text-blue-500' />
          </>
        ) : (
          <span className='ml-2'>Connect Wallet</span>
        )}
      </div>
    </div>
  )
}
