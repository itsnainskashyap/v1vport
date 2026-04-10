interface Props {
  onNavigate: (section: string) => void;
  onContactClick?: () => void;
}

export function Navigation({ onNavigate, onContactClick }: Props) {
  return (
    <nav className="fixed top-5 right-5 z-[100]">
      <div className="flex items-center bg-[rgba(15,15,25,0.5)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <button
          onClick={() => onNavigate("work")}
          className="text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.6)] font-mono px-5 py-[9px] hover:text-white transition-colors interactive"
        >
          WORK
        </button>
        <span className="w-[28px] h-[1px] bg-[rgba(255,255,255,0.12)]" />
        <button
          onClick={() => onContactClick ? onContactClick() : onNavigate("contact")}
          className="text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.6)] font-mono px-5 py-[9px] hover:text-white transition-colors interactive"
        >
          CONTACT
        </button>
      </div>
    </nav>
  );
}
