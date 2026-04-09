import { motion } from "framer-motion";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";

interface Props {
  projectId: string;
  onClose: () => void;
}

export function ProjectModal({ projectId, onClose }: Props) {
  const { data: project, isLoading } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center pointer-events-auto p-6"
      onClick={onClose}
      data-testid="project-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl w-full max-h-[80vh] overflow-y-auto bg-card/80 backdrop-blur-md border border-foreground/5 p-8 md:p-12"
        onClick={(e) => e.stopPropagation()}
        data-testid="project-modal-content"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-foreground/40 hover:text-primary transition-colors interactive"
          data-testid="button-modal-close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>

        {isLoading ? (
          <div className="text-foreground/30 text-sm font-mono">Loading...</div>
        ) : project ? (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[10px] tracking-[0.15em] uppercase text-primary/60 font-mono border border-primary/20 px-2 py-1">{tag}</span>
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-4" data-testid="text-modal-title">{project.title}</h2>
            <p className="text-foreground/40 text-xs font-mono mb-6">{project.year} / {project.category}</p>
            <p className="text-foreground/70 text-sm leading-relaxed mb-8">{project.longDesc}</p>
            {project.links && project.links.length > 0 && (
              <div className="flex gap-4">
                {project.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 border border-primary/30 text-primary text-xs tracking-[0.2em] uppercase hover:bg-primary/10 transition-colors interactive"
                    data-testid={`link-project-${i}`}
                  >
                    VISIT PROJECT
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-foreground/30 text-sm font-mono">Project not found</div>
        )}
      </motion.div>
    </motion.div>
  );
}
