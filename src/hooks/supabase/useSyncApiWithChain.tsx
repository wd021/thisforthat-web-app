import { useCallback, useEffect, useMemo, useState } from 'react'

import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'
import { completeTradeWithApi } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

function useSyncApiWithChain(
  onchainInfo: OnchainTradeInfo,
  transaction: {
    offer_id: string
    onchain_done: boolean
  },
) {
  const [fetched, setFetched] = useState<boolean>(false)

  const syncApiWithChain = useMemo(
    () => Boolean(onchainInfo?.isActive === false && transaction && !transaction.onchain_done),
    [onchainInfo?.isActive, transaction],
  )

  const completeTrade = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('User token not found')
      }

      console.log('sync?')
      // TODO - update feed item status
      await completeTradeWithApi(transaction.offer_id, token)
    } catch (err) {}

    setFetched(true)
  }, [transaction.offer_id])

  useEffect(() => {
    if (syncApiWithChain && !fetched) {
      completeTrade()
    }
  }, [syncApiWithChain, fetched, completeTrade])

  return null
}

export default useSyncApiWithChain
