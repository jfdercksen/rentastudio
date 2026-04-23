---
name: add-route
description: Add a new Next.js 15 App Router page to Kyalami Studio. Use when adding a new public page or admin dashboard section.
argument-hint: [route-path] [public|admin]
allowed-tools: Read, Write, Edit, Bash
---

# Add Route — Kyalami Studio

Adding route: $ARGUMENTS

## Live Context

Current routes: !`find src/app -name "page.tsx" 2>/dev/null | head -20 || echo "No app directory yet"`

## Instructions

Parse the argument: route path is the first argument, location (public|admin) is the second (default: public).

Create the page file at the correct location:
- Public route `/about` → `src/app/(public)/about/page.tsx`
- Admin route `/dashboard/reports` → `src/app/(admin)/dashboard/reports/page.tsx`

### Page Template (Server Component — default)

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '[Page Title] | Kyalami Studio',
  description: '[Page description for SEO]',
}

export default async function [PageName]Page() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <h1 className="font-display text-4xl text-brand-charcoal">
          [Page Title]
        </h1>
      </div>
    </main>
  )
}
```

### Next.js 15 Rules for This File

- Params and searchParams are Promises — always await them:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- Add a `loading.tsx` in the same directory for loading state
- Add an `error.tsx` for error boundaries on complex pages
- Admin pages do NOT need to check auth (handled by `(admin)/layout.tsx`)

After creating: confirm the file path and the route URL it creates.
