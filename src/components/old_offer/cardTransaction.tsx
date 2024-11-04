import React, { useState } from 'react'

interface NFTAsset {
  nft_id: string
  name: string
  image: string
  chain_id: number
  collection_name: string
  token_id: string
  is_deposited?: boolean
}

interface TransactionOfferData {
  offer_id: string
  creator_id: string
  creator_username: string
  creator_profile_pic_url: string
  creator_assets: NFTAsset[]
  creator_assets_deposited: number
  counterparty_id: string
  counterparty_username: string
  counterparty_profile_pic_url: string
  counterparty_assets: NFTAsset[]
  counterparty_assets_deposited: number
  chain_id: number
  contract_address: string
}

interface AssetSection {
  isExpanded: boolean
  assets: NFTAsset[]
  username: string
  totalAssets: number
  depositedAssets: number
  isCurrentUser: boolean
}

const Icons = {
  ExternalLink: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
      />
    </svg>
  ),
  Lock: () => (
    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      />
    </svg>
  ),
  ChevronDown: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
    </svg>
  ),
  ChevronUp: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
    </svg>
  ),
  ChevronRight: () => (
    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
    </svg>
  ),
}

const MinifiedAssetPreview = ({ assets }: { assets: NFTAsset[] }) => (
  <div className='flex -space-x-2'>
    {assets.slice(0, 3).map((asset) => (
      <div
        key={asset.nft_id}
        className='w-8 h-8 rounded-lg overflow-hidden border-2 border-white'
      >
        <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
      </div>
    ))}
    {assets.length > 3 && (
      <div className='w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600'>
        +{assets.length - 3}
      </div>
    )}
  </div>
)

const UserAssetPreview: React.FC<{
  username: string
  profilePicUrl: string
  assets: NFTAsset[]
  deposited: number
  total: number
  isRightAligned?: boolean
}> = ({ username, profilePicUrl, assets, deposited, total, isRightAligned }) => {
  const containerClasses = isRightAligned ? 'text-right' : ''
  const profileClasses = isRightAligned
    ? 'flex items-center justify-end space-x-2 mb-2'
    : 'flex items-center space-x-2 mb-2'

  return (
    <div className={containerClasses}>
      <div className={profileClasses}>
        {!isRightAligned && (
          <>
            <div className='w-5 h-5 rounded-full overflow-hidden'>
              <img src={profilePicUrl} alt={username} className='w-full h-full object-cover' />
            </div>
            <span className='text-sm font-medium'>{username}</span>
          </>
        )}
        {isRightAligned && (
          <>
            <span className='text-sm font-medium'>{username}</span>
            <div className='w-5 h-5 rounded-full overflow-hidden'>
              <img src={profilePicUrl} alt={username} className='w-full h-full object-cover' />
            </div>
          </>
        )}
      </div>
      <div className='flex space-x-1'>
        {assets.map((asset, index) => (
          <div
            key={asset.nft_id}
            className='w-12 h-12 rounded-lg overflow-hidden border border-gray-200'
          >
            <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
          </div>
        ))}
      </div>
      <div className='mt-1.5 text-xs text-gray-500'>
        {deposited} of {total} deposited
      </div>
    </div>
  )
}

const ProgressBar = ({ completed, total }: { completed: number; total: number }) => (
  <div className='w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
    <div className='h-full bg-blue-500' style={{ width: `${(completed / total) * 100}%` }} />
  </div>
)

const ChainInfo: React.FC<{ chainId: number; contractAddress: string }> = ({
  chainId,
  contractAddress,
}) => {
  const getExplorerUrl = (chainId: number, address: string) => {
    const explorers = {
      1: `https://etherscan.io/address/${address}`,
      137: `https://polygonscan.com/address/${address}`,
      // Add other chains as needed
    }
    return explorers[chainId] || '#'
  }

  const getChainName = (chainId: number) => {
    const chains = {
      1: 'Ethereum',
      137: 'Polygon',
      // Add other chains as needed
    }
    return chains[chainId] || 'Unknown Chain'
  }

  return (
    <div className='flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm'>
      <span className='text-gray-600'>{getChainName(chainId)}</span>
      <a
        href={getExplorerUrl(chainId, contractAddress)}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center space-x-1 text-blue-500 hover:text-blue-600'
      >
        <span>View Contract</span>
        <Icons.ExternalLink />
      </a>
    </div>
  )
}

