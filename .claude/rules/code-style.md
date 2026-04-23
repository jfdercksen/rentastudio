# Code Style — Kyalami Studio

Applies to all files in this project.

## Naming Conventions

- **Components:** PascalCase — `BookingForm.tsx`, `PricingCard.tsx`
- **Utilities/lib:** camelCase — `buildPayFastSignature.ts`, `sendConfirmation.ts`
- **API routes:** kebab-case directories — `api/payfast/itn/`, `api/booking-slots/`
- **Database columns:** snake_case — `booking_date`, `client_email`, `total_amount`
- **TypeScript types:** PascalCase — `BookingStatus`, `PricingRow`, `AddOnItem`
- **Zod schemas:** PascalCase with Schema suffix — `BookingSchema`, `ITNPayloadSchema`
- **CSS classes:** Tailwind utilities only (no custom class names except brand tokens)

## File Organisation

- One component per file. No barrel files with multiple exports.
- Component file exports default. Utility files export named functions.
- Types for a module live in the same file or in `src/types/[domain].ts`
- Database-generated types live only in `src/types/database.ts` — do not copy or re-export them

## TypeScript Conventions

- Strict mode enforced. No `any` types in source files.
- Use `interface` for object shapes, `type` for unions and primitives.
- Always type function return values explicitly for API handlers and utilities.
- Zod inference: `type BookingInput = z.infer<typeof BookingSchema>` (don't duplicate the type)
- Async functions always use `async/await`, never `.then()` chains.

## Import Order

1. React and Next.js
2. Third-party packages (Supabase, Zod, Resend)
3. Internal `@/lib/` imports
4. Internal `@/components/` imports
5. Internal `@/types/` imports
6. Relative imports

## Forbidden Patterns

- No `console.log` in production code — use `console.error` for errors only
- No `// @ts-ignore` or `// @ts-nocheck`
- No `!` non-null assertions without a comment explaining why it's safe
- No `var` — use `const` or `let`
- No default exports from utility files — named exports only
- No importing server utilities in client components
