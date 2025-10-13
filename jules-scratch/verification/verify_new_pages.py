from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/login")
    page.locator("#identifier").fill("testuser")
    page.locator("#password").fill("testpassword")
    page.get_by_role("button", name="Sign in").click()
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
    page.goto("http://localhost:5173/message-logs")
    expect(page.get_by_role("heading", name="Message Logs")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/message_logs_page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)