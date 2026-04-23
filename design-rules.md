# Design Rules — Kyalami Studio

Brand extracted from the existing HTML concept. Match this exactly.

---

## Brand Tokens

### Colours

```css
--brand-cream: #F5F0E8;        /* Page background */
--brand-gold: #C8A96E;         /* Primary accent, CTAs, borders */
--brand-emerald: #2D6A4F;      /* Secondary accent, success states */
--brand-terracotta: #C4622D;   /* Tertiary accent, highlights */
--brand-charcoal: #1A1A1A;     /* Primary text */
--brand-white: #FFFFFF;        /* Cards, modals, contrast surfaces */
--brand-warm-grey: #8B8B8B;    /* Muted text, labels */
--brand-light-gold: #E8D5A3;   /* Hover states on gold */
```

### Tailwind Config (add to tailwind.config.ts)

```typescript
colors: {
  brand: {
    cream: '#F5F0E8',
    gold: '#C8A96E',
    'light-gold': '#E8D5A3',
    emerald: '#2D6A4F',
    terracotta: '#C4622D',
    charcoal: '#1A1A1A',
    'warm-grey': '#8B8B8B',
  }
}
```

---

## Typography

### Fonts

| Role | Font | CSS Var | Tailwind Class | Use |
|---|---|---|---|---|
| Display / Headlines | Fraunces | `--font-fraunces` | `font-display` | H1, H2, hero text, section titles |
| Body | Inter | `--font-inter` | `font-body` | Paragraphs, descriptions, form labels |
| Labels / Mono | IBM Plex Mono | `--font-mono` | `font-mono` | Price tags, time slots, booking IDs, tags |

### Type Scale (from HTML)

```css
/* Hero headline */
font-size: clamp(2.5rem, 5vw, 4.5rem);
font-family: Fraunces;
font-weight: 300;
letter-spacing: -0.02em;
line-height: 1.1;

/* Section title */
font-size: clamp(2rem, 3vw, 3rem);
font-family: Fraunces;
font-weight: 300;

/* Body text */
font-size: 1rem;
font-family: Inter;
line-height: 1.7;
color: #1A1A1A;

/* Price display */
font-size: 1.5rem;
font-family: IBM Plex Mono;
font-weight: 400;
color: #C8A96E;

/* Label / Tag */
font-size: 0.75rem;
font-family: IBM Plex Mono;
letter-spacing: 0.1em;
text-transform: uppercase;
```

---

## Component Style Patterns

### CTA Button (Primary — Book Now)

```
background: #1A1A1A
color: #F5F0E8
border: 1px solid #C8A96E
padding: 1rem 2rem
font: IBM Plex Mono, uppercase, tracking-widest
hover: background #C8A96E, color #1A1A1A
transition: all 0.3s ease
```

### CTA Button (Secondary — Outline)

```
background: transparent
color: #1A1A1A
border: 1px solid #C8A96E
hover: background rgba(200,169,110,0.1)
```

### Card / Section Panel

```
background: #FFFFFF
border: 1px solid rgba(200,169,110,0.2)
border-radius: 2px (minimal — editorial aesthetic)
padding: 2rem
```

### Section Divider

```
border-top: 1px solid rgba(200,169,110,0.3)
```

### Price Tag

```
font: IBM Plex Mono
color: #C8A96E
Display format: R 550 / hour (space after R)
```

### Status Badge

```
Confirmed: background #2D6A4F, color white
Pending: background #C8A96E, color #1A1A1A
Cancelled: background #8B8B8B, color white
No-show: background #C4622D, color white
```

---

## Layout Principles

### Mobile-First

- Base styles are for mobile (375px)
- Tablet breakpoint: `md:` (768px)
- Desktop breakpoint: `lg:` (1280px)
- Max content width: `max-w-7xl` (1280px) with `mx-auto px-4 md:px-8`

### Section Spacing

```
Section padding: py-20 md:py-28
Section gap between: gap-16 md:gap-24
```

### Grid System

```
Public site: single column mobile → 2-col md → 3-col lg where appropriate
Pricing cards: 1-col → 2-col → 3-col
Equipment grid: 1-col → 2-col → 4-col
Admin dashboard: sidebar nav + main content area
```

---

## Tone and Copy Rules

- **Heading style:** Sentence case, not Title Case. e.g. "Book your session" not "Book Your Session"
- **Brand voice:** Premium, confident, direct. Not casual. Not corporate.
- **Pricing copy:** Always show "From R550 / hour" with the slash space format
- **Booking copy:** "Confirm booking" not "Submit" or "Pay now"
- **Error messages:** Clear and actionable. "This date is unavailable — please select another" not "Error 422"
- **Empty states:** Friendly. "No bookings found for this date" not "No results"

---

## Image Guidelines

- Gallery images: 16:9 ratio preferred, min 1200px wide, WebP format
- Hero: full-width, high contrast — text overlay requires dark gradient or very dark image
- Equipment images: square or 4:3, white/neutral background preferred
- Upload to Supabase Storage `gallery` bucket, serve via Supabase Storage URL

---

## Accessibility Standards

- All interactive elements have visible focus rings (`focus-visible:ring-2 focus-visible:ring-brand-gold`)
- Colour contrast: all text on `brand-cream` background meets WCAG AA (4.5:1 minimum)
- Form inputs have associated labels (not just placeholders)
- Booking confirmation and error states are announced to screen readers via `aria-live`
- Images have descriptive `alt` text

---

## Admin Dashboard Design

- Background: `#F5F0E8` (same brand cream) for visual consistency
- Sidebar: `#1A1A1A` background with `#C8A96E` active states
- Tables: clean white cards, alternating row shading optional
- Actions (cancel, no-show): require a confirmation modal before executing
- Status badges follow the colour system above

---

## Reference

The original HTML concept file is at `c:\Users\darli\Downloads\kyalami-studio-site.html`.
Use it as the visual reference for every public-facing section. The Next.js implementation must match it closely.
