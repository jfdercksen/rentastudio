---
paths:
  - "src/app/api/**"
---

# API Route Rules — Kyalami Studio

Applies to: all files in `src/app/api/`.

## Required Structure

Every API route must follow this structure:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 1. Define Zod schema for inputs
const Schema = z.object({ ... })

export async function POST(request: NextRequest) {
  try {
    // 2. Parse and validate input
    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // 3. Auth check (admin-only routes)
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })

    // 4. Business logic

    // 5. Return response
    return NextResponse.json({ data: result })

  } catch (error) {
    console.error('[route-name] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
```

## Error Response Standard

All error responses use this shape:
```typescript
{ error: string, code: string }

// codes used in this project:
'VALIDATION_ERROR'    // Zod validation failed
'AUTH_REQUIRED'       // No authenticated user
'FORBIDDEN'           // Authenticated but not authorized
'NOT_FOUND'           // Resource doesn't exist
'CONFLICT'            // Slot already booked
'INTERNAL_ERROR'      // Unexpected server error
```

## HTTP Status Codes

| Status | Use |
|---|---|
| 200 | Success (GET, ITN handler always) |
| 201 | Created successfully (POST creating a resource) |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (slot already booked) |
| 500 | Unexpected server error |

## Data Safety Rules

Public API routes (no auth required) must NEVER return:
- Banking details (`account_number`, `branch_code`, `bank_name`, `bank_holder_name`)
- ID document URLs (`id_document_url`)
- PayFast internal IDs
- Supabase user IDs

Use `select()` to explicitly choose which columns to return:
```typescript
// Good — explicit column selection
.select('id, booking_date, start_time, end_time, package_type, status')

// Dangerous — returns everything including sensitive fields
.select('*')
```

## Special Case: PayFast ITN Route

The `/api/payfast/itn` route does NOT follow the standard error structure. It always returns HTTP 200 with plain text body `'OK'`. This is intentional — see `src/app/api/payfast/itn/route.ts`.
