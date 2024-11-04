import React, { useEffect, useState } from 'react'

import TransactionCard from '@/components/transaction'
import { useTradeStatuses } from '@/hooks'
import { TxModalInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'

const TransactionFeed: React.FC<{
  items: TransactionData[]
  setTxModalInfo: (modalInfo: TxModalInfo) => void
}> = ({ items, setTxModalInfo }) => {
  const { getStatuses } = useTradeStatuses()
  const [statusMap, setStatusMap] = useState<Map<string | number, any>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchNewStatuses = async () => {
      // Get IDs of new, incomplete transactions
      const newTradeIds = items
        .filter((item) => !item.onchain_done && !statusMap.has(item.onchain_trade_id))
        .map((item) => item.onchain_trade_id)
        .filter(Boolean)

      if (newTradeIds.length === 0) return

      setIsLoading(true)
      try {
        console.log('newTradeIds', newTradeIds)
        const newStatuses = await getStatuses(newTradeIds)

        console.log('newStatuses', newStatuses)

        // Update status map with new results
        const newMap = new Map(statusMap)
        newStatuses.forEach((status, id) => {
          if (status.info) {
            newMap.set(id, status.info)
          }
        })

        setStatusMap(newMap)
      } catch (error) {
        console.error('Error fetching trade statuses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewStatuses()
  }, [items, getStatuses])

  return (
    <>
      <div className='mt-2 pl-4 py-3 pr-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r text-sm'>
        Onchain transactions
        {isLoading && <span className='ml-2 text-yellow-600'>(Loading new statuses...)</span>}
      </div>

      {items.map((item) => (
        <TransactionCard
          key={item.offer_id}
          transaction={item}
          onchainInfo={!item.onchain_done ? statusMap.get(item.onchain_trade_id) : undefined}
          showTxModal={() => {
            const txModalInfo = {
              offerId: item.offer_id,
              onchain: {
                id: item.onchain_trade_id,
                hash: item.onchain_tx,
                done: item.onchain_done,
              },
              chainId: item.chain_id,
              users: {
                creator: {
                  id: item.creator_id,
                  username: item.creator_username,
                  profile_pic_url: item.creator_profile_pic_url,
                  wallet: item.creator_wallet,
                },
                counterparty: {
                  id: item.counterparty_id,
                  username: item.counterparty_username,
                  profile_pic_url: item.counterparty_profile_pic_url,
                  wallet: item.counterparty_wallet,
                },
              },
              assets: {
                creator: item.counterparty_assets,
                counterparty: item.creator_assets,
              },
            }
            setTxModalInfo(txModalInfo)
          }}
        />
      ))}
    </>
  )
}

export default TransactionFeed
