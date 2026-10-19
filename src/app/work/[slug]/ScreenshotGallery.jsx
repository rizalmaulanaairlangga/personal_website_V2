import "./gallery.css";
import { createClient } from "@supabase/supabase-js";
import GalleryReveal from "./GalleryReveal";

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function shotUrl(path) {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/storage/v1/object/public/portfolio-proyek/" +
    path.split("/").map(encodeURIComponent).join("/")
  );
}

export default async function ScreenshotGallery({ projectId, projectName }) {
  let rows = [];
  try {
    const supa = client();
    const { data, error } = await supa
      .from("project_screenshots")
      .select("image_path,view_type,sort_order,alt_text")
      .eq("project_id", projectId)
      .order("sort_order");
    if (error) throw error;
    rows = data || [];
  } catch {
    rows = [];
  }

  const mobile = rows.find((r) => r.view_type === "mobile") || null;
  const tablet = rows.find((r) => r.view_type === "tablet") || null;
  const desktopRows = rows.filter((r) => r.view_type === "desktop");
  const desktopBelow = desktopRows[desktopRows.length - 1] || null;
  if (!mobile && !tablet && !desktopBelow) return null;

  const alt = (r, fallback) => r.alt_text || fallback;
  const hasDeviceRow = Boolean(mobile || tablet);

  return (
    <section
      aria-label="Project screenshots"
      data-gallery-section={projectId}
      className="gallery-section"
    >
      <GalleryReveal projectId={projectId} />
      <div className="gallery-container">
        {hasDeviceRow ? (
          <div data-device-row className="device-row">
            {mobile ? (
              <div data-device="phone" className="device device--phone">
                <div className="device-notch" />
                <div className="device-screen">
                  <img
                    src={shotUrl(mobile.image_path)}
                    alt={alt(mobile, projectName + " mobile screenshot")}
                    loading="lazy"
                    decoding="async"
                    className="device-img"
                  />
                </div>
              </div>
            ) : null}
            {tablet ? (
              <div data-device="tablet" className="device device--tablet">
                <div className="device-notch" />
                <div className="device-screen">
                  <img
                    src={shotUrl(tablet.image_path)}
                    alt={alt(tablet, projectName + " tablet screenshot")}
                    loading="lazy"
                    decoding="async"
                    className="device-img"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {desktopBelow ? (
          <div data-desktop-showcase className="desktop-showcase">
            <div className="desktop-frame">
              <img
                src={shotUrl(desktopBelow.image_path)}
                alt={alt(desktopBelow, projectName + " desktop screenshot")}
                loading="lazy"
                decoding="async"
                className="desktop-img"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
