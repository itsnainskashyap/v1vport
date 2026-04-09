import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <>
      <nav className="fixed top-6 right-6 z-50 pointer-events-auto" data-testid="navigation">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-4 px-5 py-2.5 border border-foreground/15 backdrop-blur-md bg-background/30 text-xs tracking-[0.2em] uppercase font-medium text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all interactive"
          data-testid="button-nav-toggle"
        >
          <span>WORK</span>
          <span className="w-6 h-px bg-foreground/30" />
          <span>CONTACT</span>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center pointer-events-auto"
            data-testid="nav-overlay"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors interactive"
              data-testid="button-nav-close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>

            <div className="flex flex-col items-center gap-8">
              {[
                { label: "HERO", id: "hero-section" },
                { label: "ABOUT", id: "about-section" },
                { label: "WORK", id: "work-section" },
                { label: "LAB", id: "lab-section" },
                { label: "CONTACT", id: "contact-section" },
              ].map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  onClick={() => scrollTo(item.id)}
                  className="text-3xl md:text-5xl font-black tracking-[-0.02em] text-foreground/40 hover:text-primary transition-colors interactive"
                  data-testid={`button-nav-${item.id}`}
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <a
                  href={`${import.meta.env.BASE_URL}admin`.replace("//", "/")}
                  className="text-xs tracking-[0.2em] text-foreground/20 hover:text-foreground/40 transition-colors font-mono interactive"
                  data-testid="link-admin"
                >
                  ADMIN
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
