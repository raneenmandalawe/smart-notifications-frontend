"""
Dashboard Page Object Model
מייצג את דף ה-Dashboard עם כל האלמנטים והפעולות
"""

from typing import List, Literal
from playwright.sync_api import Page, Locator
from tests.ui.pages.base_page import BasePage


class InvoiceRow:
    """Component Object representing a single invoice row in the table"""
    
    def __init__(self, row_element: Locator):
        self.element = row_element
    
    def get_invoice_id(self) -> str:
        """Get invoice ID from this row"""
        try:
            return self.element.locator("td:nth-child(1)").inner_text(timeout=2000)
        except Exception:
            return ""
    
    def get_customer_name(self) -> str:
        """Get customer name from this row"""
        try:
            return self.element.locator("td:nth-child(2)").inner_text(timeout=2000)
        except Exception:
            return ""
    
    def get_days_overdue(self) -> int:
        """Get days overdue from this row"""
        try:
            return int(self.element.locator("td:nth-child(3)").inner_text())
        except:
            return 0
    
    def get_amount(self) -> float:
        """Get amount from this row"""
        try:
            text = self.element.locator("td:nth-child(4)").inner_text()
            return float(text.replace("$", "").replace(",", ""))
        except:
            return 0.0
    
    def get_risk_level(self) -> str:
        """Get risk level badge text"""
        try:
            return self.element.locator("[class*='risk'], [class*='HIGH'], [class*='MEDIUM'], [class*='LOW']").inner_text()
        except:
            return ""
    
    def send_email(self):
        """Send email notification for this invoice"""
        button = self.element.locator("button:has-text('📧'), button:has-text('Email')")
        if button.count() == 0:
            return self
        button.click()
        return self
    
    def send_sms(self):
        """Send SMS notification for this invoice"""
        button = self.element.locator("button:has-text('📱'), button:has-text('SMS')")
        if button.count() == 0:
            return self
        button.click()
        return self


