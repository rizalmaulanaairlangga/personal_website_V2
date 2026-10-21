import json
import os
import re
import sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("CMS_BASE", "http://localhost:3000")
CREDS = os.path.join(os.environ["TEMP"], "cms_admin_credentials.txt")

EMAIL = os.environ.get("CMS_ADMIN_EMAIL")
PASSWORD = os.environ.get("CMS_ADMIN_PASSWORD")

if not (EMAIL and PASSWORD):
    with open(CREDS, encoding="utf-8") as f:
        for line in f:
            if line.startswith("email:"):
                EMAIL = line.split(":", 1)[1].strip()
            if line.startswith("password:"):
                PASSWORD = line.split(":", 1)[1].strip()

if not (EMAIL and PASSWORD):
    sys.exit("Set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD, or provide " + CREDS)

results = []


def check(name, ok, detail=""):
    results.append(ok)
    print(("PASS  " if ok else "FAIL  ") + name + (("  | " + str(detail)[:200]) if detail else ""))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chromium")
    page = browser.new_context(viewport={"width": 1440, "height": 900}).new_page()
    page.set_default_navigation_timeout(60000)
    errs = []
    page.on("pageerror", lambda e: errs.append(str(e)[:160]))

    # --- login ---
    page.goto(BASE + "/login", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    check("login page renders", page.locator("h1").inner_text().strip() == "Portfolio CMS", page.locator("h1").inner_text())
    check("login form has email and password", page.locator("#email").count() == 1 and page.locator("#password").count() == 1)

    page.fill("#email", EMAIL)
    page.fill("#password", "definitely-wrong")
    page.click("button[type=submit]")
    page.wait_for_timeout(2000)
    check("a bad password shows an error", page.locator("[role=alert]").count() >= 1, page.locator("[role=alert]").first.inner_text() if page.locator("[role=alert]").count() else "no alert")

    page.fill("#password", PASSWORD)
    page.click("button[type=submit]")
    page.wait_for_timeout(4000)
    check("sign in lands on the dashboard", "/login" not in page.url, page.url)

    # --- dashboard ---
    page.wait_for_timeout(2500)
    rows = page.locator("table tbody tr").count()
    check("dashboard lists the projects", rows == 8, "rows=" + str(rows))
    check("a thumbnail column is present", page.locator("table tbody tr td img").count() >= 1, "thumbs=" + str(page.locator("table tbody tr td img").count()))
    check("the slug is shown", "soulstory" in page.content().lower())

    page.fill("input[type=search]", "gis")
    page.wait_for_timeout(1600)
    filtered = page.locator("table tbody tr").count()
    check("search filters the list", filtered == 1, "rows=" + str(filtered))
    page.fill("input[type=search]", "")
    page.wait_for_timeout(1400)

    # --- new project form ---
    page.goto(BASE + "/projects/new", wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    check("the form page loads", page.locator("#name").count() == 1, page.url)
    check("all four screenshot roles are present",
          page.locator("text=Hero Desktop").count() >= 1 and
          page.locator("text=Mobile").count() >= 1 and
          page.locator("text=Tablet").count() >= 1 and
          page.locator("text=Desktop Additional").count() >= 1)

    # every labelled field has an info button
    labels = page.locator("label").count()
    tips = page.locator("button[aria-label^='About ']").count()
    check("each field carries an info icon", tips >= 15, f"labels={labels} tips={tips}")

    # --- tooltip on hover ---
    first_tip = page.locator("button[aria-label^='About ']").first
    first_tip.hover()
    page.wait_for_timeout(700)
    tooltip = page.locator("[role=tooltip]").first
    check("the tooltip opens on hover", tooltip.count() == 1, "count=" + str(tooltip.count()))
    if tooltip.count():
        txt = tooltip.inner_text()
        check("the tooltip explains the field", len(txt) > 60, txt[:110])

    # --- tooltip on keyboard focus ---
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    page.locator("button[aria-label^='About Slug']").focus()
    page.wait_for_timeout(700)
    check("the tooltip opens on keyboard focus", page.locator("[role=tooltip]").count() == 1)
    if page.locator("[role=tooltip]").count():
        slug_tip = page.locator("[role=tooltip]").first.inner_text()
        check("the slug tooltip mentions the format", "lowercase" in slug_tip.lower() and "hyphen" in slug_tip.lower(), slug_tip[:140])

    # --- slug auto-generation and validation ---
    page.fill("#name", "Playwright Check Project")
    page.wait_for_timeout(1600)
    slug = page.locator("#slug").input_value()
    check("the slug is generated from the name", slug == "playwright-check-project", slug)

    status_text = page.locator("text=Slug is available").count()
    check("the slug availability is confirmed", status_text >= 1)

    # a slug that already exists
    page.fill("#slug", "soulstory")
    page.wait_for_timeout(1800)
    check("a taken slug is flagged", page.locator("text=already used").count() >= 1,
          page.locator("text=already used").first.inner_text() if page.locator("text=already used").count() else "no message")

    # manual editing sticks
    page.fill("#slug", "manual-slug-here")
    page.wait_for_timeout(1200)
    page.fill("#name", "Another Name")
    page.wait_for_timeout(1200)
    check("a hand-edited slug is not overwritten", page.locator("#slug").input_value() == "manual-slug-here",
          page.locator("#slug").input_value())

    # --- unsaved changes ---
    check("the unsaved-changes marker appears", page.locator("text=Unsaved changes").count() >= 1)

    # --- AI prompt ---
    page.click("text=Copy AI Project Prompt")
    page.wait_for_timeout(1800)
    check("the AI prompt reports success", page.locator("text=copied to your clipboard").count() >= 1 or
          page.locator("text=Show prompt").count() >= 1,
          page.locator("text=copied").count())

    # --- preview ---
    page.click("text=Preview")
    page.wait_for_timeout(1400)
    check("the preview opens", page.locator("text=Draft preview").count() >= 1)
    check("the preview is marked as a draft", "Not published until you save" in page.content())
    check("the preview shows the current project name", "Another Name" in page.content())

    # --- responsive ---
    mobile = browser.new_context(viewport={"width": 360, "height": 740}).new_page()
    mobile.set_default_navigation_timeout(60000)
    mobile.goto(BASE + "/login", wait_until="domcontentloaded")
    mobile.wait_for_timeout(1200)
    mobile.fill("#email", EMAIL)
    mobile.fill("#password", PASSWORD)
    mobile.click("button[type=submit]")
    mobile.wait_for_timeout(4000)
    overflow = mobile.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    check("the dashboard does not overflow on mobile", not overflow)
    mobile.goto(BASE + "/projects/new", wait_until="domcontentloaded")
    mobile.wait_for_timeout(2000)
    overflow = mobile.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    check("the form does not overflow on mobile", not overflow)
    mobile.close()

    check("no page errors", len(errs) == 0, errs[:3])
    browser.close()

print("\n" + "=" * 60)
print(f"RESULT: {sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
