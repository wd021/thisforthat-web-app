import { useCallback, useEffect, useMemo, useState } from 'react'
import { OnchainTradeInfo } from '@/types/main'
import { TransactionData } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

interface ConfirmTradeResponse {
  validVerifications: number
  error?: string
}

type ConfirmTradeStatus = 'idle' | 'confirming' | 'confirmed' | 'error'

function useConfirmTradeOnce(onchainInfo: OnchainTradeInfo, transaction: TransactionData) {
  const [status, setStatus] = useState<'idle' | 'confirming' | 'confirmed' | 'error'>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [validVerifications, setValidVerifications] = useState<number | null>(null)

  const isReadyToConfirm = useMemo(
    () =>
      onchainInfo.isActive === false &&
      onchainInfo?.depositedAssetCount === onchainInfo?.totalAssetCount &&
      !transaction.onchain_done,
    [
      onchainInfo.isActive,
      onchainInfo.depositedAssetCount,
      onchainInfo.totalAssetCount,
      transaction.onchain_done,
    ],
  )

  const confirmTrade = async () => {
    try {
      setStatus('confirming')

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('User token not found')
      }

      // Make API call
      const response = await fetch('/api/confirm-trade', {
        method: 'POST',
        body: JSON.stringify({ offer_id: transaction.offer_id }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to confirm trade')
      }

      const data: ConfirmTradeResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setValidVerifications(data.validVerifications)
      setStatus('confirmed')
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err : new Error('Failed to confirm trade'))
    }
  }

  useEffect(() => {
    if (isReadyToConfirm && status === 'idle') {
      confirmTrade()
    }
  }, [isReadyToConfirm, status])

  return {
    isReadyToConfirm,
    status,
    error,
    validVerifications,
    isConfirming: status === 'confirming',
    isConfirmed: status === 'confirmed',
    hasError: status === 'error',
    retry,
  }
}
