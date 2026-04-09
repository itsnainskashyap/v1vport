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
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[200] bg-[rgba(3,8,18,0.97)] backdrop-blur-2xl flex items-center justify-center pointer-events-auto"
      onClick={onClose}
      data-testid="project-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full max-h-[85vh] overflow-y-auto relative mx-4"
        onClick={(e) => e.stopPropagation()}
        data-testid="project-modal-content"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(85,170,255,0.03)] to-transparent rounded-2xl" />
        <div className="absolute inset-0 border border-[rgba(85,170,255,0.08)] rounded-2xl" />

        <div className="relative p-8 md:p-12">
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.3)] hover:text-white hover:border-[rgba(85,170,255,0.3)] transition-all interactive"
            data-testid="button-modal-close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </motion.button>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border border-[rgba(85,170,255,0.3)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : project ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 mb-6 flex-wrap"
              >
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[8px] tracking-[0.2em] uppercase text-[rgba(85,170,255,0.5)] font-mono border border-[rgba(85,170,255,0.12)] px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl md:text-5xl font-black tracking-[-0.04em] mb-3 text-white"
                data-testid="text-modal-title"
              >
                {project.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[rgba(85,170,255,0.4)] text-[10px] font-mono tracking-[0.15em] mb-8"
              >
                {project.year} / {project.category}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(85,170,255,0.1)] to-transparent mb-8" />
                <p className="text-[rgba(255,255,255,0.5)] text-sm leading-[1.8] font-light">{project.longDesc}</p>
              </motion.div>

              {project.links && project.links.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4"
                >
                  {project.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 border border-[rgba(85,170,255,0.2)] text-[rgba(85,170,255,0.7)] text-[9px] tracking-[0.25em] uppercase hover:bg-[rgba(85,170,255,0.08)] hover:border-[rgba(85,170,255,0.4)] transition-all interactive rounded-full font-mono"
                      data-testid={`link-project-${i}`}
                    >
                      VIEW PROJECT
                    </a>
                  ))}
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-[rgba(255,255,255,0.2)] text-xs font-mono py-20 text-center">Project not found</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
