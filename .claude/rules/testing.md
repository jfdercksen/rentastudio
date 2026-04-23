---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "__tests__/**"
---

# Testing Rules — Kyalami Studio

Applies to: all test files.

## Framework

Use Vitest. Import from `vitest`, not `jest`.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
```

## Mock Requirements

Always mock external services — never make real API calls in tests:

```typescript
// Mock Supabase
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
    }))
  }))
}))

// Mock Resend
vi.mock('@/lib/resend/send-confirmation', () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined)
}))
```

## Test Naming

Use descriptive `it()` names that read as requirements:
- `it('should reject ITN with invalid signature')`
- `it('should not confirm an already-confirmed booking')`
- `it('should include R750 deposit in PayFast total')`
- `it('should reject bookings for past dates')`

## Coverage Requirements

These files MUST have unit tests before shipping:
- `src/lib/payfast/signature.ts` — 100% branch coverage
- `src/lib/payfast/itn-handler.ts` — all verification branches
- `src/lib/validations/booking.ts` — valid and invalid inputs
- Price calculation logic — all package/duration/weekday combinations

## Test Data

PayFast test values (for signature tests):
```typescript
const TEST_MERCHANT_ID = '10000100'
const TEST_MERCHANT_KEY = '46f0cd694581a'
const TEST_PASSPHRASE = 'jt7NOE43FZPn'
```

Booking fixture:
```typescript
const mockBooking = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  client_name: 'Test Client',
  client_email: 'test@example.com',
  booking_date: '2026-05-01',
  start_time: '09:00',
  end_time: '13:00',
  package_type: 'all_inclusive',
  duration_type: 'half_day',
  is_weekday: true,
  add_ons: [],
  subtotal: 2500.00,
  deposit_amount: 750.00,
  total_amount: 3250.00,
  status: 'pending',
}
```

## File Location

Test files go alongside the file being tested:
- `src/lib/payfast/signature.ts` → `src/lib/payfast/__tests__/signature.test.ts`
- `src/app/api/payfast/itn/route.ts` → `src/app/api/payfast/itn/__tests__/route.test.ts`
