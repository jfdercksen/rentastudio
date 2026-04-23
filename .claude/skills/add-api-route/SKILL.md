---
name: add-api-route
description: Add a new validated API route to Kyalami Studio. Use when adding backend endpoints for the booking engine, admin operations, or any server-side data operations.
argument-hint: [route-path] [GET|POST|PUT|DELETE]
allowed-tools: Read, Write, Edit, Bash
---

# Add API Route — Kyalami Studio

Adding API route: $ARGUMENTS

## Live Context

Existing API routes: !`find src/app/api -name "route.ts" 2>/dev/null | head -20 || echo "No API routes yet"`

## Instructions

Create `src/app/api/[route-path]/route.ts`.

### Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// Define Zod schema for request body (for POST/PUT)
const RequestSchema = z.object({
  // Define expected fields
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // For admin-only routes, verify auth:
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
    
    // Your logic here
    
    return NextResponse.json({ data: null })
  } catch (error) {
    console.error('[route-name] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const supabase = await createServerClient()
    // Your logic here
    
    return NextResponse.json({ data: null }, { status: 201 })
  } catch (error) {
    console.error('[route-name] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
```

### Rules for This File

- Validate ALL inputs with Zod before any database operations
- Use consistent error shape: `{ error: string, code: string }`
- Admin-only routes must call `supabase.auth.getUser()` server-side before processing
- Never log sensitive data (passphrase, service role key, banking details)
- The PayFast ITN route is special — it always returns 200 (see `/api/payfast/itn/route.ts`)
- Use `createServerClient()` (cookie-based, authenticated) not `createBrowserClient()`

After creating: confirm the endpoint URL and methods implemented.
