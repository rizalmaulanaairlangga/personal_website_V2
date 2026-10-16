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
    <section aria-label="Project screenshots" className="bg-[#0A0404] border-b border-white/[0.06] py-8 lg:py-10">
      <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {mobile ? (
            <div className="overflow-hidden rounded-[14px] bg-black border border-white/[0.10] relative md:row-span-2 min-h-[320px] md:min-h-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shotUrl(mobile.image_path)}
                alt={alt(mobile, projectName + " mobile screenshot")}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          ) : null}
          {d.map((shot, i) =>
            shot ? (
              <div
                key={shot.image_path}
                className={`overflow-hidden rounded-[14px] bg-black border border-white/[0.10] aspect-[16/10] relative ${!mobile && i === 2 ? "md:col-span-2" : ""} ${mobile && i === 2 ? "md:col-start-2" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shotUrl(shot.image_path)}
                  alt={alt(shot, projectName + " desktop screenshot " + (i + 1))}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
