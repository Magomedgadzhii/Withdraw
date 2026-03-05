'use client'

import { WithdrawForm } from '@/components/withdraw/WithdrawForm'
import { WithdrawStatus } from '@/components/withdraw/WithdrawStatus'
import { useWithdrawStore } from '@/lib/store/withdrawStore'

export default function WithdrawPage() {
  const { withdrawal, status } = useWithdrawStore()

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>
          Withdraw USDT
        </h1>
        
        {status === 'success' && withdrawal ? (
          <WithdrawStatus withdrawal={withdrawal} />
        ) : (
          <WithdrawForm />
        )}
      </div>
    </div>
  )
}
