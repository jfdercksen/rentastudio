---
name: add-component
description: Create a new typed React component for Kyalami Studio following the project's brand and code conventions. Use when adding a new UI element to the public site or admin dashboard.
argument-hint: [ComponentName] [public|admin]
allowed-tools: Read, Write, Edit, Bash
---

# Add Component — Kyalami Studio

Creating component: $ARGUMENTS

## Live Context

Existing components: !`ls src/components/public/ 2>/dev/null && ls src/components/admin/ 2>/dev/null || echo "No components directory yet"`

## Instructions

Parse the argument: ComponentName is the first word, location (public|admin) is the second (default: public).

Create the component at:
- Public: `src/components/public/[ComponentName].tsx`
- Admin: `src/components/admin/[ComponentName].tsx`

### Component Template

```tsx
'use client' // Only add if component needs interactivity/hooks

import type { FC } from 'react'

interface [ComponentName]Props {
  // Define props here
}

const [ComponentName]: FC<[ComponentName]Props> = ({ /* props */ }) => {
  return (
    <div className="[tailwind classes using brand tokens]">
      {/* Component content */}
    </div>
  )
}

export default [ComponentName]
```

### Brand Token Checklist

When styling this component:
- Background colour: `bg-brand-cream` or `bg-white`
- Accent colour: `text-brand-gold` or `border-brand-gold`
- Primary text: `text-brand-charcoal`
- Headlines: `font-display` (Fraunces)
- Body text: `font-body` (Inter)
- Price labels: `font-mono` (IBM Plex Mono)
- CTA buttons: `bg-brand-charcoal text-brand-cream border border-brand-gold hover:bg-brand-gold hover:text-brand-charcoal transition-all duration-300`

### Rules

- Use TypeScript with explicit prop types (no `any`)
- Add `'use client'` only if the component needs useState, useEffect, or event handlers
- Mobile-first: base styles for 375px, then `md:` and `lg:` overrides
- Export as default
- No inline styles except for dynamic values

After creating, confirm: "Component created at [path]. Import it with: `import [ComponentName] from '@/components/[location]/[ComponentName]'`"
