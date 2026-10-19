import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact | Rizal Maulana Airlangga",
  description: "Get in touch about project collaboration, internships, PKL opportunities, technical discussions, or feedback.",
};

const PORTRAIT = {
  src: "/images/modern-coding-workspace.png",
  alt: "Rizal working at his desk on a coding project",
};

const GALLERY = [
  {
    href: "/work/absensi-muda-mudi-gemurung-2",
    src: "/images/projects/absensi-muda-mudi-gemurung-2/desktop-absensi-muda-mudi-gemurung-2.png",
    sizes: "(min-width: 1024px) 62vw, 100vw",
    name: "Absensi Muda-Mudi Gemurung 2",
    type: "Attendance Web App",
    ratio: "aspect-[16/9]",
    span: "sm:col-span-2",
    offset: "",
    badge: "Latest Project",
    label: "Desktop dashboard of the attendance web app",
  },
  {
    href: "/work/assetrack-3d-landing-page",
    src: "/images/projects/assetrack-3d-landing-page/phone-assetrack-3d-landing-page.jpeg",
    sizes: "(min-width: 1024px) 31vw, 100vw",
    name: "AssetTrack 3D Landing Page",
    type: "3D Landing Page",
    ratio: "aspect-[3/4]",
    span: "",
    offset: "sm:mt-12 lg:mt-16",
    label: "Mobile view of the 3D landing page",
  },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-[#0A0404] text-[#F0F3FF] overflow-x-clip [overscroll-behavior:none]">
      <SiteNav />
      <div className="relative z-10 bg-[#0A0404]">
        <section className="pt-[76px] md:pt-[92px] border-b border-white/[0.06]">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] py-10 lg:py-20 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 items-end">
            <div className="min-w-0">
              <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.16em] uppercase text-white/60 flex items-center gap-2">
                <span className="text-[#7AB8E8]">✦</span> Open to opportunities
              </p>
              <h1 className="mt-4 text-[44px] sm:text-[60px] lg:text-[80px] xl:text-[88px] font-semibold tracking-[-0.04em] leading-[0.95] text-white">
                <span className="block">Have an idea? Let&apos;s</span>
                <span className="block">
                  <span
                    className="italic font-normal tracking-[-0.02em] ml-[0.04em]"
                    style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                  >
                    explore
                  </span>{" "}
                  it.
                </span>
              </h1>
            </div>
            <div className="flex flex-col items-start gap-6 lg:pb-2">
              <p className="text-[17px] lg:text-[19px] leading-[1.6] text-white/70 max-w-[46ch]">
                I&apos;m a developer in the making, always curious about what&apos;s possible with technology. I&apos;m open to
                interesting projects, new challenges, and opportunities to collaborate.
              </p>
              <a
                href="/work"
                className="detail-cta btn-motion inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white text-[#0A0404] text-[16px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-h-[52px]"
              >
                <span className="cta-label">View projects</span>
                <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center shrink-0">
                  <span aria-hidden="true" className="cta-arrow-viewport">
                    <span className="cta-arrow-icon cta-arrow-icon-back">→</span>
                    <span className="cta-arrow-icon cta-arrow-icon-front">→</span>
                  </span>
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06]">
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 items-stretch">
            <figure className="relative m-0 overflow-hidden rounded-[20px] lg:rounded-[24px] border border-white/[0.1] bg-white/[0.03] aspect-[4/5] lg:aspect-auto lg:min-h-[520px] flex">
              <Image
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={PORTRAIT.src}
                alt={PORTRAIT.alt}
                priority
                className="object-cover object-[center_35%]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[20px] lg:rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
              <div className="pointer-events-none absolute inset-0 rounded-[20px] lg:rounded-[24px] border border-white/[0.06] mix-blend-overlay" />
            </figure>

            <div className="contact-panel rounded-[20px] lg:rounded-[24px] p-5 sm:p-7 lg:p-9">
              <ContactForm />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1840px] px-[3.2%] md:px-[1.6%] lg:px-[1%] py-10 lg:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[14px] lg:text-[15px] font-mono font-semibold tracking-[0.16em] uppercase text-white/60 flex items-center gap-2">
                  <span className="text-[#7AB8E8]">✦</span> Selected work
                </p>
                <h2 className="mt-3 text-[30px] sm:text-[38px] lg:text-[46px] font-semibold tracking-[-0.035em] leading-[1] text-white">
                  A few things I&apos;ve built
                </h2>
              </div>
              <a
                href="/work"
                className="group inline-flex items-center gap-2 text-[14px] lg:text-[15px] font-semibold text-white hover:text-[#7AB8E8] transition-colors"
              >
                View all projects
                <span className="arrow-mark w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 items-start">
              {GALLERY.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`group relative block overflow-hidden rounded-[20px] lg:rounded-[24px] border border-white/[0.08] bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7AB8E8] ${item.span} ${item.offset}`}
                >
                  <div className={`relative w-full overflow-hidden ${item.ratio}`}>
                    <Image
                      fill
                      sizes={item.sizes}
                      src={item.src}
                      alt={`${item.name} — ${item.label}`}
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
                      {item.badge && (
                        <span className="mb-2 inline-flex items-center rounded-full border border-[#7AB8E8]/45 bg-[#7AB8E8]/15 px-3 py-1 text-[10px] lg:text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#7AB8E8]">
                          {item.badge}
                        </span>
                      )}
                      <p className="text-[17px] lg:text-[22px] font-semibold tracking-[-0.01em] text-white">{item.name}</p>
                      <p className="mt-1 text-[11px] lg:text-[12px] font-mono uppercase tracking-[0.16em] text-white/70">{item.type}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
