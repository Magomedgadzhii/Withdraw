'use client'

import { useWithdrawStore } from '@/lib/store/withdrawStore'
import type { Withdrawal } from '@/lib/types/withdrawal'

interface WithdrawStatusProps {
  withdrawal: Withdrawal
}

export function WithdrawStatus({ withdrawal }: WithdrawStatusProps) {
  const { reset } = useWithdrawStore()

  const statusClass = {
    pending: 'status-pending',
    completed: 'status-completed',
    failed: 'status-failed',
  }[withdrawal.status]

  const statusText = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
  }[withdrawal.status]

  return (
    <div>
      <div className="alert alert-success" role="status">
        Withdrawal request submitted successfully!
      </div>

      <div className="status-card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
          Withdrawal Details
        </h2>

        <div className="status-row">
          <span className="status-label">Transaction ID:</span>
          <span className="status-value" style={{ fontFamily: 'monospace' }}>
            {withdrawal.id}
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Amount:</span>
          <span className="status-value">
            {withdrawal.amount.toFixed(2)} USDT
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Destination:</span>
          <span
            className="status-value"
            style={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              wordBreak: 'break-all',
            }}
          >
            {withdrawal.destination}
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Status:</span>
          <span className={`status-badge ${statusClass}`}>{statusText}</span>
        </div>

        <div className="status-row">
          <span className="status-label">Created:</span>
          <span className="status-value">
            {new Date(withdrawal.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={reset}
        className="button button-secondary"
        style={{ marginTop: '1rem' }}
      >
        Make Another Withdrawal
      </button>
    </div>
  )
}
