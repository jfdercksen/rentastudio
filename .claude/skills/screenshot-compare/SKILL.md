---
name: screenshot-compare
description: Take screenshots of Kyalami Studio pages at 375px, 768px, and 1280px and check for visual regressions or layout issues. Use after any UI changes before committing.
argument-hint: [route: / | /booking | /dashboard | all]
allowed-tools: Bash, Read, Write
---

# Screenshot Compare — Kyalami Studio

Taking screenshots of: $ARGUMENTS

## Live Context

Dev server status: !`curl -s http://localhost:3000/api/health 2>/dev/null && echo "Dev server running" || echo "Dev server NOT running — start with: npm run dev"`

## Instructions

If argument is empty or "all", screenshot all key routes. Otherwise screenshot the specified route.

### Routes to Screenshot

```
Public:  /  |  /booking  |  /booking/confirmed
Admin:   /login  |  /dashboard  |  /dashboard/bookings
```

### Breakpoints

| Name | Width | Height |
|---|---|---|
| Mobile | 375 | 812 |
| Tablet | 768 | 1024 |
| Desktop | 1280 | 800 |

### Screenshot Commands

```bash
# Install Playwright if not installed
npx playwright install chromium --with-deps 2>/dev/null

# Screenshot a page at all 3 breakpoints
# Replace [ROUTE] with the target route

npx playwright screenshot \
  --browser=chromium \
  --viewport-size="375,812" \
  "http://localhost:3000[ROUTE]" \
  "screenshots/mobile[ROUTE-slug].png"

npx playwright screenshot \
  --browser=chromium \
  --viewport-size="768,1024" \
  "http://localhost:3000[ROUTE]" \
  "screenshots/tablet[ROUTE-slug].png"

npx playwright screenshot \
  --browser=chromium \
  --viewport-size="1280,800" \
  "http://localhost:3000[ROUTE]" \
  "screenshots/desktop[ROUTE-slug].png"
```

### What to Check in Each Screenshot

**All breakpoints:**
- Background is cream `#F5F0E8` (not white, not grey)
- No horizontal scrollbar
- No text overflow or clipping
- Navigation visible and functional

**Mobile (375px) specific:**
- Booking form fields are full width and usable
- Pricing cards stack to single column
- Equipment grid is single column
- All CTAs are at least 44px tall (touch target)
- No tiny text (min 16px for body)

**Desktop (1280px) specific:**
- Pricing cards are 3-column
- Equipment grid is 4-column
- Hero text is at the correct large size (clamp 4.5rem)
- Sufficient whitespace between sections

## Output

For each screenshot taken:
1. Report: `[Route] @ [breakpoint]: PASS / ISSUE FOUND`
2. If issue found: describe exactly what's wrong and suggest the Tailwind fix
3. Summary: total issues found across all screenshots
