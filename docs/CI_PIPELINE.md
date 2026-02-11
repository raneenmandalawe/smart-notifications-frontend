# Frontend CI Pipeline

## Overview
The frontend CI pipeline runs component and E2E tests using Playwright and publishes Allure results. The workflow file is `test.yml`.

## Stages
1. Checkout
2. Install dependencies
3. Install Playwright browsers
4. Validate `NGROK_URL` is reachable
5. Run Playwright tests in browser/device matrix
6. Generate Allure results
7. Upload Allure artifacts

## Browser/Device Matrix
- Chromium + Firefox
- Desktop / Tablet / Mobile viewports

## Environment Variables
- `NGROK_URL` (required): Base URL for E2E tests

## Notes
- CI must fail fast if `NGROK_URL` is missing or unreachable.
- Tests run against live backend + ERPNext data.
