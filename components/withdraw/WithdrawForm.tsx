'use client'

import { useState, useCallback, useMemo } from 'react'
import { useWithdrawStore } from '@/lib/store/withdrawStore'
import { withdrawalFormSchema } from '@/lib/types/withdrawal'

export function WithdrawForm() {
  const { submitWithdrawal, status, error, isSubmitting } = useWithdrawStore()

  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [touched, setTouched] = useState({
    amount: false,
    destination: false,
    confirm: false,
  })

  // Validate form using Zod schema
  const validation = useMemo(() => {
    const result = withdrawalFormSchema.safeParse({
      amount: amount ? parseFloat(amount) : 0,
      destination,
      confirm,
    })

    if (result.success) {
      return { isValid: true, errors: {} }
    }

    const errors: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0].toString()] = err.message
      }
    })

    return { isValid: false, errors }
  }, [amount, destination, confirm])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Mark all fields as touched
      setTouched({ amount: true, destination: true, confirm: true })

      if (!validation.isValid) {
        return
      }

      await submitWithdrawal(parseFloat(amount), destination)
    },
    [amount, destination, validation.isValid, submitWithdrawal]
  )

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }, [])

  const isFormDisabled = status === 'loading' || isSubmitting

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="amount">
          Amount (USDT) <span style={{ color: '#e00' }}>*</span>
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
          disabled={isFormDisabled}
          className={touched.amount && validation.errors.amount ? 'error' : ''}
          placeholder="0.00"
          aria-invalid={touched.amount && !!validation.errors.amount}
          aria-describedby={touched.amount && validation.errors.amount ? 'amount-error' : undefined}
        />
        {touched.amount && validation.errors.amount && (
          <div id="amount-error" className="error-message" role="alert">
            {validation.errors.amount}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="destination">
          Destination Address <span style={{ color: '#e00' }}>*</span>
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, destination: true }))}
          disabled={isFormDisabled}
          className={touched.destination && validation.errors.destination ? 'error' : ''}
          placeholder="0x..."
          aria-invalid={touched.destination && !!validation.errors.destination}
          aria-describedby={touched.destination && validation.errors.destination ? 'destination-error' : undefined}
        />
        {touched.destination && validation.errors.destination && (
          <div id="destination-error" className="error-message" role="alert">
            {validation.errors.destination}
          </div>
        )}
      </div>

      <div className="form-group">
        <div className="checkbox-group">
          <input
            id="confirm"
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
            disabled={isFormDisabled}
            aria-invalid={touched.confirm && !!validation.errors.confirm}
            aria-describedby={touched.confirm && validation.errors.confirm ? 'confirm-error' : undefined}
          />
          <label htmlFor="confirm" style={{ marginBottom: 0 }}>
            I confirm this withdrawal is correct
          </label>
        </div>
        {touched.confirm && validation.errors.confirm && (
          <div id="confirm-error" className="error-message" role="alert">
            {validation.errors.confirm}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="button button-primary"
        disabled={!validation.isValid || isFormDisabled}
        aria-busy={isFormDisabled}
      >
        {isFormDisabled ? (
          <>
            <span className="loading" style={{ marginRight: '0.5rem' }} />
            Processing...
          </>
        ) : (
          'Submit Withdrawal'
        )}
      </button>
    </form>
  )
}
