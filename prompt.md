# Frontend Prompt — Smart Notifications Dashboard

## Project Overview
Build a modern, impressive Next.js dashboard for the **Smart Notifications Engine**. The UI should look enterprise‑grade, clean, and fast. It must visualize overdue invoices, risk levels, and notification actions.

## Tech Requirements
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- UI library (choose one: shadcn/ui, Radix UI, or Mantine)
- Responsive: Desktop / Tablet / Mobile

## API Endpoints (Backend)
Base URL: `http://localhost:8091`
- `GET /dashboard/overdue` → list overdue invoices
- `GET /dashboard/stats` → KPI stats
- `POST /scan` → triggers scan

## Pages
### 1) `/dashboard` (Main)
**Header**
- Title: “Smart Notifications”
- Subtitle: “ERPNext Overdue Intelligence”
- Primary button: **Scan Now** → calls `POST /scan` then refreshes data

**KPI Cards (4)**
- Overdue Invoices
- High‑Risk Count
- Notifications Sent Today
- Failed Notifications

**Filters**
- Customer (text search)
- Risk Level (All / High / Medium / Low)
- Days Overdue (range slider or min/max)

**Overdue Table**
Columns:
- Invoice ID
- Customer
- Days Overdue
- Amount
- History Count
- Risk Level (colored badge)
- Channels (chips: SMS / Email)
- Status (sent / skipped / failed)

**Row Details Drawer (optional but impressive)**
- Clicking a row opens a side drawer with:
  - Decision reason
  - Last notified timestamp
  - Suggested next action

## Design Direction
- Clean, premium fintech look
- Light background with card elevation
- Risk badges: HIGH=red, MEDIUM=orange, LOW=green
- Use subtle gradients in header
- Use icons for KPIs
- Make the table visually elegant with hover states

## Data Handling
- Use `fetch` or `axios` in a server action or client component
- On `Scan Now`, show loading state and toast
- Empty states: show “No overdue invoices found”

## Testing (Playwright)
Create tests for:
1) **Journey Test**: open dashboard → click Scan Now → table renders rows.
2) **Component Test**: Risk badge renders correct color for HIGH/MEDIUM/LOW.
3) Multi‑browser + multi‑resolution (Chrome/Firefox, desktop/tablet/mobile).

## Extra (optional but impressive)
- Sparkline chart for overdue counts over time
- Theme toggle (light/dark)

## Output
Generate a complete Next.js project with the above UI and tests.
