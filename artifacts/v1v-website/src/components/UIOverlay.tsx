import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGetSettings, useGetProjects } from "@workspace/api-client-react";
import { Navigation } from "./Navigation";
import { ProjectModal } from "./ProjectModal";

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
  const dnaLabelOpacity = clampOpacity(scrollProgress, 0.30, 0.34, 0.55);
  const workLabelOpacity = clampOpacity(scrollProgress, 0.32, 0.36, 0.55);
  const contactOpacity = clampOpacity(scrollProgress, 0.85, 0.88, 1.0);

  const getProjectOpacity = (index: number) => {
    const base = 0.34 + index * 0.04;
    return clampOpacity(scrollProgress, base, base + 0.03, base + 0.08);
  };

  return (
    <>
      <Navigation onNavigate={onNavigate} />

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
        style={{ opacity: dnaLabelOpacity, visibility: dnaLabelOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <p className="text-[8px] tracking-[0.3em] uppercase text-[rgba(85,170,255,0.35)] font-mono writing-vertical"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.3em" }}
        >
          DNA OF CREATIVITY
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
        className="fixed inset-0 flex items-center z-10 pointer-events-none px-8 md:px-20"
        style={{ opacity: contactOpacity, visibility: contactOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="max-w-lg w-full mx-auto pointer-events-auto">
          <p className="text-[rgba(255,255,255,0.3)] text-xs mb-2 font-mono">{contactEmail}</p>
          {settings?.contactPhone && (
            <p className="text-[rgba(255,255,255,0.25)] text-xs mb-8 font-mono">{settings.contactPhone}</p>
          )}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="YOUR NAME"
              className="w-full bg-transparent border-b border-[rgba(255,255,255,0.06)] focus:border-[rgba(85,170,255,0.3)] px-0 py-3 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.1)] outline-none transition-colors font-mono text-white"
            />
            <input
              type="email"
              placeholder="YOUR EMAIL"
              className="w-full bg-transparent border-b border-[rgba(255,255,255,0.06)] focus:border-[rgba(85,170,255,0.3)] px-0 py-3 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.1)] outline-none transition-colors font-mono text-white"
            />
            <textarea
              placeholder="YOUR MESSAGE"
              rows={3}
              className="w-full bg-transparent border-b border-[rgba(255,255,255,0.06)] focus:border-[rgba(85,170,255,0.3)] px-0 py-3 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.1)] outline-none transition-colors resize-none font-mono text-white"
            />
            <button
              type="submit"
              className="px-6 py-2.5 border border-[rgba(85,170,255,0.2)] text-[rgba(85,170,255,0.6)] hover:text-white hover:border-[rgba(85,170,255,0.4)] text-[9px] tracking-[0.25em] uppercase font-mono transition-all interactive rounded-full"
            >
              SEND
            </button>
          </form>
          <div className="mt-10 flex gap-5">
            {settings?.socialLinks?.twitter && (
              <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[8px] text-[rgba(255,255,255,0.15)] hover:text-[rgba(85,170,255,0.7)] transition-colors font-mono tracking-[0.2em] uppercase interactive">X</a>
            )}
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[8px] text-[rgba(255,255,255,0.15)] hover:text-[rgba(85,170,255,0.7)] transition-colors font-mono tracking-[0.2em] uppercase interactive">IG</a>
            )}
            {settings?.socialLinks?.linkedin && (
              <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[8px] text-[rgba(255,255,255,0.15)] hover:text-[rgba(85,170,255,0.7)] transition-colors font-mono tracking-[0.2em] uppercase interactive">LI</a>
            )}
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
    </>
  );
}
