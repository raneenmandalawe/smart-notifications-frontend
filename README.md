# Smart Notifications Frontend

Next.js dashboard for overdue invoice intelligence. The UI consumes real backend data, which is sourced from ERPNext (no mock mode).

## Requirements
- Node.js 18+
- Python 3.9+ (for UI tests)
- Backend running and reachable

## Setup
1. Install dependencies:
	- `npm install`
2. Configure API base:
	- `.env.local` → `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8091`
3. Install Python UI testing dependencies:
	- `cd .. && source .venv/bin/activate`
	- `pip install -r smart-notifications-frontend/requirements-ui-tests.txt`
	- `playwright install chromium`

## Run
```bash
npm run dev -- --port 3001
```

Open http://localhost:3001/dashboard

## UI Testing with Python + Playwright (POM)

UI tests בפייתון עם Page Object Model pattern.

### Quick Start
```bash
# Activate virtual environment
cd /Users/raneenmandalawi/Desktop/smart-notifications-erpnext
source .venv/bin/activate

# Run all UI tests
cd smart-notifications-frontend
npm run test:ui

# Run with browser visible
npm run test:ui:headed

# Run with slow motion for debugging
npm run test:ui:slow

# Or run directly with pytest
pytest tests/ui/ -v
HEADLESS=false pytest tests/ui/ -v
```

### Manual Pytest Commands
```bash
# Activate environment first
source ../.venv/bin/activate

# Run all tests
python -m pytest tests/ui/ -v

# Run specific test class
python -m pytest tests/ui/test_dashboard.py::TestDashboardUI -v

# Run single test
python -m pytest tests/ui/test_dashboard.py::TestDashboardUI::test_dashboard_page_loads -v

# Debug mode with Playwright inspector
PWDEBUG=1 pytest tests/ui/test_dashboard.py
```

📖 **Full UI testing guide:** See [tests/ui/README.md](./tests/ui/README.md)

## Documentation
- `docs/UI_FLOWS.md`
- `docs/COMPONENT_TEST_PLAN.md`
- `docs/E2E_TEST_PLAN.md`
- `docs/CI_PIPELINE.md`
- `docs/ALLURE.md`
- **`docs/NGROK_SETUP.md`** - הגדרת Ngrok להרצת טסטים ב-CI
