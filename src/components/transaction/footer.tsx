import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

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
        <div>trade completed</div>
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