const DepositProgress: React.FC<{
  username: string
  totalAssets: number
  depositedAssets: number
  isCurrentUser: boolean
  onDeposit: () => void
}> = ({ username, totalAssets, depositedAssets, isCurrentUser, onDeposit }) => (
  <div className='flex items-center justify-between p-3 rounded-lg border border-gray-200'>
    <div className='flex items-center space-x-3'>
      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500'>
        <Icons.Lock />
      </div>
      <div>
        <div className='text-sm font-medium'>{username}</div>
        <div className='text-xs text-gray-500'>
          {depositedAssets} of {totalAssets} assets deposited
        </div>
      </div>
    </div>
    {isCurrentUser && depositedAssets < totalAssets && (
      <button
        onClick={onDeposit}
        className='px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors'
      >
        Deposit Assets
      </button>
    )}
    {!isCurrentUser && (
      <div className='text-sm text-gray-500'>
        {depositedAssets === totalAssets ? 'Completed' : 'Waiting'}
      </div>
    )}
  </div>
)

const NFTList: React.FC<{ assets: NFTAsset[] }> = ({ assets }) => (
  <div className='flex flex-wrap gap-2'>
    {assets.map((asset) => (
      <div
        key={asset.nft_id}
        className={`relative rounded-lg overflow-hidden w-12 h-12 
          ${asset.is_deposited ? 'opacity-50' : ''}`}
      >
        <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
        {asset.is_deposited && (
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30'>
            <Icons.Lock className='text-white' />
          </div>
        )}
      </div>
    ))}
  </div>
)

