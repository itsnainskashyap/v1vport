import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  contactEmail: string;
  contactPhone?: string;
  whatsappLink: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    whatsapp?: string;
  };
  onClose: () => void;
}

export function ContactPopup({ contactEmail, contactPhone, whatsappLink, socialLinks, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-lg z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-[rgba(8,12,24,0.95)] backdrop-blur-2xl border border-[rgba(85,170,255,0.15)] rounded-2xl p-6 md:p-8 shadow-[0_0_100px_rgba(85,170,255,0.1),0_0_40px_rgba(170,85,255,0.08)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.05)] transition-all text-[rgba(255,255,255,0.4)] hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6">
            <motion.div
              className="w-12 h-[2px] bg-gradient-to-r from-[rgba(85,170,255,0.8)] to-[rgba(170,85,255,0.6)] mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            <h2 className="text-xl md:text-2xl font-black tracking-[-0.02em] text-white mb-1">
              GET IN TOUCH
            </h2>
            <p className="text-[10px] tracking-[0.2em] text-[rgba(255,255,255,0.4)] font-mono uppercase">
              LET'S CREATE SOMETHING AMAZING TOGETHER
            </p>
          </div>

          <form className="space-y-4 mb-6" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="YOUR NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(85,170,255,0.4)] rounded-xl px-4 py-3 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.2)] outline-none transition-all font-mono text-white focus:shadow-[0_0_20px_rgba(85,170,255,0.1)]"
            />
            <input
              type="email"
              placeholder="YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(85,170,255,0.4)] rounded-xl px-4 py-3 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.2)] outline-none transition-all font-mono text-white focus:shadow-[0_0_20px_rgba(85,170,255,0.1)]"
            />
            <textarea
              placeholder="YOUR MESSAGE"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(85,170,255,0.4)] rounded-xl px-4 py-3 text-xs tracking-[0.15em] placeholder:text-[rgba(255,255,255,0.2)] outline-none transition-all resize-none font-mono text-white focus:shadow-[0_0_20px_rgba(85,170,255,0.1)]"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-[rgba(85,170,255,0.2)] to-[rgba(170,85,255,0.2)] border border-[rgba(85,170,255,0.3)] text-white text-[10px] tracking-[0.25em] uppercase font-mono transition-all rounded-xl hover:from-[rgba(85,170,255,0.3)] hover:to-[rgba(170,85,255,0.3)] hover:shadow-[0_0_30px_rgba(85,170,255,0.15)]"
            >
              SEND MESSAGE
            </button>
          </form>

          <div className="border-t border-[rgba(255,255,255,0.06)] pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[rgba(255,255,255,0.5)] text-xs font-mono">{contactEmail}</p>
                {contactPhone && (
                  <p className="text-[rgba(255,255,255,0.35)] text-xs font-mono">{contactPhone}</p>
                )}
              </div>

              <div className="flex gap-3 items-center">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(37,211,102,0.1)] border border-[rgba(37,211,102,0.2)] rounded-full hover:bg-[rgba(37,211,102,0.2)] transition-all group"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[rgba(37,211,102,0.8)] group-hover:text-[rgb(37,211,102)]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.04.8.82-2.98-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                  </svg>
                  <span className="text-[8px] tracking-[0.15em] text-[rgba(37,211,102,0.8)] group-hover:text-[rgb(37,211,102)] font-mono uppercase">WHATSAPP</span>
                </a>

                {socialLinks?.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(228,64,95,0.4)] hover:bg-[rgba(228,64,95,0.1)] transition-all group">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" className="group-hover:stroke-[rgba(228,64,95,0.9)]">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="rgba(255,255,255,0.3)" stroke="none" className="group-hover:fill-[rgba(228,64,95,0.9)]" />
                    </svg>
                  </a>
                )}

                {socialLinks?.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,119,181,0.4)] hover:bg-[rgba(0,119,181,0.1)] transition-all group">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" className="group-hover:stroke-[rgba(0,119,181,0.9)]">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
