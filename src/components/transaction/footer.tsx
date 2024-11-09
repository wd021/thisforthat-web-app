import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

const StatusMessage: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'onchain_completed':
        return {
          message: `completed`,
          className: 'text-green-700 bg-green-100',
        }
      case 'onchain_cancelled':
        return {
          message: `cancelled`,
          className: 'text-red-700 bg-red-100',
        }
      default:
        return {
          message: '',
          className: 'text-gray-700 bg-gray-100',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${config.className}`}>
      <span className='text-sm font-semibold'>{config.message}</span>
    </div>
  )
}

const Footer = ({
  transaction,
  onchainInfo,
  showTxModal,
  showTxCancelModal,
}: {
  transaction: TransactionData
  onchainInfo: OnchainTradeInfo
  showTxModal: () => void
  showTxCancelModal: () => void
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
        {tradeStarted && onchainActive && !onchainCancelled && !tradeEnded && (
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
                {onchainInfo.depositedAssetCount} of {onchainInfo.totalAssetCount} NFTs
                deposited
              </span>
            </div>
          </>
        )}
      </div>

      {tradeEnded || onchainCancelled ? (
        <StatusMessage status={transaction.status} />
      ) : !tradeStarted ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            showTxModal()
          }}
          className='flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors'
        >
          Create Contract
        </button>
      ) : onchainActive ? (
        <div className='flex gap-x-2'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              showTxCancelModal()
            }}
            className='flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              showTxModal()
            }}
            className='flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors'
          >
            Deposit
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default Footer
