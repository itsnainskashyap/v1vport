import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGetSettings, useGetProjects } from "@workspace/api-client-react";
import { Navigation } from "./Navigation";
import { ProjectModal } from "./ProjectModal";
import { ContactPopup } from "./ContactPopup";

interface Props {
  scrollProgress: number;
  onNavigate: (section: string) => void;
  selectedCardIndex?: number | null;
  onClearCardSelection?: () => void;
}

const PROJECT_IMAGES = [
  "projects/prometheus.png",
  "projects/echo.png",
  "projects/patronus.png",
  "projects/maison-noir.png",
  "projects/stellar.png",
];

const ACCENT_COLORS = ["#55aaff", "#ff6644", "#44ffaa", "#ff44aa", "#aa88ff"];

function getActiveProject(scrollProgress: number): { index: number; opacity: number } | null {
  const zoneStart = 0.30;
  const zoneEnd = 0.58;
  const totalZone = zoneEnd - zoneStart;
  const count = 5;
  const perCard = totalZone / count;

  if (scrollProgress < zoneStart || scrollProgress > zoneEnd + 0.02) return null;

  for (let i = 0; i < count; i++) {
    const cardStart = zoneStart + i * perCard;
    const fadeIn = cardStart;
    const peakStart = cardStart + perCard * 0.2;
    const peakEnd = cardStart + perCard * 0.7;
    const fadeOut = cardStart + perCard;

    if (scrollProgress >= fadeIn && scrollProgress <= fadeOut) {
      let opacity = 1;
      if (scrollProgress < peakStart) {
        opacity = (scrollProgress - fadeIn) / (peakStart - fadeIn);
      } else if (scrollProgress > peakEnd) {
        opacity = 1 - (scrollProgress - peakEnd) / (fadeOut - peakEnd);
      }
      return { index: i, opacity: Math.max(0, Math.min(1, opacity)) };
    }
  }
  return null;
}