const AssetOverview: React.FC<{
  assets: NFTAsset[]
  isExpanded: boolean
  onToggle: () => void
}> = ({ assets, isExpanded, onToggle }) => (
  <div className='space-y-2'>
    {!isExpanded ? (
      <div className='flex items-center space-x-2'>
        {assets.slice(0, 3).map((asset) => (
          <div key={asset.nft_id} className='relative w-10 h-10 rounded-lg overflow-hidden'>
            <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
          </div>
        ))}
        {assets.length > 3 && (
          <div className='text-sm text-gray-500'>+{assets.length - 3} more</div>
        )}
      </div>
    ) : (
      <div className='space-y-2'>
        {assets.map((asset) => (
          <div
            key={asset.nft_id}
            className='flex items-center space-x-3 p-2 bg-gray-50 rounded-lg'
          >
            <div className='relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0'>
              <img src={asset.image} alt={asset.name} className='w-full h-full object-cover' />
              {asset.is_deposited && (
                <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30'>
                  <Icons.Lock className='text-white' />
                </div>
              )}
            </div>
            <div className='flex-grow min-w-0'>
              <div className='text-sm font-medium truncate'>{asset.name}</div>
              <div className='text-xs text-gray-500'>{asset.collection_name}</div>
            </div>
            {asset.is_deposited && (
              <span className='text-xs text-green-600 font-medium'>Deposited</span>
            )}
          </div>
        ))}
      </div>
    )}
    <button
      onClick={onToggle}
      className='text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1'
    >
      <span>{isExpanded ? 'Show less' : 'Show all'}</span>
      {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
    </button>
  </div>
)

const DepositSection: React.FC<{
  section: AssetSection
  onDeposit: () => void
  onToggle: () => void
}> = ({ section, onDeposit, onToggle }) => (
  <div className='p-4 rounded-lg border border-gray-200 space-y-3'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500'>
          <Icons.Lock />
        </div>
        <div>
          <div className='text-sm font-medium'>{section.username}</div>
          <div className='text-xs text-gray-500'>
            {section.depositedAssets} of {section.totalAssets} assets deposited
          </div>
        </div>
      </div>
      {section.isCurrentUser && section.depositedAssets < section.totalAssets && (
        <button
          onClick={onDeposit}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors'
        >
          Deposit Assets
        </button>
      )}
      {!section.isCurrentUser && (
        <div className='text-sm text-gray-500'>
          {section.depositedAssets === section.totalAssets ? 'Completed' : 'Waiting'}
        </div>
      )}
    </div>

    <AssetOverview
      assets={section.assets}
      isExpanded={section.isExpanded}
      onToggle={onToggle}
    />
  </div>
)

const TransactionOfferCard: React.FC<{
  offer: TransactionOfferData
  currentUserId: string
  onDeposit: () => void
}> = ({ offer, currentUserId, onDeposit }) => {
  const [creatorExpanded, setCreatorExpanded] = useState(false)
  const [counterpartyExpanded, setCounterpartyExpanded] = useState(false)

  const creatorSection: AssetSection = {
    isExpanded: creatorExpanded,
    assets: offer.creator_assets,
    username: offer.creator_username,
    totalAssets: offer.creator_assets.length,
    depositedAssets: offer.creator_assets_deposited,
    isCurrentUser: currentUserId === offer.creator_id,
  }

  const counterpartySection: AssetSection = {
    isExpanded: counterpartyExpanded,
    assets: offer.counterparty_assets,
    username: offer.counterparty_username,
    totalAssets: offer.counterparty_assets.length,
    depositedAssets: offer.counterparty_assets_deposited,
    isCurrentUser: currentUserId === offer.counterparty_id,
  }

  return (
    <div className='w-full bg-white rounded-xl shadow-sm p-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Complete Your Swap</h3>
          <p className='text-sm text-gray-600'>
            Both parties need to deposit their assets to complete the swap
          </p>
        </div>
        <a
          href={`/transaction/${offer.offer_id}`}
          target='_blank'
          rel='noopener noreferrer'
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <Icons.ExternalLink />
        </a>
      </div>

      <ChainInfo chainId={offer.chain_id} contractAddress={offer.contract_address} />

      <div className='space-y-3'>
        <DepositSection
          section={creatorSection}
          onDeposit={onDeposit}
          onToggle={() => setCreatorExpanded(!creatorExpanded)}
        />
        <DepositSection
          section={counterpartySection}
          onDeposit={onDeposit}
          onToggle={() => setCounterpartyExpanded(!counterpartyExpanded)}
        />
      </div>

      <div className='p-3 bg-blue-50 rounded-lg text-sm text-blue-600 flex items-center space-x-2'>
        <Icons.Lock />
        <span>Assets will be held securely until both parties complete their deposits</span>
      </div>

      <div className='text-xs text-gray-500'>
        This swap is secured by a smart contract. Assets will be exchanged automatically once
        both deposits are complete.
      </div>
    </div>
  )
}
const CompactTransactionCard: React.FC<{
  offer: TransactionOfferData
  currentUserId: string
  onDeposit: () => void
}> = ({ offer, currentUserId, onDeposit }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isExpanded) {
    return (
      <div className='relative'>
        <button
          onClick={() => setIsExpanded(false)}
          className='absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10'
        >
          <Icons.ChevronUp />
        </button>
        <TransactionOfferCard
          offer={offer}
          currentUserId={currentUserId}
          onDeposit={onDeposit}
        />
      </div>
    )
  }

  const totalAssetsRequired = offer.creator_assets.length + offer.counterparty_assets.length
  const totalAssetsDeposited =
    offer.creator_assets_deposited + offer.counterparty_assets_deposited
  const progressPercentage = (totalAssetsDeposited / totalAssetsRequired) * 100

  const isCreatorDeposited = offer.creator_assets_deposited === offer.creator_assets.length
  const isCounterpartyDeposited =
    offer.counterparty_assets_deposited === offer.counterparty_assets.length

  const needsDeposit =
    (currentUserId === offer.creator_id && !isCreatorDeposited) ||
    (currentUserId === offer.counterparty_id && !isCounterpartyDeposited)

  return (
    <div className='w-full bg-white rounded-xl shadow-sm p-4 relative'>
      {/* Header Section */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500'>
            <Icons.Lock />
          </div>
          <div className='flex'>
            <div className='flex items-center'>
              <h3 className='text-sm font-medium'>NFT Swap</h3>
              <span className='text-xs text-gray-500'>#{offer.offer_id.slice(0, 8)}</span>
            </div>
            <a
              href={`/offer/${offer.offer_id}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs text-blue-500 hover:text-blue-600 flex items-center space-x-1 mt-0.5'
            >
              <span>Offer</span>
              <Icons.ExternalLink />
              <span>Contract</span>
              <Icons.ExternalLink />
            </a>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <Icons.ChevronDown />
        </button>
      </div>

      {/* Users Section */}
      {/* <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-5 h-5 rounded-full overflow-hidden'>
            <img
              src={offer.creator_profile_pic_url}
              alt={offer.creator_username}
              className='w-full h-full object-cover'
            />
          </div>
          <span className='text-sm font-medium'>{offer.creator_username}</span>
          {isCreatorDeposited && (
            <span className='text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full'>
              Ready
            </span>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          {isCounterpartyDeposited && (
            <span className='text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full'>
              Ready
            </span>
          )}
          <span className='text-sm font-medium'>{offer.counterparty_username}</span>
          <div className='w-5 h-5 rounded-full overflow-hidden'>
            <img
              src={offer.counterparty_profile_pic_url}
              alt={offer.counterparty_username}
              className='w-full h-full object-cover'
            />
          </div>
        </div>
      </div> */}

      {/* Offer Preview Section */}
      <div className='bg-gray-50 rounded-lg p-3 mb-6'>
        <div className='flex items-center justify-between'>
          <div className='flex space-x-2'>
            {offer.creator_assets.map((asset) => (
              <div
                key={asset.nft_id}
                className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0'
              >
                <img
                  src={asset.image}
                  alt={asset.name}
                  className='w-full h-full object-cover'
                />
              </div>
            ))}
            <span className='text-xs text-gray-500 self-end ml-1'>
              {offer.creator_assets_deposited} of {offer.creator_assets.length}
            </span>
          </div>

          <div className='bg-white/80 shadow-sm border border-gray-100 rounded-full p-1.5'>
            {/* <ArrowRightLeft size={16} className='text-gray-400' /> */}
          </div>

          <div className='flex space-x-2'>
            {offer.counterparty_assets.map((asset) => (
              <div
                key={asset.nft_id}
                className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0'
              >
                <img
                  src={asset.image}
                  alt={asset.name}
                  className='w-full h-full object-cover'
                />
              </div>
            ))}
            <span className='text-xs text-gray-500 self-end ml-1'>
              {offer.counterparty_assets_deposited} of {offer.counterparty_assets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar and Action */}
      <div className='border-t pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1 mr-8 max-w-[300px]'>
            <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-blue-500 transition-all duration-500'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className='flex justify-between mt-2'>
              <span className='text-xs text-gray-500'>Progress</span>
              <span className='text-xs text-gray-500'>
                {totalAssetsDeposited} of {totalAssetsRequired} assets deposited
              </span>
            </div>
          </div>
          {needsDeposit ? (
            <button
              onClick={onDeposit}
              className='px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0'
            >
              Deposit Your Assets
            </button>
          ) : (
            <div className='text-sm text-gray-500 flex-shrink-0'>
              {progressPercentage === 100 ? 'All assets deposited' : 'Waiting for other party'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompactTransactionCard
