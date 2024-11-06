import { useCallback, useEffect, useMemo, useState } from 'react'

import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'
import { completeTradeWithApi } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

type ConfirmTradeStatus =
  | 'idle'
  | 'confirming'
  | 'confirm-completed'
  | 'confirm-cancelled'
  | 'error'

function useCompleteTrade(onchainInfo: OnchainTradeInfo, transaction: TransactionData) {
  const [status, setStatus] = useState<ConfirmTradeStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [validVerifications, setValidVerifications] = useState<number | null>(null)

  // Simplified isReadyToConfirm check based on new requirements
  const isReadyToConfirm = useMemo(
    () => Boolean(onchainInfo?.isActive === false && transaction && !transaction.onchain_done),
    [onchainInfo?.isActive, transaction],
  )

  console.log('isReadyToConfirm', isReadyToConfirm, transaction, onchainInfo)

  const completeTrade = useCallback(async () => {
    try {
      setStatus('confirming')

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('User token not found')
      }

      const result = await completeTradeWithApi(transaction.offer_id, token)

      if (result.error) {
        throw new Error(data.error)
      }

      setStatus(result.status)
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err : new Error('Failed to confirm trade'))
    }
  }, [transaction?.offer_id])

  useEffect(() => {
    if (isReadyToConfirm && status === 'idle') {
      completeTrade()
    }
  }, [isReadyToConfirm, status, completeTrade])

  return {
    isReadyToConfirm,
    status,
    error,
    validVerifications,
    isConfirming: status === 'confirming',
    isConfirmed: status === 'confirmed',
    hasError: status === 'error',
  }
}

export default useCompleteTrade
