# UI Tests - Playwright + Page Object Model

טסטי UI עבור Smart Notifications Dashboard בשימוש Playwright ו-Page Object Model (POM) לפי החומר הנלמד.

## 📚 מבנה הפרויקט

```
tests/ui/
├── __init__.py
├── conftest.py                 # Pytest configuration
├── test_dashboard.py          # UI Tests
└── pages/                     # Page Objects
    ├── __init__.py
    ├── base_page.py          # Base class for all pages
    └── dashboard_page.py     # Dashboard Page Object + InvoiceRow component
```

## 🎯 מה זה Page Object Model (POM)?

POM הוא דפוס עיצוב שמפריד בין:
- **Locators** (Selectors) - איפה האלמנטים בעמוד
- **Actions** (Methods) - מה אפשר לעשות בעמוד (כשירותים של משתמש)
- **Tests** - מה אנחנו בודקים

### יתרונות:
✅ **תחזוקה קלה** - אם UI משתנה, מעדכנים רק ב-Page Object  
✅ **קוד נקי** - טסטים קריאים וקצרים  
✅ **שימוש חוזר** - אותו Page Object בכל הטסטים  
✅ **Page Chaining** - מסע משתמש אינטואיטיבי
✅ **Component Composition** - InvoiceRow object לשורות טבלה
✅ **Page Verification** - אימות שהעמוד נטען ב-`__init__`
✅ **User-oriented naming** - methods מייצגים שירותים, לא actions טכניים

## 🚀 הרצת הטסטים

### דרישות מקדימות:

1. **Frontend רץ על http://localhost:3000**
   ```bash
   cd smart-notifications-frontend
   npm run dev
   ```

2. **Backend רץ על http://localhost:8091**
   ```bash
   cd smart-notifications-backend
   source ../.venv/bin/activate
   uvicorn app.main:app --reload --port 8091
   ```

3. **ERPNext רץ על http://localhost:8080**

### התקנת dependencies:

```bash
# Install Playwright for Python
cd smart-notifications-frontend
source ../.venv/bin/activate
pip install playwright pytest-playwright
playwright install chromium
```

### הרצת הטסטים:

**עם unittest:**
```bash
cd smart-notifications-frontend
source ../.venv/bin/activate

# Run all UI tests
python -m pytest tests/ui/test_dashboard.py -v

# Run with browser visible (not headless)
HEADLESS=false python -m pytest tests/ui/test_dashboard.py -v

# Run with slow motion (easier to see what happens)
HEADLESS=false SLOW_MO=true python -m pytest tests/ui/test_dashboard.py -v

# Run specific test
python -m pytest tests/ui/test_dashboard.py::TestDashboardUI::test_dashboard_page_loads -v
```

**עם pytest-playwright:**
```bash
# Run with pytest
pytest tests/ui/ -v --headed  # --headed shows the browser

# Run single test class
pytest tests/ui/test_dashboard.py::TestDashboardUI -v
```

## 📝 דוגמאות שימוש

### דוגמה 1: טסט פשוט עם Page Verification
```python
def test_dashboard_page_loads(self):
    # Page verification happens automatically in __init__
    self.dashboard.navigate_to_dashboard()
    
    # Assert
    self.assertIn("Smart Notifications", self.dashboard.get_title())
```

### דוגמה 2: Page Chaining (מסע משתמש)
```python
def test_user_journey(self):
    # מסע שלם בשורה אחת - methods מייצגים שירותים של משתמש!
    self.dashboard.navigate_to_dashboard() \
        .scan_for_overdue_invoices() \
        .filter_by_risk_level("HIGH") \
        .filter_by_days_overdue(10, 90) \
        .search_by_customer("Customer Name") \
        .notify_customer_by_sms("INV-001")
```

### דוגמה 3: Component Composition - InvoiceRow
```python
# Get invoice objects (not raw locators!)
invoices = self.dashboard.get_invoices()

# Work with invoice components
for invoice in invoices:
    invoice_id = invoice.get_invoice_id()
    customer = invoice.get_customer_name()
    amount = invoice.get_amount()
    risk = invoice.get_risk_level()
    
    if risk == "HIGH":
        invoice.send_email()

# Or get specific invoice
specific_invoice = self.dashboard.get_invoice_by_id("INV-001")
if specific_invoice:
    specific_invoice.send_sms()
```

### דוגמה 4: User-oriented methods
```python
# ❌ Old - technical actions
self.dashboard.click_scan_button()
self.dashboard.send_email_for_invoice("INV-001")

# ✅ New - user services
self.dashboard.scan_for_overdue_invoices()
self.dashboard.notify_customer_by_email("INV-001")
```

## 🎨 Page Objects API

