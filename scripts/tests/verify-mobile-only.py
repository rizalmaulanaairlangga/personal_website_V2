import json
import os
import sys
import time
import uuid
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_BASE = os.environ.get("PUBLIC_BASE", "http://127.0.0.1:3012").rstrip("/")


def read_env():
    values = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("'\"")
    return values


ENV = read_env()
SUPABASE_URL = ENV["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
ANON_KEY = ENV["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
SERVICE_KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"]


def request_json(url, method="GET", body=None, key=ANON_KEY):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    if method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    request = Request(url, data=data, method=method, headers=headers)
    try:
        with urlopen(request, timeout=30) as response:
            raw = response.read()
            return response.status, json.loads(raw) if raw else None
    except HTTPError as error:
        detail = error.read().decode("utf-8", "replace")
        raise RuntimeError(f"Supabase request failed with {error.code}: {detail[:240]}") from error


def public_url(path):
    return f"{SUPABASE_URL}/storage/v1/object/public/portfolio-proyek/{quote(path, safe='/')}"


def create_project(layout, hero_path, screenshot_paths):
    slug = f"mobile-only-check-{uuid.uuid4().hex[:10]}"
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    project = {
        "name": f"Mobile-only verification {slug[-5:]}",
        "slug": slug,
        "source": "personal",
        "screenshot_layout": layout,
        "foto_file_name": hero_path.rsplit("/", 1)[-1],
        "foto_storage_path": hero_path,
        "foto_public_url": public_url(hero_path),
        "created_time": now,
        "updated_time": now,
    }
    status, rows = request_json(
        f"{SUPABASE_URL}/rest/v1/proyek_web",
        "POST",
        project,
        SERVICE_KEY,
    )
    if status != 201 or not rows:
        raise RuntimeError("Could not create the temporary verification project")
    project_id = rows[0]["id"]

    try:
        if screenshot_paths:
            screenshots = [
                {
                    "project_id": project_id,
                    "image_path": path,
                    "view_type": "mobile",
                    "sort_order": order,
                    "alt_text": f"{project['name']} mobile screen {order + 1}",
                }
                for order, path in enumerate(screenshot_paths)
            ]
            request_json(
                f"{SUPABASE_URL}/rest/v1/project_screenshots",
                "POST",
                screenshots,
                SERVICE_KEY,
            )
    except Exception:
        request_json(
            f"{SUPABASE_URL}/rest/v1/proyek_web?id=eq.{quote(project_id)}",
            "DELETE",
            key=SERVICE_KEY,
        )
        raise
    return {"id": project_id, "slug": slug, "name": project["name"]}


def cleanup(projects):
    for project in projects:
        if not project["slug"].startswith("mobile-only-check-"):
            raise RuntimeError("Refusing to clean a non-test project")
        request_json(
            f"{SUPABASE_URL}/rest/v1/proyek_web?id=eq.{quote(project['id'])}",
            "DELETE",
            key=SERVICE_KEY,
        )


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS  {message}")


def open_detail(page, slug):
    page.goto(f"{PUBLIC_BASE}/work/{slug}", wait_until="domcontentloaded")
    page.locator("h1").first.wait_for(timeout=30000)


def main():
    _, mobile_rows = request_json(
        f"{SUPABASE_URL}/rest/v1/project_screenshots"
        "?select=image_path&view_type=eq.mobile&order=sort_order.asc"
    )
    mobile_paths = list(dict.fromkeys(row["image_path"] for row in mobile_rows or []))
    if len(mobile_paths) < 3:
        raise RuntimeError("At least three existing mobile screenshots are needed")

    for path in mobile_paths[:3]:
        with urlopen(Request(public_url(path), method="HEAD"), timeout=30) as response:
            if response.status != 200:
                raise RuntimeError("An existing mobile screenshot is not publicly reachable")

    projects = []
    try:
        three = create_project("mobile_only", mobile_paths[0], mobile_paths[:3])
        one = create_project("mobile_only", mobile_paths[0], mobile_paths[:1])
        hero_only = create_project("mobile_only", mobile_paths[0], [])
        failed = create_project(
            "mobile_only",
            mobile_paths[0],
            [mobile_paths[0], "mobile-only-verification/missing-screenshot.png"],
        )
        projects.extend([three, one, hero_only, failed])

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, channel="chromium")
            desktop = browser.new_page(viewport={"width": 1440, "height": 900})
            page_errors = []
            desktop.on("pageerror", lambda error: page_errors.append(str(error)))

            open_detail(desktop, three["slug"])
            desktop.locator('[data-gallery-layout="mobile_only"]').wait_for(timeout=30000)
            desktop.locator("[data-device-row]").scroll_into_view_if_needed()
            desktop.wait_for_function(
                "() => [...document.querySelectorAll('[data-screenshot-image]')].every((image) => image.complete)",
                timeout=30000,
            )
            desktop.wait_for_timeout(3300)

            row = desktop.locator("[data-device-row]")
            check(row.locator(".mobile-only-phone").count() == 3, "three stored mobile screenshots render as three phones")
            check("is-visible" in (row.get_attribute("class") or ""), "scrolling into view activates the showcase animation")
            check(row.locator(".device--tablet").count() == 0, "mobile-only layout has no tablet frame")
            check(desktop.locator(".mobile-only-phone--center").count() == 1, "three-phone layout has a distinct center phone")
            image_state = row.locator("img").evaluate_all(
                "(images) => images.map((image) => ({width: image.naturalWidth, height: image.naturalHeight}))"
            )
            check(all(item["width"] > 0 and item["height"] > 0 for item in image_state), "all three stored screenshots load")
            boxes = row.locator(".mobile-only-phone").evaluate_all(
                "(phones) => phones.map((phone) => { const r = phone.getBoundingClientRect(); return {left:r.left,right:r.right,width:r.width}; })"
            )
            check(boxes[0]["left"] < boxes[1]["left"] < boxes[2]["left"], "desktop phones form a left-center-right composition")
            scales = row.locator(".mobile-only-phone").evaluate_all(
                "(phones) => phones.map((phone) => { const m = new DOMMatrix(getComputedStyle(phone).transform); return Math.hypot(m.a, m.b); })"
            )
            check(scales[1] > scales[0] and scales[1] > scales[2], "center phone is scaled larger than both side phones")
            check(all(box["left"] >= 0 and box["right"] <= 1440 for box in boxes), "desktop phone composition stays inside the viewport")

            next_project = desktop.locator('a[data-project-link^="/work/"]').first
            next_project.scroll_into_view_if_needed()
            next_project.click()
            desktop.wait_for_url(lambda url: f"/work/{three['slug']}" not in str(url), timeout=30000)
            desktop.go_back()
            desktop.wait_for_url(f"{PUBLIC_BASE}/work/{three['slug']}", timeout=30000)
            desktop.locator('[data-gallery-layout="mobile_only"] .mobile-only-phone').first.wait_for(timeout=30000)
            check(
                desktop.locator('[data-gallery-layout="mobile_only"] .mobile-only-phone').count() == 3,
                "client navigation back to the visited project restores all phones",
            )

            mobile = browser.new_page(viewport={"width": 390, "height": 844})
            open_detail(mobile, three["slug"])
            three_row = mobile.locator('[data-gallery-layout="mobile_only"]')
            three_row.wait_for(timeout=30000)
            check(three_row.locator(".mobile-only-phone").count() == 3, "three phones reflow on a narrow viewport")
            check(
                mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"),
                "three-phone mobile composition does not create horizontal overflow",
            )

            open_detail(mobile, one["slug"])
            one_row = mobile.locator('[data-gallery-layout="mobile_only"]')
            one_row.wait_for(timeout=30000)
            check(one_row.locator(".mobile-only-phone").count() == 1, "a single additional screenshot renders one phone")
            check(
                mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"),
                "mobile-only showcase does not create horizontal page overflow",
            )

            open_detail(mobile, failed["slug"])
            failed_row = mobile.locator('[data-gallery-layout="mobile_only"] [data-device-row]')
            failed_row.wait_for(timeout=30000)
            failed_row.scroll_into_view_if_needed()
            mobile.wait_for_function(
                "() => [...document.querySelectorAll('[data-gallery-layout=\"mobile_only\"] img')].every((image) => image.complete)",
                timeout=30000,
            )
            mobile.wait_for_timeout(500)
            check(
                failed_row.locator(".mobile-only-phone:visible").count() == 1,
                "failed image loading hides its frame without a placeholder: "
                + str(
                    failed_row.evaluate(
                        "(row) => [...row.querySelectorAll('[data-device]')].map((device) => ({hidden:device.hidden, image: {complete:device.querySelector('img')?.complete, width:device.querySelector('img')?.naturalWidth, src:device.querySelector('img')?.src}}))"
                    )
                ),
            )

            reduced = browser.new_page(viewport={"width": 1440, "height": 900})
            reduced.emulate_media(reduced_motion="reduce")
            open_detail(reduced, three["slug"])
            reduced_row = reduced.locator('[data-gallery-layout="mobile_only"] [data-device-row]')
            reduced_row.wait_for(timeout=30000)
            reduced.wait_for_function(
                "() => document.querySelector('[data-gallery-layout=\"mobile_only\"] [data-device-row]')?.classList.contains('is-visible')",
                timeout=10000,
            )
            check("is-visible" in (reduced_row.get_attribute("class") or ""), "reduced-motion users see the gallery immediately")
            check(
                reduced_row.evaluate("(row) => getComputedStyle(row).transitionProperty === 'none'"),
                "reduced-motion preference disables gallery transitions",
            )

            open_detail(mobile, hero_only["slug"])
            check(mobile.locator('[data-gallery-section]').count() == 0, "hero-only project has no empty gallery")
            check(mobile.locator("img[alt$='mobile application']").count() == 1, "hero-only mobile project still renders its hero phone")

            open_detail(desktop, "assetrack-3d-landing-page")
            responsive = desktop.locator('[data-gallery-layout="responsive"]')
            responsive.wait_for(timeout=30000)
            check(responsive.locator(".device--phone").count() == 1, "existing multi-device project keeps its phone")
            check(responsive.locator(".device--tablet").count() == 1, "existing multi-device project keeps its tablet")
            check(desktop.locator("[data-desktop-showcase] img").count() == 1, "existing multi-device project keeps its desktop screenshot")
            check(not page_errors, "client navigation completes without runtime errors")
            browser.close()
    finally:
        if projects:
            cleanup(projects)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"FAIL  {error}", file=sys.stderr)
        raise
