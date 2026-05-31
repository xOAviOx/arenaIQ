from playwright.sync_api import sync_playwright

PAGES = [
    ("http://localhost:3000/", "C:/Users/avish/Desktop/arenaIQ/shot-landing.png"),
    ("http://localhost:3000/login", "C:/Users/avish/Desktop/arenaIQ/shot-login.png"),
    ("http://localhost:3000/leaderboard", "C:/Users/avish/Desktop/arenaIQ/shot-leaderboard.png"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
    for url, out in PAGES:
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(900)
            page.screenshot(path=out, full_page=True)
            print(f"OK  {url} -> {out}")
        except Exception as e:
            print(f"ERR {url}: {e}")
    browser.close()
