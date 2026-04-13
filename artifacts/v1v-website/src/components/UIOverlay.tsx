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
  const workLabelOpacity = clampOpacity(scrollProgress, 0.32, 0.36, 0.55);

  const getProjectOpacity = (index: number) => {
    const base = 0.34 + index * 0.04;
    return clampOpacity(scrollProgress, base, base + 0.03, base + 0.08);
  };


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
