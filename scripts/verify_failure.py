"""Partial-failure check: an upload succeeds, the database write then fails.

The CMS must release the objects it just uploaded rather than leaving them
stranded in the bucket.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error
import http.cookiejar
import uuid
import zlib
import struct

BASE = os.environ.get("CMS_BASE", "http://localhost:3000")
CREDS = os.environ.get(
    "CMS_CREDENTIALS_FILE", os.path.join(os.environ["TEMP"], "cms_admin_credentials.txt")
)
ENV = os.environ.get("CMS_ENV_FILE", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env.local"))

env = {}
for line in open(ENV, encoding="utf-8"):
    m = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", line)
    if m:
        env[m[1]] = m[2].strip().strip('"').strip("'")

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

jar = http.cookiejar.CookieJar()
authed = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def api(path, method="GET", body=None, raw=None, headers=None):
    hdrs = dict(headers or {})
    data = None
    if raw is not None:
        data = raw
    elif body is not None:
        data = json.dumps(body).encode()
        hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=hdrs)
    try:
        r = authed.open(req, timeout=120)
        return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def png(w, h, rgb):
    raw = b""
    for _ in range(h):
        raw += b"\x00" + bytes(rgb) * w

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)) +
            chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


def upload(role, data, filename, name):
    boundary = "----cmsfail" + uuid.uuid4().hex
    parts = []
    for key, value in (("projectName", name), ("role", role)):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{value}\r\n".encode())
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\nContent-Type: image/png\r\n\r\n".encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return api("/api/upload", "POST", raw=b"".join(parts),
               headers={"Content-Type": "multipart/form-data; boundary=" + boundary})


def storage_state(path):
    """Authoritative check: list the bucket with the service role.

    The public URL is served through a CDN that can still answer from cache
    after an object is removed.
    """
    parts = path.split("/")
    file_name = parts.pop()
    folder = "/".join(parts)
    req = urllib.request.Request(
        env["NEXT_PUBLIC_SUPABASE_URL"] + "/storage/v1/object/list/portfolio-proyek",
        data=json.dumps({"prefix": folder + "/"}).encode(),
        headers={"apikey": env["SUPABASE_SERVICE_ROLE_KEY"],
                 "Authorization": "Bearer " + env["SUPABASE_SERVICE_ROLE_KEY"],
                 "Content-Type": "application/json"},
        method="POST",
    )
    rows = json.loads(urllib.request.urlopen(req, timeout=60).read().decode())
    return "present" if any(r.get("name") == file_name for r in rows) else "absent"


results = []


def check(name, ok, detail=""):
    results.append(ok)
    print(("PASS  " if ok else "FAIL  ") + name + (("  | " + str(detail)[:200]) if detail else ""))


api("/api/auth/signin", "POST", {"email": EMAIL, "password": PASSWORD})

NAME = "CMS Failure Check " + uuid.uuid4().hex[:6]
SLUG = "cms-fail-" + uuid.uuid4().hex[:8]

status, payload = api("/api/projects", "POST", {"name": NAME, "slug": SLUG, "source": "personal"})
created = json.loads(payload)
pid = created["project"]["id"]
check("a project is created for the failure test", status == 201, "status=" + str(status))

img = png(48, 32, (200, 60, 60))
status, payload = upload("hero", img, "hero.png", NAME)
hero_path = json.loads(payload).get("path")
check("the hero uploads before the failing write", status == 200 and bool(hero_path), "status=" + str(status))
check("the uploaded object exists at this point", storage_state(hero_path) == "present")

# The write fails: "source" has a CHECK constraint that only allows two values.
status, payload = api("/api/projects/" + pid, "PATCH", {
    "project": {"name": NAME, "slug": SLUG, "source": "not-a-valid-origin"},
    "screenshots": {"hero": hero_path, "mobile": None, "tablet": None, "desktop": None},
    "previous": {"hero": None, "mobile": None, "tablet": None, "desktop": None},
})
check("the database write is rejected by the constraint", status >= 400, "status=" + str(status) + " " + payload[:130])
check("the error message names the constraint", "source" in payload.lower(), payload[:180])

# The CMS releases the object it uploaded for the failed attempt.
status, payload = api("/api/upload?path=" + urllib.parse.quote(hero_path) + "&projectName=" + urllib.parse.quote(NAME), "DELETE")
check("the orphaned object is released", status == 200 and storage_state(hero_path) == "absent", "status=" + str(status) + " body=" + payload[:200] + " state=" + storage_state(hero_path))

# The record itself must not have been changed by the failed write.
req = urllib.request.Request(
    env["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1/proyek_web?select=source,foto_storage_path&slug=eq." + SLUG,
    headers={"apikey": env["NEXT_PUBLIC_SUPABASE_ANON_KEY"], "Authorization": "Bearer " + env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]},
)
rows = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
check("the failed write left the record untouched", len(rows) == 1 and rows[0]["source"] == "personal" and not rows[0]["foto_storage_path"], str(rows)[:150])

# Clean up the test record.
status, payload = api("/api/projects/" + pid, "DELETE")
check("the test record is removed", status == 200, "status=" + str(status))

print("\n" + "=" * 60)
print(f"RESULT: {sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
