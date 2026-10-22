"""End-to-end verification of the Portfolio CMS.

Covers: unauthenticated access, sign-in, project listing, slug validation,
create, update, screenshot upload/replace/remove, Storage verification, and
the delete path.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error
import http.cookiejar
import uuid
import mimetypes

BASE = os.environ.get("CMS_BASE", "http://localhost:3000")
CREDS = os.environ.get(
    "CMS_CREDENTIALS_FILE", os.path.join(os.environ["TEMP"], "cms_admin_credentials.txt")
)

EMAIL = os.environ.get("CMS_ADMIN_EMAIL")
PASSWORD = os.environ.get("CMS_ADMIN_PASSWORD")

if not (EMAIL and PASSWORD):
    with open(CREDS, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("email:"):
                EMAIL = line.split(":", 1)[1].strip()
            if line.startswith("password:"):
                PASSWORD = line.split(":", 1)[1].strip()

if not (EMAIL and PASSWORD):
    sys.exit("Set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD, or provide " + CREDS)

results = []


def check(name, ok, detail=""):
    results.append({"name": name, "ok": bool(ok), "detail": str(detail)[:220]})
    print(("PASS  " if ok else "FAIL  ") + name + (("  | " + str(detail)[:220]) if detail else ""))


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


opener = urllib.request.build_opener(NoRedirect)

# --- 1. Unauthenticated access -------------------------------------------------
try:
    r = opener.open(BASE + "/", timeout=30)
    body = r.read().decode("utf-8", "replace")
    check("unauthenticated / is blocked", r.status in (302, 307) and "/login" in (r.headers.get("Location") or ""), "status=" + str(r.status))
except urllib.error.HTTPError as e:
    check("unauthenticated / is blocked", e.code in (302, 307) and "/login" in (e.headers.get("Location") or ""), "status=" + str(e.code))
except Exception as e:
    check("unauthenticated / is blocked", False, repr(e))

# API must answer 401, not data.
try:
    r = opener.open(BASE + "/api/projects", timeout=30)
    check("unauthenticated /api/projects returns 401", False, "status=" + str(r.status))
except urllib.error.HTTPError as e:
    check("unauthenticated /api/projects returns 401", e.code == 401, "status=" + str(e.code))
except Exception as e:
    check("unauthenticated /api/projects returns 401", False, repr(e))

try:
    r = opener.open(BASE + "/api/upload", timeout=30)
    check("unauthenticated /api/upload returns 401", False, "status=" + str(r.status))
except urllib.error.HTTPError as e:
    check("unauthenticated /api/upload returns 401", e.code == 401, "status=" + str(e.code))
except Exception as e:
    check("unauthenticated /api/upload returns 401", False, repr(e))

# --- 2. Sign in ---------------------------------------------------------------
jar = http.cookiejar.CookieJar()
authed = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def api(path, method="GET", body=None, raw=None, headers=None):
    url = BASE + path
    data = None
    hdrs = dict(headers or {})
    if raw is not None:
        data = raw
    elif body is not None:
        data = json.dumps(body).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method, headers=hdrs)
    try:
        r = authed.open(req, timeout=120)
        payload = r.read().decode("utf-8", "replace")
        return r.status, payload
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


status, payload = api("/api/auth/signin", "POST", {"email": EMAIL, "password": PASSWORD})
check("sign in succeeds", status == 200, "status=" + str(status) + " " + payload[:120])

status, payload = api("/api/auth/signin", "POST", {"email": EMAIL, "password": "wrong-password"})
check("sign in rejects a bad password", status == 401, "status=" + str(status))

status, payload = api("/api/auth/session")
check("session is readable after sign in", status == 200 and '"session"' in payload and 'null' not in payload[:40], payload[:100])

# --- 3. Listing ---------------------------------------------------------------
status, payload = api("/api/projects")
listing = json.loads(payload) if status == 200 else {}
check("project list loads", status == 200 and isinstance(listing.get("projects"), list), "status=" + str(status) + " count=" + str(len(listing.get("projects", []))))
check("existing projects are visible", len(listing.get("projects", [])) == 8, "count=" + str(len(listing.get("projects", []))))

status, payload = api("/api/projects?search=pens")
found = json.loads(payload) if status == 200 else {}
check("search by name works", status == 200 and len(found.get("projects", [])) >= 1 and all("pens" in p["name"].lower() or "pens" in (p.get("slug") or "").lower() for p in found.get("projects", [])), "n=" + str(len(found.get("projects", []))))

status, payload = api("/api/projects?search=zzzznope")
check("search with no match returns empty", status == 200 and len(json.loads(payload).get("projects", [])) == 0)

# --- 4. Slug validation -------------------------------------------------------
status, payload = api("/api/validate-slug", "POST", {"slug": "soulstory"})
check("existing slug is rejected", status == 409 and "already used" in payload, "status=" + str(status) + " " + payload[:90])

status, payload = api("/api/validate-slug", "POST", {"slug": "Not A Slug"})
check("invalid slug format is rejected", status == 400 and "lowercase" in payload, "status=" + str(status) + " " + payload[:90])

status, payload = api("/api/validate-slug", "POST", {"slug": "a-fresh-slug-" + uuid.uuid4().hex[:8]})
check("unused slug is accepted", status == 200 and json.loads(payload).get("valid") is True, "status=" + str(status) + " " + payload[:90])

# --- 5. Create a project ------------------------------------------------------
SLUG = "cms-verify-" + uuid.uuid4().hex[:8]
status, payload = api("/api/projects", "POST", {
    "name": "CMS Verification Project",
    "slug": SLUG,
    "source": "personal",
})
created = json.loads(payload) if status == 201 else {}
PROJECT_ID = created.get("project", {}).get("id")
check("project is created", status == 201 and bool(PROJECT_ID), "status=" + str(status) + " " + payload[:120])

# --- 6. Update the project ----------------------------------------------------
status, payload = api("/api/projects/" + PROJECT_ID, "PATCH", {
    "project": {
        "name": "CMS Verification Project",
        "slug": SLUG,
        "description": "A record created by the automated check.",
        "date": "2026-10-21",
        "project_type": "Verification",
        "timeframe": "1 day",
        "hero_subtitle": "Checking the pipeline end to end",
        "project_context": "Automated verification",
        "team_quote": "A short closing statement for the check.",
        "link_web": "https://example.com",
        "repo_link": "https://github.com/example/example",
        "source": "personal",
        "frameworks": ["Next.js", "TypeScript", "Supabase"],
        "brief": {"body": "Overview body.", "title": "Overview", "kicker": "Brief"},
        "challenge": {"body": "Challenge body.", "title": "Challenge", "kicker": "Challenge"},
        "solution": {"body": "Solution body.", "title": "Solution", "kicker": "Solution"},
        "credits": [{"name": "Rizal Maulana Airlangga", "role": "Frontend"}],
    },
    "screenshots": {"hero": None, "mobile": None, "tablet": None, "desktop": None},
    "previous": {"hero": None, "mobile": None, "tablet": None, "desktop": None},
})
updated = json.loads(payload) if status == 200 else {}
check("project is updated", status == 200 and updated.get("project", {}).get("project_type") == "Verification", "status=" + str(status) + " " + payload[:120])
check("frameworks round-trip", updated.get("project", {}).get("frameworks") == ["Next.js", "TypeScript", "Supabase"], str(updated.get("project", {}).get("frameworks")))
check("credits round-trip", updated.get("project", {}).get("credits") == [{"name": "Rizal Maulana Airlangga", "role": "Frontend"}], str(updated.get("project", {}).get("credits")))
check("brief JSON round-trip", (updated.get("project", {}).get("brief") or {}).get("body") == "Overview body.", str(updated.get("project", {}).get("brief")))

# The portfolio reads this row through its own query.
supa_url = re.search(r"NEXT_PUBLIC_SUPABASE_URL=(\S+)", open(os.environ.get("CMS_ENV_FILE", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local")), encoding="utf-8").read()).group(1)
anon = re.search(r"NEXT_PUBLIC_SUPABASE_ANON_KEY=(\S+)", open(os.environ.get("CMS_ENV_FILE", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local")), encoding="utf-8").read()).group(1)
req = urllib.request.Request(
    supa_url + "/rest/v1/proyek_web?select=name,slug,project_type,frameworks&slug=eq." + SLUG,
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
rows = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the public portfolio query can read the new record", len(rows) == 1 and rows[0]["slug"] == SLUG, str(rows)[:140])

# --- 7. Screenshot upload -----------------------------------------------------
def png_bytes(w, h, rgb):
    import zlib, struct
    raw = b""
    for _ in range(h):
        raw += b"\x00" + bytes(rgb) * w

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) +
            chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


def upload(role, data, filename, name="CMS Verification Project"):
    boundary = "----cmsverify" + uuid.uuid4().hex
    parts = []
    for key, value in (("projectName", name), ("role", role)):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{value}\r\n".encode())
    parts.append(
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\n"
        f"Content-Type: image/png\r\n\r\n".encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    return api("/api/upload", "POST", raw=body, headers={"Content-Type": "multipart/form-data; boundary=" + boundary})


img = png_bytes(64, 40, (122, 184, 232))
status, payload = upload("hero", img, "hero.png")
up = json.loads(payload) if status == 200 else {}
hero_path = up.get("path")
check("hero image uploads", status == 200 and bool(hero_path), "status=" + str(status) + " " + payload[:120])
check("uploaded path follows the bucket convention", bool(hero_path) and hero_path.startswith("CMS Verification Project/Foto/hero-"), str(hero_path))

status, payload = upload("mobile", img, "phone.png")
mobile_path = json.loads(payload).get("path") if status == 200 else None
check("mobile image uploads", status == 200 and bool(mobile_path), "status=" + str(status) + " " + payload[:120])

# --- 8. Save with the uploaded images ----------------------------------------
status, payload = api("/api/projects/" + PROJECT_ID, "PATCH", {
    "project": {
        "name": "CMS Verification Project",
        "slug": SLUG,
        "source": "personal",
    },
    "screenshots": {"hero": hero_path, "mobile": mobile_path, "tablet": None, "desktop": None},
    "previous": {"hero": None, "mobile": None, "tablet": None, "desktop": None},
})
saved = json.loads(payload) if status == 200 else {}
check("save with screenshots succeeds", status == 200, "status=" + str(status) + " " + payload[:140])
check("hero url is derived from the storage path", (saved.get("project", {}).get("foto_public_url") or "").endswith(hero_path.replace(" ", "%20")), str(saved.get("project", {}).get("foto_public_url"))[:150])
check("hero storage path is stored", saved.get("project", {}).get("foto_storage_path") == hero_path)
check("hero file name is stored", saved.get("project", {}).get("foto_file_name") == hero_path.split("/")[-1], str(saved.get("project", {}).get("foto_file_name")))

# The gallery row the public gallery component reads.
req = urllib.request.Request(
    supa_url + "/rest/v1/project_screenshots?select=image_path,view_type,sort_order&project_id=eq." + PROJECT_ID,
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
shots = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("a project_screenshots row was written for mobile", len(shots) == 1 and shots[0]["view_type"] == "mobile" and shots[0]["image_path"] == mobile_path, str(shots)[:160])
check("sort_order matches the public renderer's expectation", len(shots) == 1 and shots[0]["sort_order"] == 0, str(shots)[:160])

# --- 9. Verify the objects really exist ---------------------------------------
status, payload = api("/api/upload", "PUT", {"paths": [hero_path, mobile_path]})
check("uploaded objects are confirmed in Storage", status == 200 and json.loads(payload).get("verified") is True, "status=" + str(status) + " " + payload[:120])

public = supa_url + "/storage/v1/object/public/portfolio-proyek/" + hero_path.replace(" ", "%20")
try:
    r = urllib.request.urlopen(public, timeout=30)
    data = r.read()
    check("the hero object is reachable at its public URL", r.status == 200 and data[:4] == b"\x89PNG", "status=" + str(r.status) + " bytes=" + str(len(data)))
except Exception as e:
    check("the hero object is reachable at its public URL", False, repr(e)[:120])

# --- 10. Replace an image -----------------------------------------------------
img2 = png_bytes(80, 50, (255, 107, 107))
status, payload = upload("mobile", img2, "phone-v2.png")
mobile2 = json.loads(payload).get("path") if status == 200 else None
check("replacement upload gets a new path", status == 200 and mobile2 and mobile2 != mobile_path, "new=" + str(mobile2) + " old=" + str(mobile_path))

status, payload = api("/api/projects/" + PROJECT_ID, "PATCH", {
    "project": {"name": "CMS Verification Project", "slug": SLUG, "source": "personal"},
    "screenshots": {"hero": hero_path, "mobile": mobile2, "tablet": None, "desktop": None},
    "previous": {"hero": None, "mobile": mobile_path, "tablet": None, "desktop": None},
})
repl = json.loads(payload) if status == 200 else {}
check("replacement is saved", status == 200, "status=" + str(status) + " " + payload[:140])
check("the replaced object is released after the save", mobile_path in (repl.get("cleaned") or []), "cleaned=" + str(repl.get("cleaned")) + " skipped=" + str(repl.get("skipped")))

# The public URL is served through a CDN that can still answer from cache
# after an object is removed, so the authoritative check is a bucket listing
# with the service role.
svc = re.search(r"SUPABASE_SERVICE_ROLE_KEY=(\S+)", open(os.environ.get("CMS_ENV_FILE", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local")), encoding="utf-8").read()).group(1)


def bucket_state(path):
    parts = path.split("/")
    file_name = parts.pop()
    folder = "/".join(parts)
    req = urllib.request.Request(
        supa_url + "/storage/v1/object/list/portfolio-proyek",
        data=json.dumps({"prefix": folder + "/"}).encode(),
        headers={"apikey": svc, "Authorization": "Bearer " + svc, "Content-Type": "application/json"},
        method="POST",
    )
    rows = json.loads(urllib.request.urlopen(req, timeout=60).read().decode())
    return "present" if any(r.get("name") == file_name for r in rows) else "absent"


check("the replaced object is gone from the bucket", bucket_state(mobile_path) == "absent", bucket_state(mobile_path))
check("a control object is still present in the bucket", bucket_state("SoulStory/Foto/soulstory.png") == "present", bucket_state("SoulStory/Foto/soulstory.png"))
check("the replacement object is in the bucket", bucket_state(mobile2) == "present", bucket_state(mobile2))

req = urllib.request.Request(
    supa_url + "/rest/v1/project_screenshots?select=image_path,view_type&project_id=eq." + PROJECT_ID,
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
shots = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the gallery row points at the new object", len(shots) == 1 and shots[0]["image_path"] == mobile2, str(shots)[:160])

# --- 11. Remove an image ------------------------------------------------------
status, payload = api("/api/projects/" + PROJECT_ID, "PATCH", {
    "project": {"name": "CMS Verification Project", "slug": SLUG, "source": "personal"},
    "screenshots": {"hero": hero_path, "mobile": None, "tablet": None, "desktop": None},
    "previous": {"hero": None, "mobile": mobile2, "tablet": None, "desktop": None},
})
rm = json.loads(payload) if status == 200 else {}
check("removing an image saves", status == 200, "status=" + str(status) + " " + payload[:140])
check("the removed object is released", mobile2 in (rm.get("cleaned") or []), "cleaned=" + str(rm.get("cleaned")))

req = urllib.request.Request(
    supa_url + "/rest/v1/project_screenshots?select=image_path&project_id=eq." + PROJECT_ID,
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
shots = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the gallery row is gone after removal", len(shots) == 0, str(shots)[:120])

# --- 12. The hero of another project is untouched -----------------------------
req = urllib.request.Request(
    supa_url + "/rest/v1/proyek_web?select=slug,foto_storage_path&slug=eq.soulstory",
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
other = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("another project's hero is untouched", len(other) == 1 and other[0]["foto_storage_path"] == "SoulStory/Foto/soulstory.png", str(other)[:160])

# --- 13. Delete the verification project --------------------------------------
status, payload = api("/api/projects/" + PROJECT_ID, "DELETE")
deleted = json.loads(payload) if status == 200 else {}
check("project is deleted", status == 200 and deleted.get("success") is True, "status=" + str(status) + " " + payload[:140])

req = urllib.request.Request(
    supa_url + "/rest/v1/proyek_web?select=id&slug=eq." + SLUG,
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
left = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the deleted record is gone", len(left) == 0, str(left)[:120])

req = urllib.request.Request(
    supa_url + "/rest/v1/project_screenshots?select=id&project_id=eq." + PROJECT_ID,
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
leftshots = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the deleted project's gallery rows are gone", len(leftshots) == 0, str(leftshots)[:120])

# --- 14. The original records are intact --------------------------------------
req = urllib.request.Request(
    supa_url + "/rest/v1/proyek_web?select=id",
    headers={"apikey": anon, "Authorization": "Bearer " + anon},
)
total = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the original eight projects are intact", len(total) == 8, "count=" + str(len(total)))

# --- 15. Sign out -------------------------------------------------------------
status, payload = api("/api/auth/signout", "POST")
check("sign out succeeds", status == 200, "status=" + str(status))
status, payload = api("/api/projects")
check("the session is dead after sign out", status == 401, "status=" + str(status))

# --- Summary ------------------------------------------------------------------
passed = sum(1 for r in results if r["ok"])
failed = [r for r in results if not r["ok"]]
print("\n" + "=" * 60)
print(f"RESULT: {passed}/{len(results)} checks passed")
if failed:
    print("\nFAILED:")
    for f in failed:
        print(f"  - {f['name']}  |  {f['detail']}")
    sys.exit(1)
print("ALL CHECKS PASSED")
