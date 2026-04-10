import { useState, useEffect, useRef } from "react";
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

function clampOpacity(progress: number, fadeIn: number, peak: number, fadeOut: number): number {
  if (progress < fadeIn) return 0;
  if (progress < peak) {
    const range = peak - fadeIn;
    if (range <= 0) return 1;
    return Math.min(1, Math.max(0, (progress - fadeIn) / range));
  }
  if (progress < fadeOut) return 1;
  const fadeRange = 0.08;
  return Math.max(0, Math.min(1, 1 - (progress - fadeOut) / fadeRange));
}

export function UIOverlay({ scrollProgress, onNavigate, selectedCardIndex, onClearCardSelection }: Props) {
  const { data: settings } = useGetSettings();
  const { data: projects } = useGetProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const contactEmail = settings?.contactEmail || "hello@v1v.in";

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
  const bhLabelOpacity = clampOpacity(scrollProgress, 0.30, 0.34, 0.55);
  const workLabelOpacity = clampOpacity(scrollProgress, 0.32, 0.36, 0.55);
  const contactOpacity = clampOpacity(scrollProgress, 0.82, 0.86, 1.0);

  const getProjectOpacity = (index: number) => {
    const base = 0.34 + index * 0.04;
    return clampOpacity(scrollProgress, base, base + 0.03, base + 0.08);
  };

  const whatsappNumber = settings?.socialLinks?.whatsapp || "+917282074603";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

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

      <div
        className="fixed left-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{ opacity: bhLabelOpacity, visibility: bhLabelOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <p className="text-[8px] tracking-[0.3em] uppercase text-[rgba(85,170,255,0.35)] font-mono writing-vertical"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.3em" }}
        >
          BLACK HOLE
        </p>
      </div>

      <div
        className="fixed right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{ opacity: workLabelOpacity, visibility: workLabelOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="pointer-events-auto">
          <p className="text-[8px] tracking-[0.3em] uppercase text-[rgba(255,255,255,0.15)] font-mono mb-4 text-right">
            SELECTED WORK
          </p>
          <ul className="space-y-3">
            {projectList.slice(0, 5).map((project, index) => {
              const projectOpacity = getProjectOpacity(index);
              return (
                <motion.li
                  key={project.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: projectOpacity, x: projectOpacity > 0.1 ? 0 : 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="group text-right block w-full"
                  >
                    <span className="text-[11px] text-[rgba(255,255,255,0.5)] group-hover:text-[rgba(85,170,255,0.9)] transition-all font-mono tracking-wide interactive block">
                      {project.title}
                    </span>
                    <span className="text-[8px] text-[rgba(255,255,255,0.15)] group-hover:text-[rgba(255,255,255,0.3)] font-mono tracking-wider transition-all block mt-0.5">
                      {project.category} — {project.year}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      <div
        className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none px-6 md:px-16"
        style={{ opacity: contactOpacity, visibility: contactOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="w-full max-w-2xl pointer-events-auto">
          <div className="bg-[rgba(5,10,20,0.85)] backdrop-blur-2xl border border-[rgba(85,170,255,0.1)] rounded-2xl p-8 md:p-12 shadow-[0_0_80px_rgba(85,170,255,0.08)]">
            <h2 className="text-xl md:text-2xl font-black tracking-[-0.02em] text-white mb-2">
              LET'S WORK TOGETHER
            </h2>
            <p className="text-[10px] tracking-[0.2em] text-[rgba(255,255,255,0.25)] font-mono uppercase mb-8">
              REACH OUT AND LET'S CREATE SOMETHING AMAZING
            </p>

            <form className="space-y-5 mb-8" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="YOUR NAME"
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] focus:border-[rgba(85,170,255,0.3)] rounded-lg px-4 py-3.5 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.15)] outline-none transition-colors font-mono text-white"
              />
              <input
                type="email"
                placeholder="YOUR EMAIL"
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] focus:border-[rgba(85,170,255,0.3)] rounded-lg px-4 py-3.5 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.15)] outline-none transition-colors font-mono text-white"
              />
              <textarea
                placeholder="YOUR MESSAGE"
                rows={3}
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] focus:border-[rgba(85,170,255,0.3)] rounded-lg px-4 py-3.5 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.15)] outline-none transition-colors resize-none font-mono text-white"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-[rgba(85,170,255,0.15)] border border-[rgba(85,170,255,0.3)] text-[rgba(85,170,255,0.9)] hover:bg-[rgba(85,170,255,0.25)] hover:text-white text-[10px] tracking-[0.25em] uppercase font-mono transition-all interactive rounded-full"
              >
                SEND MESSAGE
              </button>
            </form>

            <div className="border-t border-[rgba(255,255,255,0.05)] pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-[rgba(255,255,255,0.4)] text-xs font-mono">{contactEmail}</p>
                  {settings?.contactPhone && (
                    <p className="text-[rgba(255,255,255,0.3)] text-xs font-mono">{settings.contactPhone}</p>
                  )}
                </div>

                <div className="flex gap-4 items-center">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[rgba(37,211,102,0.1)] border border-[rgba(37,211,102,0.2)] rounded-full hover:bg-[rgba(37,211,102,0.2)] transition-all interactive group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[rgba(37,211,102,0.8)] group-hover:text-[rgb(37,211,102)]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.04.8.82-2.98-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                    </svg>
                    <span className="text-[9px] tracking-[0.15em] text-[rgba(37,211,102,0.8)] group-hover:text-[rgb(37,211,102)] font-mono uppercase">WHATSAPP</span>
                  </a>

                  {settings?.socialLinks?.instagram && (
                    <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(228,64,95,0.4)] hover:bg-[rgba(228,64,95,0.1)] transition-all interactive group" title="Instagram">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" className="group-hover:stroke-[rgba(228,64,95,0.9)]">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="17.5" cy="6.5" r="1.5" fill="rgba(255,255,255,0.3)" stroke="none" className="group-hover:fill-[rgba(228,64,95,0.9)]" />
                      </svg>
                    </a>
                  )}

                  {settings?.socialLinks?.linkedin && (
                    <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,119,181,0.4)] hover:bg-[rgba(0,119,181,0.1)] transition-all interactive group" title="LinkedIn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" className="group-hover:stroke-[rgba(0,119,181,0.9)]">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                  )}

                  {settings?.socialLinks?.twitter && (
                    <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(85,170,255,0.4)] hover:bg-[rgba(85,170,255,0.1)] transition-all interactive group" title="X / Twitter">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" className="group-hover:fill-[rgba(85,170,255,0.9)]">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}

                  {settings?.socialLinks?.github && (
                    <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.05)] transition-all interactive group" title="GitHub">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" className="group-hover:fill-[rgba(255,255,255,0.8)]">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