### DashboardPage - Main Methods
```python
# Navigation (returns self for chaining)
.navigate_to_dashboard()        # Navigate to dashboard

# User Services (returns self for chaining)
.scan_for_overdue_invoices()   # Scan ERPNext
.search_by_customer(name)       # Search by customer name
.filter_by_risk_level("HIGH")   # Filter by risk
.filter_by_days_overdue(10, 90) # Filter by days range

# Notifications (returns self for chaining)
.notify_customer_by_email(id)   # Send email
.notify_customer_by_sms(id)     # Send SMS

# Data retrieval
.get_total_invoices_count()     # Get total count stat
.get_high_risk_count()          # Get high risk count
.get_invoices()                 # Get InvoiceRow objects (component composition!)
.get_invoice_by_id(id)          # Get specific invoice
.has_invoices()                 # Check if any invoices
.has_invoice(id)                # Check specific invoice exists
```

### InvoiceRow Component
```python
# Component representing a single invoice row
invoice = InvoiceRow(row_element)

# Data access
invoice.get_invoice_id()        # Invoice ID
invoice.get_customer_name()     # Customer name
invoice.get_days_overdue()      # Days overdue (int)
invoice.get_amount()            # Amount (float)
invoice.get_risk_level()        # Risk level

# Actions (returns self for chaining)
invoice.send_email()            # Send email
invoice.send_sms()              # Send SMS
```

### BasePage
```python
# Base functionality for all page objects
def __init__(self, page):
    self.page = page
    self._verify_page_loaded()  # Auto-verify page loaded!

# Common utilities
.navigate_to(url)
.get_title()
.click(selector)
.fill(selector, value)
.is_visible(selector)
```

## 🧪 הטסטים שנכתבו

1. ✅ `test_dashboard_page_loads` - דף נטען בהצלחה
2. ✅ `test_scan_button_exists` - כפתור Scan קיים
3. ✅ `test_scan_erp_next_updates_table` - Scan מעדכן טבלה
4. ✅ `test_search_filter_works` - חיפוש עובד
5. ✅ `test_risk_filter_works` - פילטר risk עובד
6. ✅ `test_stats_display_correctly` - סטטיסטיקות מוצגות
7. ✅ `test_table_displays_invoice_data` - טבלה מציגה נתונים
8. ✅ `test_send_sms_button_exists` - כפתור SMS קיים
9. ✅ `test_send_email_button_exists` - כפתור Email קיים
10. ✅ `test_page_chaining_example` - Page chaining עובד
11. ✅ `test_complete_user_journey_scan_and_notify` - מסע משתמש מלא
12. ✅ `test_manager_reviews_high_risk_invoices` - תרחיש מנהל

## 🔧 Environment Variables

```bash
# Frontend URL (default: http://localhost:3000)
export FRONTEND_URL=http://localhost:3000

# Headless mode (default: true)
export HEADLESS=false  # Show browser

# Slow motion (default: false)
export SLOW_MO=true    # Slow down actions
```

## 📖 למידה נוספת

- [Playwright Documentation](https://playwright.dev/python/)
- [Page Object Model Best Practices](https://playwright.dev/python/docs/pom)
- חומר הלימוד: `/Users/raneenmandalawi/Desktop/smart-notifications-erpnext/AutomationSamana25-main-2/tutorials/playwright_pom.md`

## 🐛 Debugging

```bash
# Run with browser visible and slow
HEADLESS=false SLOW_MO=true python -m pytest tests/ui/test_dashboard.py -v -s

# Run single test with full output
python -m pytest tests/ui/test_dashboard.py::TestDashboardUI::test_search_filter_works -v -s

# Use Playwright debug mode
PWDEBUG=1 pytest tests/ui/test_dashboard.py
```

## ✨ עקרונות מהחומר הנלמד

1. **הפרדת concerns** - Selectors ב-Page Object, לוגיקה בטסטים
2. **Page Chaining** - `.navigate_to_dashboard().scan_for_overdue_invoices()` מסע משתמש
3. **שימוש חוזר** - DashboardPage משמש בכל הטסטים
4. **תחזוקה** - שינוי ב-UI = עדכון ב-Page Object בלבד
5. **Page Verification** - בדיקה אוטומטית ב-`__init__` שהעמוד נטען
6. **Component Composition** - InvoiceRow object לאלמנטים חוזרים
7. **User-oriented methods** - methods מייצגים שירותים, לא actions טכניים
8. **Ngrok handling** - טיפול אוטומטי ב-ngrok warning page

## 🌐 Ngrok Support (for CI/CD)

הטסטים תומכים ב-**ngrok** להרצה ב-CI/CD:

### Setup Ngrok
```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Start tunnel
ngrok http 3000

# Set environment variable
export FRONTEND_URL=https://your-url.ngrok-free.app
```

### Auto-handling Ngrok Warning
ה-`DashboardPage` מטפל אוטומטית ב-ngrok warning page:

```python
def _verify_page_loaded(self):
    # Handle ngrok warning page if present
    try:
        ngrok_button = self.page.get_by_role("button", name="Visit Site")
        if ngrok_button.is_visible(timeout=2000):
            ngrok_button.click()
    except:
        pass  # No ngrok warning
```

זה מאפשר הרצה חלקה ב-GitHub Actions!
