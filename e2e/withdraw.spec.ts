import { test, expect } from '@playwright/test'

test.describe('Withdraw E2E', () => {
  test('complete withdrawal flow', async ({ page }) => {
    await page.goto('/withdraw')

    // Check page loaded
    await expect(page.getByRole('heading', { name: /withdraw usdt/i })).toBeVisible()

    // Fill form
    await page.getByLabel(/amount/i).fill('150.75')
    await page.getByLabel(/destination/i).fill('0xE2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2')
    await page.getByLabel(/confirm/i).check()

    // Submit
    await page.getByRole('button', { name: /submit withdrawal/i }).click()

    // Wait for success
    await expect(page.getByText(/submitted successfully/i)).toBeVisible({ timeout: 5000 })

    // Verify details displayed
    await expect(page.getByText(/150.75 USDT/i)).toBeVisible()
    await expect(page.getByText(/0xE2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2E2/i)).toBeVisible()
    await expect(page.getByText(/pending/i)).toBeVisible()
  })

  test('form validation', async ({ page }) => {
    await page.goto('/withdraw')

    const submitButton = page.getByRole('button', { name: /submit withdrawal/i })

    // Submit button should be disabled initially
    await expect(submitButton).toBeDisabled()

    // Enter invalid amount
    await page.getByLabel(/amount/i).fill('0')
    await page.getByLabel(/amount/i).blur()
    await expect(page.getByText(/amount must be greater than 0/i)).toBeVisible()

    // Fix amount
    await page.getByLabel(/amount/i).fill('50')
    await page.getByLabel(/destination/i).fill('0x123')

    // Still disabled without confirmation
    await expect(submitButton).toBeDisabled()

    // Check confirmation
    await page.getByLabel(/confirm/i).check()

    // Now enabled
    await expect(submitButton).toBeEnabled()
  })
})
