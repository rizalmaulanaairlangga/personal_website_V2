import "./gallery.css";
import GalleryReveal from "./GalleryReveal";
import { orderedMobileScreenshots } from "./screenshot-layout.mjs";

export function shotUrl(path) {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/storage/v1/object/public/portfolio-proyek/" +
    path.split("/").map(encodeURIComponent).join("/")
  );
}

export default function ScreenshotGallery({ projectId, projectName, rows, layout }) {
  const mobileRows = orderedMobileScreenshots(rows);
  const tablet = rows.find((r) => r.view_type === "tablet") || null;
  const desktopRows = rows.filter((r) => r.view_type === "desktop");
  const mobileOnly = layout === "mobile_only";
  const desktopBelow = mobileOnly ? null : desktopRows[desktopRows.length - 1] || null;
  if ((mobileOnly && mobileRows.length === 0) || (!mobileOnly && !mobileRows.length && !tablet && !desktopBelow)) {
    return null;
  }

  const alt = (r, fallback) => r.alt_text || fallback;
  const hasDeviceRow = mobileOnly ? mobileRows.length > 0 : Boolean(mobileRows[0] || tablet);

  return (
    <section
      aria-label="Project screenshots"
      data-gallery-section={projectId}
      data-gallery-layout={layout}
      className="gallery-section"
    >
      <GalleryReveal projectId={projectId} />
      <div className="gallery-container">
        {hasDeviceRow ? (
          <div data-device-row className={`device-row${mobileOnly ? " device-row--mobile-only" : ""}`}>
            {mobileOnly
              ? mobileRows.map((row, index) => (
                  <div
                    key={row.id || row.image_path}
                    data-device="phone"
                    className={`device device--phone mobile-only-phone mobile-only-phone--${mobileRows.length === 1 ? "center" : index === 0 ? "left" : index === mobileRows.length - 1 ? "right" : "center"}`}
                  >
                    <div className="device-notch" />
                    <div className="device-screen">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        data-screenshot-image
                        src={shotUrl(row.image_path)}
                        alt={alt(row, `${projectName} mobile screenshot ${index + 1}`)}
                        loading="lazy"
                        decoding="async"
                        className="device-img device-img--mobile"
                      />
                    </div>
                  </div>
                ))
              : mobileRows[0] ? (
                  <div data-device="phone" className="device device--phone">
                    <div className="device-notch" />
                    <div className="device-screen">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        data-screenshot-image
                        src={shotUrl(mobileRows[0].image_path)}
                        alt={alt(mobileRows[0], projectName + " mobile screenshot")}
                        loading="lazy"
                        decoding="async"
                        className="device-img"
                      />
                    </div>
                  </div>
                ) : null}
            {!mobileOnly && tablet ? (
              <div data-device="tablet" className="device device--tablet">
                <div className="device-notch" />
                <div className="device-screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-screenshot-image
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-screenshot-image
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