class DashboardPage(BasePage):
    """Page Object for Smart Notifications Dashboard"""
    
    # Locators (Selectors)
    SCAN_BUTTON = "button:has-text('Scan Now')"
    LOADING_INDICATOR = "button:has-text('Scanning...')"
    ERROR_MESSAGE = ".error-message, span:has-text('error'), span:has-text('failed')"
    
    # Stats cards  
    STATS_CARDS = ".grid > div"  # All stat cards
    TOTAL_INVOICES_STAT = "text=/Overdue invoices/i"
    HIGH_RISK_STAT = "text=/High.*risk/i"
    SENT_TODAY_STAT = "text=/Notifications sent/i"
    FAILED_STAT = "text=/Failed/i"
    
    # Filters
    SEARCH_INPUT = "input[placeholder*='customer'], input[placeholder*='Type customer name']"
    RISK_FILTER = "select"
    MIN_DAYS_INPUT = "input[type='number']:first-of-type, input[min]"
    MAX_DAYS_INPUT = "input[type='number']:last-of-type, input[max]"
    
    # Auto scan
    AUTO_SCAN_TOGGLE = "button:has-text('Auto Scan')"
    AUTO_SCAN_STATUS = "button:has-text('Auto Scan')"
    
    # Table
    TABLE = "table"
    TABLE_ROWS = "table tbody tr"
    INVOICE_ID_CELL = "td:nth-child(1)"
    CUSTOMER_CELL = "td:nth-child(2)"
    DAYS_OVERDUE_CELL = "td:nth-child(3)"
    AMOUNT_CELL = "td:nth-child(4)"
    RISK_BADGE = "[class*='risk'], [class*='HIGH'], [class*='MEDIUM'], [class*='LOW']"
    STATUS_BADGE = "[class*='status'], [class*='sent'], [class*='failed']"
    
    # Action buttons - more specific selectors
    SEND_EMAIL_BUTTON = "button:has-text('📧'), button:has-text('Email')"
    SEND_SMS_BUTTON = "button:has-text('📱'), button:has-text('SMS')"
    
    # Toast/Success messages
    TOAST_MESSAGE = "[role='alert'], .toast, [class*='notification'], span:has-text('success')"
    
    def __init__(self, page: Page, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.dashboard_url = f"{base_url}/dashboard"
        super().__init__(page)
    
    def _verify_page_loaded(self):
        """Verify Dashboard page loaded successfully"""
        try:
            # Handle ngrok warning page if present
            try:
                ngrok_button = self.page.get_by_role("button", name="Visit Site")
                if ngrok_button.is_visible(timeout=2000):
                    ngrok_button.click()
            except:
                pass  # No ngrok warning
            
            # Verify we're on dashboard
            self.page.wait_for_selector(self.SCAN_BUTTON, timeout=10000)
            if "dashboard" not in self.page.url.lower():
                raise Exception(f"Not on dashboard page. Current URL: {self.page.url}")
        except Exception as e:
            raise Exception(f"Dashboard page not loaded successfully: {str(e)}")
    
    def navigate_to_dashboard(self):
        """Navigate to Dashboard page (user service)"""
        self.navigate_to(self.dashboard_url)
        self.page.wait_for_load_state("networkidle")
        self._verify_page_loaded()
        return self
    
    def scan_for_overdue_invoices(self):
        """Scan ERPNext for overdue invoices (user service)"""
        self.click(self.SCAN_BUTTON)
        # Wait for scan to complete
        try:
            self.page.wait_for_selector(self.LOADING_INDICATOR, state="hidden", timeout=30000)
        except Exception:
            pass  # Loading indicator might not appear for fast scans
        return self
    
    def search_by_customer(self, customer_name: str):
        """Search invoices by customer name"""
        self.fill(self.SEARCH_INPUT, customer_name)
        self.page.wait_for_timeout(500)  # Debounce
        return self
    
    def filter_by_risk_level(self, risk_level: Literal["ALL", "HIGH", "MEDIUM", "LOW"]):
        """Filter invoices by risk level"""
        self.page.locator(self.RISK_FILTER).select_option(risk_level)
        self.page.wait_for_timeout(300)
        return self
    
    def filter_by_days_overdue(self, min_days: int, max_days: int):
        """Filter invoices by days overdue range"""
        min_input = self.page.locator(self.MIN_DAYS_INPUT)
        max_input = self.page.locator(self.MAX_DAYS_INPUT)
        
        min_input.fill(str(min_days))
        max_input.fill(str(max_days))
        self.page.wait_for_timeout(300)
        return self
    
    def get_total_invoices_count(self) -> int:
        """Get total invoices count from stats"""
        try:
            # Find the stat card containing "Overdue invoices" and extract number
            stat_locator = self.page.locator(self.TOTAL_INVOICES_STAT).locator("..").locator("text=/^\\d+$/")
            stat_text = stat_locator.first.inner_text()
            return int(stat_text)
        except Exception:
            return 0
    
    def get_high_risk_count(self) -> int:
        """Get high risk  invoices count from stats"""
        try:
            # Find the stat card containing "High-risk" and extract number
            stat_locator = self.page.locator(self.HIGH_RISK_STAT).locator("..").locator("text=/^\\d+$/")
            stat_text = stat_locator.first.inner_text()
            return int(stat_text)
        except Exception:
            return 0
    
    def get_invoices(self) -> List[InvoiceRow]:
        """Get all invoice rows as InvoiceRow objects (component composition)"""
        row_elements = self.page.locator(self.TABLE_ROWS).all()
        return [InvoiceRow(row) for row in row_elements]
    
    def get_invoice_by_id(self, invoice_id: str) -> InvoiceRow | None:
        """Find and return specific invoice row by ID"""
        invoices = self.get_invoices()
        for invoice in invoices:
            if invoice_id in invoice.get_invoice_id():
                return invoice
        return None
    
    def notify_customer_by_email(self, invoice_id: str):
        """Send email notification to customer for specific invoice (user service)"""
        invoice = self.get_invoice_by_id(invoice_id)
        if invoice:
            invoice.send_email()
            self.page.wait_for_timeout(1000)
        return self
    
    def notify_customer_by_sms(self, invoice_id: str):
        """Send SMS notification to customer for specific invoice (user service)"""
        invoice = self.get_invoice_by_id(invoice_id)
        if invoice:
            invoice.send_sms()
            self.page.wait_for_timeout(1000)
        return self
    
    def toggle_auto_scan(self):
        """Toggle auto scan on/off"""
        self.click(self.AUTO_SCAN_TOGGLE)
        self.page.wait_for_timeout(500)
        return self
    
    def is_auto_scan_enabled(self) -> bool:
        """Check if auto scan is enabled"""
        try:
            button_text = self.page.locator(self.AUTO_SCAN_STATUS).inner_text().lower()
            return "on" in button_text
        except Exception:
            return False
    
    def get_toast_message(self) -> str:
        """Get toast/notification message"""
        try:
            return self.page.locator(self.TOAST_MESSAGE).first.inner_text()
        except Exception:
            return ""
    
    def has_invoices(self) -> bool:
        """Check if dashboard has any invoices displayed"""
        return len(self.get_invoices()) > 0
    
    def has_invoice(self, invoice_id: str) -> bool:
        """Check if specific invoice is displayed in the table"""
        return self.get_invoice_by_id(invoice_id) is not None
