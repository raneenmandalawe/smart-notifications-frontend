"""
Pytest configuration for UI tests with Playwright
"""

import pytest
import os


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """
    Configure browser context for all tests
    """
    # Support both NGROK_URL (for CI) and FRONTEND_URL (for local)
    base_url = os.getenv("NGROK_URL") or os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    return {
        **browser_context_args,
        "viewport": {
            "width": 1920,
            "height": 1080,
        },
        "base_url": base_url,
    }


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    """
    Configure browser launch arguments
    """
    return {
        **browser_type_launch_args,
        "headless": os.getenv("HEADLESS", "true").lower() == "true",
        "slow_mo": 100 if os.getenv("SLOW_MO", "false").lower() == "true" else 0,
    }
