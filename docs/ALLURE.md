# Allure Reporting

## Purpose
Allure provides rich test reporting for E2E and component tests.

## Generation
- Playwright tests produce Allure results during CI.
- Results are uploaded as CI artifacts.

## Publishing
- The workflow can publish Allure reports to GitHub Pages or as artifacts.

## Notes
- Reports reflect real environment runs via `NGROK_URL`.
- No mock ERPNext data is used in E2E.
