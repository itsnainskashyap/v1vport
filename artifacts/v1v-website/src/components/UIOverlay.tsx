import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetSettings } from "@workspace/api-client-react";
import { Navigation } from "./Navigation";

interface Props {
  scrollProgress: number;
  onNavigate: (section: string) => void;
}

function clampOpacity(progress: number, fadeIn: number, peak: number, fadeOut: number): number {
  if (progress < fadeIn) return 0;
  if (progress < peak) return Math.min(1, (progress - fadeIn) / (peak - fadeIn));
  if (progress < fadeOut) return 1;
  return Math.max(0, 1 - (progress - fadeOut) / 0.08);
}

export function UIOverlay({ scrollProgress, onNavigate }: Props) {
  const { data: settings } = useGetSettings();

  const heroTagline = settings?.heroTagline || "CREATIVE DIGITAL EXPERIENCES";
  const aboutTitle = settings?.aboutTitle || "CREATIVE DIGITAL\nEXPERIENCES";
  const aboutText = settings?.aboutText || "We blend story, art & technology as an in-house team of passionate makers.";
  const contactEmail = settings?.contactEmail || "hello@v1v.in";

  const heroOpacity = Math.max(0, 1 - scrollProgress * 5);
  const aboutOpacity = clampOpacity(scrollProgress, 0.10, 0.16, 0.26);
  const workOpacity = clampOpacity(scrollProgress, 0.26, 0.32, 0.52);
  const labOpacity = clampOpacity(scrollProgress, 0.62, 0.68, 0.78);
  const contactOpacity = clampOpacity(scrollProgress, 0.80, 0.85, 1.0);

  const scrollIndicatorOpacity = Math.max(0, 1 - scrollProgress * 8);

  const categories = ["WEBSITES", "INSTALLATIONS", "XR / VR / AI", "MULTIPLAYER", "GAMES"];

  return (
    <>
      <Navigation onNavigate={onNavigate} />

      <div
        className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
        style={{ opacity: heroOpacity, visibility: heroOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="text-center pointer-events-auto">
          <h1
            className="text-[clamp(4rem,14vw,10rem)] font-black tracking-[-0.05em] leading-[0.85] text-white"
            style={{
              textShadow: "0 0 80px rgba(100,140,180,0.15), 0 0 160px rgba(100,140,180,0.05)",
            }}
          >
            V1V
          </h1>
          <p className="mt-3 text-[11px] tracking-[0.35em] uppercase text-[rgba(255,255,255,0.35)] font-mono">
            {heroTagline}
          </p>
        </div>

        <div
          className="absolute bottom-12 flex flex-col items-center"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <p className="text-[9px] tracking-[0.25em] uppercase text-[rgba(255,255,255,0.2)] font-mono mb-3">
            SCROLL TO EXPLORE
          </p>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[rgba(255,255,255,0.2)] to-transparent animate-pulse" />
        </div>
      </div>

      <div
        className="fixed inset-0 flex items-center z-10 pointer-events-none px-8 md:px-20"
        style={{ opacity: aboutOpacity, visibility: aboutOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="max-w-5xl">
          <h2
            className="text-[clamp(2.5rem,7vw,6rem)] font-black tracking-[-0.04em] leading-[0.92] text-white whitespace-pre-line"
          >
            {aboutTitle}
          </h2>
          <div className="mt-10 flex flex-col md:flex-row gap-10 max-w-3xl">
            <div className="md:w-1/2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.25)] font-mono mb-3">
                FOUNDED IN {settings?.aboutFoundedYear || "2024"}
              </p>
              <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">{aboutText}</p>
            </div>
            <div className="md:w-1/2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.25)] font-mono mb-3">
                OUR INDUSTRY-LEADING WEB TOOLSET
              </p>
              <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">
                CONSISTENTLY DELIVERS AWARD-WINNING WORK THROUGH QUALITY & PERFORMANCE
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{ opacity: workOpacity, visibility: workOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="pointer-events-auto">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.2)] font-mono mb-5">
            WHAT ARE YOU LOOKING FOR?
          </p>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat}>
                <button className="text-[12px] text-[rgba(255,255,255,0.35)] hover:text-white transition-colors font-mono tracking-wide interactive">
                  → {cat}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.15)] font-mono">
              SELECTED PROJECTS
            </p>
          </div>
        </div>
      </div>

      <div
        className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ opacity: labOpacity, visibility: labOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="text-center">
          <p className="text-[11px] font-mono tracking-[0.3em] text-[rgba(255,255,255,0.25)] mb-4">// THE LAB →</p>
          <h2
            className="text-[clamp(2rem,5vw,4.5rem)] font-black tracking-[-0.03em] text-white"
            style={{ textShadow: "0 0 60px rgba(100,140,180,0.15)" }}
          >
            OUR HOME FOR INNOVATION
          </h2>
          <p className="mt-3 text-[rgba(255,255,255,0.35)] text-sm max-w-md mx-auto font-mono text-[11px] tracking-wider">
            WHERE PROTOTYPES TURN INTO PRODUCTION PROJECTS
          </p>
        </div>
      </div>

      <div
        className="fixed inset-0 flex items-center z-10 pointer-events-none px-8 md:px-20"
        style={{ opacity: contactOpacity, visibility: contactOpacity < 0.01 ? "hidden" : "visible" }}
      >
        <div className="max-w-lg w-full mx-auto pointer-events-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-white mb-8">GET IN TOUCH</h2>
          <p className="text-[rgba(255,255,255,0.35)] text-sm mb-2 font-mono">{contactEmail}</p>
          {settings?.contactPhone && (
            <p className="text-[rgba(255,255,255,0.35)] text-sm mb-8 font-mono">{settings.contactPhone}</p>
          )}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="YOUR NAME"
              className="w-full bg-transparent border-b border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,255,255,0.25)] px-0 py-3 text-sm tracking-[0.1em] placeholder:text-[rgba(255,255,255,0.15)] outline-none transition-colors font-mono text-white"
            />
            <input
              type="email"
              placeholder="YOUR EMAIL"
              className="w-full bg-transparent border-b border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,255,255,0.25)] px-0 py-3 text-sm tracking-[0.1em] placeholder:text-[rgba(255,255,255,0.15)] outline-none transition-colors font-mono text-white"
            />
            <textarea
              placeholder="YOUR MESSAGE"
              rows={3}
              className="w-full bg-transparent border-b border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,255,255,0.25)] px-0 py-3 text-sm tracking-[0.1em] placeholder:text-[rgba(255,255,255,0.15)] outline-none transition-colors resize-none font-mono text-white"
            />
            <button
              type="submit"
              className="px-8 py-3 border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.6)] hover:text-white hover:border-[rgba(255,255,255,0.3)] text-[10px] tracking-[0.25em] uppercase font-mono transition-all interactive"
            >
              SEND MESSAGE
            </button>
          </form>
          <div className="mt-12 flex gap-6">
            {settings?.socialLinks?.twitter && (
              <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[rgba(255,255,255,0.2)] hover:text-white transition-colors font-mono tracking-[0.15em] uppercase interactive">Twitter</a>
            )}
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[rgba(255,255,255,0.2)] hover:text-white transition-colors font-mono tracking-[0.15em] uppercase interactive">Instagram</a>
            )}
            {settings?.socialLinks?.linkedin && (
              <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[rgba(255,255,255,0.2)] hover:text-white transition-colors font-mono tracking-[0.15em] uppercase interactive">LinkedIn</a>
            )}
            {settings?.socialLinks?.github && (
              <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[rgba(255,255,255,0.2)] hover:text-white transition-colors font-mono tracking-[0.15em] uppercase interactive">GitHub</a>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-8 z-10 pointer-events-none">
        <p className="text-[9px] text-[rgba(255,255,255,0.1)] font-mono tracking-[0.15em]">
          V1V CREATIVE STUDIO © {new Date().getFullYear()}
        </p>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="w-[1px] h-16 bg-[rgba(255,255,255,0.05)] relative">
          <div
            className="absolute top-0 left-0 w-full bg-[rgba(255,255,255,0.25)] transition-all duration-300"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
