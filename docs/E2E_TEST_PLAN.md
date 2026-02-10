# E2E Test Plan (Playwright + POM)

## Scope
- Validate full user journeys using real backend + ERPNext data.
- Run on Chromium and Firefox.
- Run across Desktop, Tablet, and Mobile viewports.

## Preconditions
- Backend running and exposed to GitHub Actions via ngrok.
- `NGROK_URL` provided to CI workflow.
- ERPNext contains deterministic overdue invoices.

## Journeys
1. **Dashboard load**
   - Open dashboard URL
   - Verify KPI cards render
2. **Scan and refresh**
   - Click `Scan Now`
   - Verify table is refreshed
3. **Filter high-risk invoices**
   - Select `High` risk
   - Verify filtered rows contain HIGH badges

## Cross-Browser/Device Matrix
- Chromium: Desktop / Tablet / Mobile
- Firefox: Desktop / Tablet / Mobile

## Stability Guidelines
- Use `data-testid` selectors.
- Avoid timing-based waits; use Playwright `expect`.
- No mock ERPNext data.

## Assertion Style (Course-Aligned)
```ts
import { expect } from "@playwright/test";

await expect(page).toHaveTitle(/Smart Notifications/);
await expect(page.getByTestId("overdue-table")).toBeVisible();
```
