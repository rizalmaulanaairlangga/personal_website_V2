import "./gallery.css";
import { createClient } from "@supabase/supabase-js";

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
  let mobile = null;
  let desktops = [];
  try {
    const supa = client();
    const { data, error } = await supa
      .from("project_screenshots")
      .select("image_path,view_type,sort_order,alt_text")
      .eq("project_id", projectId)
      .order("sort_order");
    if (error) throw error;
    mobile = (data || []).find((r) => r.view_type === "mobile") || null;
    desktops = (data || []).filter((r) => r.view_type === "desktop").slice(0, 3);
  } catch {
    return null;
  }
  if (!mobile && !desktops.length) return null;

  const d = [desktops[0] || null, desktops[1] || null, desktops[2] || null];
  const alt = (r, fallback) => r.alt_text || fallback;
  return (
    <section
      aria-label="Project screenshots"
      data-gallery-section
      className="gallery-section"
    >
      <div className="gallery-container">
        {(mobile || d[0]) ? (
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
            {d[0] ? (
              <div data-device="tablet" className="device device--tablet">
                <div className="device-notch" />
                <div className="device-screen">
                  <img
                    src={shotUrl(d[0].image_path)}
                    alt={alt(d[0], projectName + " tablet screenshot")}
                    loading="lazy"
                    decoding="async"
                    className="device-img"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {d[2] ? (
          <div data-desktop-showcase className="desktop-showcase">
            <div className="desktop-frame">
              <img
                src={shotUrl(d[2].image_path)}
                alt={alt(d[2], projectName + " desktop screenshot 3")}
                loading="lazy"
                decoding="async"
                className="desktop-img"
              />
            </div>
          </div>
        ) : null}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              const section=document.querySelector('[data-gallery-section]');
              if(!section) return;
              const row=document.querySelector('[data-device-row]');
              const desktop=document.querySelector('[data-desktop-showcase]');
              const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              if(reduce){
                if(row) row.classList.add('is-visible');
                if(desktop) desktop.classList.add('is-visible');
                return;
              }
              const io=new IntersectionObserver((entries)=>{
                entries.forEach(e=>{
                  if(e.isIntersecting){
                    if(row) row.classList.add('is-visible');
                    if(desktop) desktop.classList.add('is-visible');
                    io.disconnect();
                  }
                });
              },{threshold:0.15, rootMargin:'0px 0px -10% 0px'});
              io.observe(section);
            })();`,
        }}
      />
    </section>
  );
}
