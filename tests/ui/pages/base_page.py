"""
Base Page Object - כל ה-Page Objects יורשים ממנו
"""

from playwright.sync_api import Page


class BasePage:
    """Base class for all Page Objects"""
    
    def __init__(self, page: Page):
        self.page = page
        self._verify_page_loaded()
    
    def _verify_page_loaded(self):
        """Override in subclass to verify page loaded correctly"""
        pass
    
    def navigate_to(self, url: str):
        """Navigate to a specific URL"""
        self.page.goto(url)
    
    def get_title(self) -> str:
        """Get page title"""
        return self.page.title()
    
    def wait_for_url(self, url: str, timeout: int = 5000):
        """Wait for URL to match"""
        self.page.wait_for_url(url, timeout=timeout)
    
    def click(self, selector: str):
        """Click on an element"""
        self.page.locator(selector).click()
    
    def fill(self, selector: str, value: str):
        """Fill input field"""
        self.page.locator(selector).fill(value)
    
    def get_text(self, selector: str) -> str:
        """Get text content of an element"""
        return self.page.locator(selector).inner_text()
    
    def is_visible(self, selector: str) -> bool:
        """Check if element is visible"""
        return self.page.locator(selector).is_visible()
    
    def wait_for_selector(self, selector: str, timeout: int = 5000):
        """Wait for selector to appear"""
        self.page.wait_for_selector(selector, timeout=timeout)
