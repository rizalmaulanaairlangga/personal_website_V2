import base64
import json
import os
import re
import sys
from urllib.parse import parse_qs, unquote, urlparse
from playwright.sync_api import sync_playwright

BASE = os.environ.get("CMS_BASE", "http://localhost:3000")
CREDS = os.environ.get(
    "CMS_CREDENTIALS_FILE", os.path.join(os.environ["TEMP"], "cms_admin_credentials.txt")
)

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

    # --- legacy hero paths and URL-only heroes ---
    legacy_slug = "legacy-hero-check-" + os.urandom(4).hex()
    create_response = page.context.request.post(
        BASE + "/api/projects",
        data={"name": "Legacy Hero Verification", "slug": legacy_slug, "source": "personal"},
    )
    legacy_id = None
    try:
        check("legacy hero test project is created", create_response.status == 201)
        if create_response.status == 201:
            legacy_id = create_response.json()["project"]["id"]
            existing_response = page.context.request.get(BASE + "/api/projects?search=soulstory")
            existing_projects = existing_response.json().get("projects", [])
            source_url = next(
                (item.get("foto_public_url") for item in existing_projects if item.get("slug") == "soulstory"),
                None,
            )
            legacy_path = "portfolio-proyek/legacy-hero-check/" + legacy_slug + ".png"
            seeded = page.context.request.patch(
                BASE + "/api/projects/" + legacy_id,
                data={
                    "project": {
                        "foto_storage_path": legacy_path,
                        "foto_public_url": source_url,
                    }
                },
            )
            page.goto(BASE + "/projects/" + legacy_id, wait_until="domcontentloaded")
            page.wait_for_selector("#description")
            page.wait_for_timeout(1200)
            page.fill("#description", "Normalize a bucket-prefixed legacy hero path.")
            with page.expect_response(
                lambda response: response.request.method == "PATCH"
                and response.url.endswith("/api/projects/" + legacy_id)
            ) as save_response:
                page.get_by_role("button", name="Save changes").click()
            save_ok = save_response.value.status == 200
            saved = page.context.request.get(BASE + "/api/projects/" + legacy_id).json()["project"]
            normalized_path = "legacy-hero-check/" + legacy_slug + ".png"
            check(
                "editing a bucket-prefixed hero stores its object path only",
                seeded.ok and save_ok and saved.get("foto_storage_path") == normalized_path,
                str(saved.get("foto_storage_path")),
            )
            check(
                "editing a bucket-prefixed hero does not duplicate the bucket in its URL",
                saved.get("foto_public_url", "").endswith("/portfolio-proyek/" + normalized_path),
                str(saved.get("foto_public_url"))[:160],
            )

            url_only = page.context.request.patch(
                BASE + "/api/projects/" + legacy_id,
                data={"project": {"foto_storage_path": None, "foto_public_url": source_url}},
            )
            page.goto(BASE + "/projects/" + legacy_id, wait_until="domcontentloaded")
            page.wait_for_selector("#description")
            page.wait_for_timeout(1200)
            page.fill("#description", "Preserve a hero that has only its public URL.")
            with page.expect_response(
                lambda response: response.request.method == "PATCH"
                and response.url.endswith("/api/projects/" + legacy_id)
            ) as save_response:
                page.get_by_role("button", name="Save changes").click()
            save_ok = save_response.value.status == 200
            saved = page.context.request.get(BASE + "/api/projects/" + legacy_id).json()["project"]
            check(
                "editing a URL-only hero preserves both hero fields",
                url_only.ok and save_ok and saved.get("foto_storage_path") is None and saved.get("foto_public_url") == source_url,
                str({"path": saved.get("foto_storage_path"), "url": saved.get("foto_public_url")})[:180],
            )
    except Exception as e:
        check("legacy hero editing completes without an exception", False, repr(e))
    finally:
        if legacy_id:
            page.context.request.patch(
                BASE + "/api/projects/" + legacy_id,
                data={"project": {"foto_storage_path": None, "foto_public_url": None}},
            )
            page.context.request.delete(BASE + "/api/projects/" + legacy_id)

    # --- new project form ---
    page.goto(BASE + "/projects/new", wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    check("the form page loads", page.locator("#name").count() == 1, page.url)
    json_input = page.get_by_label("Paste AI JSON response")
    check("AI JSON input appears near the top of the form", json_input.count() == 1)
    if json_input.count():
        prompt_panel_first = page.locator("#project-form").locator("button", has_text="Copy AI Project Prompt").evaluate(
            "(button) => button.closest('.rounded-xl').compareDocumentPosition(document.querySelector('#project-form section.card')) & Node.DOCUMENT_POSITION_FOLLOWING"
        )
        check("the AI prompt tools appear before the project fields", bool(prompt_panel_first))

        page.locator("input[type=file]").first.set_input_files({
            "name": "selected-hero.png",
            "mimeType": "image/png",
            "buffer": b"not uploaded",
        })
        json_input.fill("{ invalid json")
        json_input.focus()
        page.keyboard.press("Tab")
        check("the JSON apply action is reachable by keyboard", page.evaluate("() => document.activeElement?.textContent?.includes('Apply JSON to form')"))
        page.keyboard.press("Enter")
        check("invalid JSON shows an accessible error", page.get_by_role("alert").filter(has_text="JSON").count() > 0)
        check("invalid JSON does not change existing form values", page.locator("#name").input_value() == "")

        json_input.fill(json.dumps({
            "name": "Imported Portfolio Project",
            "slug": "imported-project-url",
            "description": "Imported from structured project metadata.",
            "date": "2026-10-22",
            "project_type": "Web Application",
            "timeframe": "Two months",
            "hero_subtitle": "A concise project tagline",
            "project_context": "Personal project",
            "team_quote": "",
            "link_web": "https://example.com",
            "repo_link": "https://github.com/example/project",
            "source": "personal",
            "frameworks": ["Next.js", "TypeScript"],
            "brief": {"body": "Project overview.", "title": "A clear overview", "kicker": "Brief"},
            "challenge": {"body": "The challenge.", "title": "A real constraint", "kicker": "Challenge"},
            "solution": {"body": "The solution.", "title": "A practical solution", "kicker": "Solution"},
            "credits": [{"name": "Rizal", "role": "Developer"}],
            "seo_title": "Imported portfolio project",
            "seo_desc": "Project metadata imported from JSON.",
        }))
        page.get_by_role("button", name="Apply JSON to form").click()
        check("valid JSON populates project fields", page.locator("#name").input_value() == "Imported Portfolio Project" and page.locator("#description").input_value() == "Imported from structured project metadata.")
        check("valid JSON preserves its supplied slug", page.locator("#slug").input_value() == "imported-project-url")
        check("applying JSON does not save the project automatically", len(page.context.request.get(BASE + "/api/projects?search=imported-project-url").json().get("projects", [])) == 0)
        check("valid JSON populates nested content and credits", page.locator("#brief-body").input_value() == "Project overview." and page.get_by_role("textbox", name="Member 1 name").input_value() == "Rizal")
        check("valid JSON populates SEO metadata", page.locator("#seo_title").input_value() == "Imported portfolio project" and page.locator("#seo_desc").input_value() == "Project metadata imported from JSON.")
        check("applying JSON keeps the selected screenshot file", page.get_by_text("Ready to upload when you save.", exact=True).count() == 1)
        json_input.fill(json.dumps({
            "name": "Imported Portfolio Project",
            "slug": "imported-project-url",
            "description": "",
            "date": "",
        }))
        page.get_by_role("button", name="Apply JSON to form").click()
        check("blank JSON values preserve existing form content", page.locator("#description").input_value() == "Imported from structured project metadata.")
        check("an unknown AI date clears the create form's default date", page.locator("#date").input_value() == "")

    check("responsive screenshot configuration is selected by default",
          page.locator("input[name=screenshot-layout][value=responsive]").is_checked())
    check("responsive screenshot roles are present",
          page.locator("text=Hero Desktop").count() >= 1 and
          page.locator("text=Mobile").count() >= 1 and
          page.locator("text=Tablet").count() >= 1 and
          page.locator("text=Desktop Additional").count() >= 1)
    page.locator("input[name=screenshot-layout][value=mobile_only]").check()
    page.wait_for_timeout(250)
    check("mobile-only mode shows hero and three optional mobile screenshots",
          page.locator("text=Hero Mobile Screenshot").count() == 1 and
          page.locator("text=Additional Mobile Screenshot 1").count() == 1 and
          page.locator("text=Additional Mobile Screenshot 2").count() == 1 and
          page.locator("text=Additional Mobile Screenshot 3").count() == 1)
    screenshot_section = page.locator("section.card").filter(has_text="Screenshot configuration")
    check("mobile-only mode hides tablet and desktop controls",
          screenshot_section.get_by_text("Tablet", exact=True).count() == 0 and
          screenshot_section.get_by_text("Desktop Additional", exact=True).count() == 0)
    check("configuration switch warns that saved screenshots are retained",
          "Existing screenshots stay saved and are not deleted" in page.content())
    page.locator("input[name=screenshot-layout][value=responsive]").check()
    check("switching back restores multi-device controls",
          screenshot_section.get_by_text("Hero Desktop", exact=True).count() == 1 and
          screenshot_section.get_by_text("Tablet", exact=True).count() == 1 and
          screenshot_section.get_by_text("Desktop Additional", exact=True).count() == 1)

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
    page.goto(BASE + "/projects/new", wait_until="domcontentloaded")
    page.wait_for_timeout(1200)
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

    # --- release uploads when a later role fails ---
    page.goto(BASE + "/projects/new", wait_until="domcontentloaded")
    page.wait_for_selector("#project-form")
    page.wait_for_timeout(1200)
    cleanup_slug = "upload-cleanup-" + os.urandom(4).hex()
    cleanup_name = "Upload Cleanup Verification"
    page.fill("#name", cleanup_name)
    page.fill("#slug", cleanup_slug)
    page.locator("input[name=screenshot-layout][value=mobile_only]").check()
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cJ9sAAAAASUVORK5CYII="
    )
    files = page.locator("input[type=file]")
    files.nth(0).set_input_files({"name": "hero.png", "mimeType": "image/png", "buffer": png})
    files.nth(1).set_input_files({"name": "mobile.png", "mimeType": "image/png", "buffer": png})
    upload_attempts = [0]
    uploaded_paths = []
    cleanup_requests = []

    def fail_second_upload(route):
        if route.request.method == "POST":
            upload_attempts[0] += 1
            if upload_attempts[0] == 2:
                route.fulfill(
                    status=400,
                    content_type="application/json",
                    body=json.dumps({"error": "simulated later upload failure"}),
                )
                return
        route.continue_()

    def capture_uploaded_path(response):
        if response.request.method == "POST" and "/api/upload" in response.url and response.status == 200:
            try:
                uploaded_paths.append(response.json().get("path"))
            except Exception:
                pass

    page.on("response", capture_uploaded_path)
    page.on(
        "request",
        lambda request: cleanup_requests.append(request.url)
        if request.method == "DELETE" and "/api/upload?" in request.url
        else None,
    )
    page.route("**/api/upload", fail_second_upload)
    try:
        page.locator("#project-form").evaluate("(form) => form.requestSubmit()")
        page.get_by_role("alert").filter(has_text="simulated later upload failure").wait_for(timeout=30000)
        cleaned_paths = [
            unquote(parse_qs(urlparse(url).query).get("path", [""])[0])
            for url in cleanup_requests
        ]
        check(
            "a later upload failure releases files uploaded earlier in the attempt",
            bool(uploaded_paths) and uploaded_paths[0] in cleaned_paths,
            str({"uploaded": uploaded_paths, "cleanup": cleaned_paths})[:180],
        )
    except Exception as e:
        check("upload failure cleanup scenario completes", False, repr(e))
    finally:
        page.unroute("**/api/upload", fail_second_upload)
        for path in uploaded_paths:
            if path:
                page.context.request.delete(
                    BASE + "/api/upload",
                    params={"path": path, "projectName": cleanup_name},
                )

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
    check("JSON import remains available on mobile", mobile.get_by_label("Paste AI JSON response").count() == 1)
    overflow = mobile.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
    check("the form does not overflow on mobile", not overflow)
    mobile.close()

    check("no page errors", len(errs) == 0, errs[:3])
    browser.close()

print("\n" + "=" * 60)
print(f"RESULT: {sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
