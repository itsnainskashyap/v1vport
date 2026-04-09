import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProjects, useGetSettings } from "@workspace/api-client-react";
import type { Project } from "@workspace/api-client-react";
import { Navigation } from "./Navigation";
import { ProjectModal } from "./ProjectModal";

export function UIOverlay() {
  const { data: projects } = useGetProjects();
  const { data: settings } = useGetSettings();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const heroTagline = settings?.heroTagline || "CREATIVE DIGITAL EXPERIENCES";
  const heroSubtitle = settings?.heroSubtitle || "We blend story, art & technology";
  const aboutTitle = settings?.aboutTitle || "CREATIVE DIGITAL EXPERIENCES";
  const aboutText = settings?.aboutText || "We blend story, art & technology as an in-house team of passionate makers.";
  const contactEmail = settings?.contactEmail || "hello@v1v.in";

  const categories = ["WEBSITES", "INSTALLATIONS", "XR / VR / AI", "MULTIPLAYER", "GAMES"];

  return (
    <>
      <Navigation />

      <section id="hero-section" className="h-screen flex flex-col items-center justify-center pointer-events-auto" data-testid="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="text-center z-10"
        >
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black tracking-[-0.04em] leading-[0.9] glow-text" data-testid="text-hero-title">
            V1V
          </h1>
          <p className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase text-foreground/60 font-mono" data-testid="text-hero-tagline">
            {heroTagline}
          </p>
          <motion.button
            className="mt-10 px-8 py-3 border border-primary/40 text-primary text-xs tracking-[0.25em] uppercase font-medium glow-button rounded-none interactive"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = document.getElementById("work-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-view-work"
          >
            VIEW WORK
          </motion.button>
        </motion.div>
      </section>

      <section id="about-section" data-gsap-section className="min-h-screen flex items-center px-6 md:px-16 lg:px-24 pointer-events-auto" data-testid="about-section">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl"
        >
          <h2 className="text-[clamp(2rem,6vw,5rem)] font-black tracking-[-0.03em] leading-[0.95]" data-testid="text-about-title">
            {aboutTitle}
          </h2>
          <div className="mt-8 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <p className="text-xs tracking-[0.2em] uppercase text-foreground/40 font-mono mb-2">FOUNDED IN {settings?.aboutFoundedYear || "2024"}</p>
              <p className="text-foreground/70 text-sm leading-relaxed">{aboutText}</p>
            </div>
            <div className="md:w-1/2">
              <p className="text-xs tracking-[0.2em] uppercase text-foreground/40 font-mono mb-2">OUR INDUSTRY-LEADING WEB TOOLSET</p>
              <p className="text-foreground/70 text-sm leading-relaxed">
                CONSISTENTLY DELIVERS AWARD-WINNING WORK THROUGH QUALITY & PERFORMANCE
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="work-section" data-gsap-section className="min-h-[200vh] px-6 md:px-16 lg:px-24 pointer-events-auto" data-testid="work-section">
        <div className="flex flex-col lg:flex-row gap-12 pt-32">
          <div className="lg:w-64 shrink-0">
            <p className="text-xs tracking-[0.2em] uppercase text-foreground/40 font-mono mb-6">WHAT ARE YOU LOOKING FOR?</p>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat}>
                  <button className="text-sm text-foreground/50 hover:text-primary transition-colors font-mono tracking-wide interactive" data-testid={`button-category-${cat}`}>
                    -&gt; {cat}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <button className="px-4 py-2 border border-foreground/20 text-xs tracking-[0.15em] uppercase text-foreground/50 hover:text-primary hover:border-primary/40 transition-all font-mono interactive" data-testid="button-ask">
                ASK ME ANYTHING...
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {(projects || []).map((project: Project, i: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.02, rotateY: 3, rotateX: -2 }}
                style={{ perspective: 1000 }}
                className="relative group cursor-pointer interactive"
                onClick={() => setSelectedProject(project.id)}
                data-testid={`card-project-${project.id}`}
              >
                <div className="relative bg-card/50 backdrop-blur-sm border border-foreground/5 p-6 md:p-8 min-h-[280px] flex flex-col justify-end overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {project.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] tracking-[0.15em] uppercase text-primary/60 font-mono">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-[-0.02em]" data-testid={`text-project-title-${project.id}`}>{project.title}</h3>
                    <p className="mt-2 text-foreground/50 text-sm">{project.shortDesc}</p>
                    <p className="mt-3 text-xs text-foreground/30 font-mono">{project.year} / {project.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="lab-section" data-gsap-section className="min-h-screen flex items-center justify-center px-6 md:px-16 lg:px-24 pointer-events-auto" data-testid="lab-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-mono tracking-[0.3em] text-foreground/40 mb-4">// THE LAB -&gt;</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-[-0.03em] glow-text" data-testid="text-lab-title">
            OUR HOME FOR INNOVATION
          </h2>
          <p className="mt-4 text-foreground/50 text-sm max-w-md mx-auto">
            WHERE PROTOTYPES TURN INTO PRODUCTION PROJECTS
          </p>
        </motion.div>
      </section>

      <section id="contact-section" data-gsap-section className="min-h-screen flex items-center px-6 md:px-16 lg:px-24 pointer-events-auto" data-testid="contact-section">
        <div className="max-w-2xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-8" data-testid="text-contact-title">GET IN TOUCH</h2>
            <p className="text-foreground/50 text-sm mb-2 font-mono">{contactEmail}</p>
            {settings?.contactPhone && <p className="text-foreground/50 text-sm mb-8 font-mono">{settings.contactPhone}</p>}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <input
                  type="text"
                  placeholder="YOUR NAME"
                  className="w-full bg-transparent border-b border-foreground/10 focus:border-primary/50 px-0 py-3 text-sm tracking-[0.1em] placeholder:text-foreground/20 outline-none transition-colors font-mono"
                  data-testid="input-contact-name"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  className="w-full bg-transparent border-b border-foreground/10 focus:border-primary/50 px-0 py-3 text-sm tracking-[0.1em] placeholder:text-foreground/20 outline-none transition-colors font-mono"
                  data-testid="input-contact-email"
                />
              </div>
              <div>
                <textarea
                  placeholder="YOUR MESSAGE"
                  rows={4}
                  className="w-full bg-transparent border-b border-foreground/10 focus:border-primary/50 px-0 py-3 text-sm tracking-[0.1em] placeholder:text-foreground/20 outline-none transition-colors resize-none font-mono"
                  data-testid="input-contact-message"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 border border-primary/40 text-primary text-xs tracking-[0.25em] uppercase font-medium glow-button interactive"
                data-testid="button-send-message"
              >
                SEND MESSAGE
              </button>
            </form>
            <div className="mt-16 flex gap-6">
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/30 hover:text-primary transition-colors font-mono tracking-[0.15em] uppercase interactive">Twitter</a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/30 hover:text-primary transition-colors font-mono tracking-[0.15em] uppercase interactive">Instagram</a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/30 hover:text-primary transition-colors font-mono tracking-[0.15em] uppercase interactive">LinkedIn</a>
              )}
              {settings?.socialLinks?.github && (
                <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/30 hover:text-primary transition-colors font-mono tracking-[0.15em] uppercase interactive">GitHub</a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 md:px-16 lg:px-24 text-center pointer-events-auto">
        <p className="text-xs text-foreground/20 font-mono tracking-[0.15em]">V1V CREATIVE STUDIO {new Date().getFullYear()}</p>
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            projectId={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
