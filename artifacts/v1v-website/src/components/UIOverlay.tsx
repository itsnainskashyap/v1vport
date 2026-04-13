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