export function UIOverlay({ scrollProgress, onNavigate, selectedCardIndex, onClearCardSelection }: Props) {
  const { data: settings } = useGetSettings();
  const { data: projects } = useGetProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const basePath = import.meta.env.BASE_URL;
  const contactEmail = settings?.contactEmail || "hello@v1v.in";
  const whatsappNumber = settings?.socialLinks?.whatsapp || "+917282074603";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;
  const projectList = projects || [];

  useEffect(() => {
    if (selectedCardIndex !== null && selectedCardIndex !== undefined && projectList.length > 0) {
      const project = projectList[selectedCardIndex];
      if (project) {
        setSelectedProjectId(project.id);
        if (onClearCardSelection) onClearCardSelection();
      }
    }
  }, [selectedCardIndex, projectList, onClearCardSelection]);

  const scrollIndicatorOpacity = Math.max(0, 1 - scrollProgress * 8);
  const activeProject = getActiveProject(scrollProgress);

  const contactPanelOpacity = scrollProgress < 0.91 ? 0 : scrollProgress < 0.95
    ? (scrollProgress - 0.91) / 0.04
    : 1;

  return (
    <>
      <Navigation
        onNavigate={onNavigate}
        onContactClick={() => setShowContactPopup(true)}
      />

      <div
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center"
        style={{ opacity: scrollIndicatorOpacity, visibility: scrollIndicatorOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <p className="text-[8px] tracking-[0.3em] uppercase text-[rgba(255,255,255,0.15)] font-mono mb-3">
          SCROLL TO EXPLORE
        </p>
        <div className="w-[1px] h-10 bg-gradient-to-b from-[rgba(85,170,255,0.2)] to-transparent animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {activeProject && projectList[activeProject.index] && (
          <motion.div
            key={activeProject.index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: activeProject.opacity, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed z-10 pointer-events-none"
            style={{
              right: "clamp(24px, 5vw, 80px)",
              bottom: "clamp(60px, 12vh, 120px)",
            }}
          >
            {(() => {
              const proj = projectList[activeProject.index];
              const accent = ACCENT_COLORS[activeProject.index];
              const imgSrc = basePath + PROJECT_IMAGES[activeProject.index];
              return (
                <div className="pointer-events-auto" style={{ width: "clamp(240px, 22vw, 320px)" }}>
                  <div
                    className="relative overflow-hidden rounded-xl"
                    style={{
                      background: "rgba(5,8,18,0.88)",
                      backdropFilter: "blur(30px)",
                      border: `1px solid ${accent}25`,
                      boxShadow: `0 0 60px ${accent}10, 0 20px 60px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
                      <img
                        src={imgSrc}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        style={{ filter: "brightness(0.9) saturate(1.1)" }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, transparent 40%, rgba(5,8,18,0.95) 100%)`,
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className="text-[7px] font-mono tracking-[0.25em] uppercase px-2 py-1 rounded-full"
                          style={{
                            background: `${accent}18`,
                            border: `1px solid ${accent}30`,
                            color: accent,
                          }}
                        >
                          {String(activeProject.index + 1).padStart(2, "0")} / 05
                        </span>
                      </div>
                    </div>

                    <div className="px-4 pb-4 -mt-6 relative z-10">
                      <h3
                        className="text-sm font-bold tracking-[0.12em] uppercase mb-1"
                        style={{ color: "rgba(255,255,255,0.95)", textShadow: `0 0 20px ${accent}40` }}
                      >
                        {proj.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[8px] font-mono tracking-[0.2em] uppercase" style={{ color: `${accent}aa` }}>
                          {proj.category}
                        </span>
                        <span className="w-[3px] h-[3px] rounded-full" style={{ background: `${accent}60` }} />
                        <span className="text-[8px] font-mono tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {proj.year}
                        </span>
                      </div>
                      {proj.shortDescription && (
                        <p className="text-[9px] leading-relaxed mb-3 line-clamp-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {proj.shortDescription}
                        </p>
                      )}
                      <button
                        onClick={() => setSelectedProjectId(proj.id)}
                        className="group flex items-center gap-2 transition-all duration-300"
                        style={{ color: accent }}
                      >
                        <span className="text-[8px] font-mono tracking-[0.25em] uppercase group-hover:tracking-[0.35em] transition-all">
                          VIEW PROJECT
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-[1px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }}
                    />
                  </div>

                  <div className="flex justify-center gap-1.5 mt-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === activeProject.index ? "16px" : "4px",
                          height: "4px",
                          background: i === activeProject.index ? accent : "rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {contactPanelOpacity > 0.01 && (
        <div
          className="fixed inset-0 z-10 flex items-end justify-center pointer-events-none pb-8 md:pb-12 px-4"
          style={{ opacity: contactPanelOpacity }}
        >
          <div
            className="pointer-events-auto w-full max-w-lg"
            style={{
              background: "rgba(5,8,18,0.85)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(85,170,255,0.12)",
              borderRadius: "16px",
              boxShadow: "0 0 80px rgba(85,170,255,0.06), 0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[rgba(85,170,255,0.4)]" />
                <p className="text-[8px] tracking-[0.3em] uppercase text-[rgba(85,170,255,0.5)] font-mono">
                  LET'S COLLABORATE
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <a
                  href={`mailto:${contactEmail}`}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-[rgba(255,255,255,0.05)] hover:border-[rgba(85,170,255,0.2)] hover:bg-[rgba(85,170,255,0.04)] transition-all"
                >
                  <div className="w-8 h-8 rounded-full border border-[rgba(85,170,255,0.2)] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(85,170,255,0.7)" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 4L12 13 2 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono tracking-[0.2em] text-[rgba(255,255,255,0.3)] uppercase mb-0.5">EMAIL</p>
                    <p className="text-[11px] text-[rgba(255,255,255,0.6)] group-hover:text-[rgba(85,170,255,0.9)] transition-colors font-mono">
                      {contactEmail}
                    </p>
                  </div>
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-lg border border-[rgba(255,255,255,0.05)] hover:border-[rgba(37,211,102,0.2)] hover:bg-[rgba(37,211,102,0.04)] transition-all"
                >
                  <div className="w-8 h-8 rounded-full border border-[rgba(37,211,102,0.2)] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(37,211,102,0.7)">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.04.8.82-2.98-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono tracking-[0.2em] text-[rgba(255,255,255,0.3)] uppercase mb-0.5">WHATSAPP</p>
                    <p className="text-[11px] text-[rgba(255,255,255,0.6)] group-hover:text-[rgba(37,211,102,0.9)] transition-colors font-mono">
                      Message Us
                    </p>
                  </div>
                </a>
              </div>

              {settings?.contactPhone && (
                <div className="flex items-center gap-3 mb-5 px-3">
                  <div className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-[rgba(255,255,255,0.4)] font-mono">{settings.contactPhone}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <p className="text-[7px] font-mono tracking-[0.2em] text-[rgba(255,255,255,0.15)] uppercase mr-auto">
                  FOLLOW US
                </p>
                <div className="flex gap-2">
                  {settings?.socialLinks?.instagram && (
                    <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] hover:border-[rgba(228,64,95,0.3)] hover:bg-[rgba(228,64,95,0.08)] transition-all group">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" className="group-hover:stroke-[rgba(228,64,95,0.8)]">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="17.5" cy="6.5" r="1.5" fill="rgba(255,255,255,0.25)" stroke="none" className="group-hover:fill-[rgba(228,64,95,0.8)]" />
                      </svg>
                    </a>
                  )}
                  {settings?.socialLinks?.linkedin && (
                    <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,119,181,0.3)] hover:bg-[rgba(0,119,181,0.08)] transition-all group">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" className="group-hover:stroke-[rgba(0,119,181,0.8)]">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                  )}
                  {settings?.socialLinks?.twitter && (
                    <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] hover:border-[rgba(85,170,255,0.3)] hover:bg-[rgba(85,170,255,0.08)] transition-all group">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)" className="group-hover:fill-[rgba(85,170,255,0.8)]">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {settings?.socialLinks?.github && (
                    <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all group">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)" className="group-hover:fill-[rgba(255,255,255,0.7)]">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-3 left-6 z-10 pointer-events-none">
        <p className="text-[7px] text-[rgba(255,255,255,0.06)] font-mono tracking-[0.2em]">
          V1V © {new Date().getFullYear()}
        </p>
      </div>

      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="w-[1px] h-16 bg-[rgba(255,255,255,0.03)] relative rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-[rgba(85,170,255,0.4)] to-[rgba(170,85,255,0.3)] transition-all duration-300"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {selectedProjectId && (
          <ProjectModal
            projectId={selectedProjectId}
            onClose={() => setSelectedProjectId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContactPopup && (
          <ContactPopup
            contactEmail={contactEmail}
            contactPhone={settings?.contactPhone}
            whatsappLink={whatsappLink}
            socialLinks={settings?.socialLinks}
            onClose={() => setShowContactPopup(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
