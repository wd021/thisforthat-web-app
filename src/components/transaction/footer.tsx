import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

const StatusMessage: React.FC<{
  status: string
  showTxModal: () => void
}> = ({ status, showTxModal }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'onchain_completed':
        return {
          message: `completed`,
          className: 'text-green-700 bg-green-50',
        }
      case 'onchain_cancelled':
        return {
          message: `cancelled`,
          className: 'text-red-700 bg-red-50',
        }
      default:
        return {
          message: '',
          className: 'text-gray-700 bg-gray-50',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${config.className}`}
      onClick={showTxModal}
    >
      <span className='text-sm font-semibold'>{config.message}</span>
      {(status === 'countered' || status === 'countered-open') && (
        <svg
          className='text-blue-700'
          fill='none'
          height='14'
          width='14'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <line x1='7' x2='17' y1='17' y2='7' />
          <polyline points='7 7 17 7 17 17' />
        </svg>
      )}
    </div>
  )
}

const Footer = ({
  transaction,
  onchainInfo,
  showTxModal,
}: {
  transaction: TransactionData
  onchainInfo: OnchainTradeInfo
  showTxModal: () => void
}) => {
  const tradeStarted = transaction.onchain_trade_id ? true : false
  const tradeEnded = transaction.onchain_done ? true : false

  const onchainActive = onchainInfo
    ? onchainInfo.totalAssetCount !== onchainInfo.depositedAssetCount && onchainInfo.isActive
      ? true
      : false
    : undefined
  const onchainCancelled = onchainInfo
    ? !onchainInfo.isActive &&
      onchainInfo.totalAssetCount !== 0 &&
      onchainInfo.totalAssetCount !== onchainInfo.depositedAssetCount
      ? true
      : false
    : undefined

  return (
    <div className='flex items-center justify-between'>
      <div className='flex-1 mr-8 max-w-[300px]'>
        {tradeStarted && onchainActive && !onchainCancelled && (
          <>
            <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-blue-500 transition-all duration-500'
                style={{
                  width: `${(onchainInfo.depositedAssetCount / onchainInfo.totalAssetCount) * 100}%`,
                }}
              />
            </div>
            <div className='flex justify-between mt-2'>
              <span className='text-xs text-gray-500'>Progress</span>
              <span className='text-xs text-gray-500'>
                {onchainInfo.depositedAssetCount} of {onchainInfo.totalAssetCount} assets
                deposited
              </span>
            </div>
          </>
        )}
      </div>

      {tradeEnded || onchainCancelled ? (
        <StatusMessage status={transaction.status} showTxModal={showTxModal} />
      ) : !tradeStarted ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            showTxModal()
          }}
          className='flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors'
        >
          Create Trade
        </button>
      ) : onchainActive ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            showTxModal()
          }}
          className='flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors'
        >
          Deposit NFTs
        </button>
      ) : null}
    </div>
  )
}

export default Footer
