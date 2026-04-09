import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-black glow-text mb-4">404</h1>
        <p className="text-foreground/40 text-sm font-mono tracking-[0.15em]">PAGE NOT FOUND</p>
        <Link href="/" className="mt-6 inline-block px-6 py-2 border border-primary/30 text-primary text-xs tracking-[0.2em] uppercase hover:bg-primary/10 transition-colors interactive">
          GO HOME
        </Link>
      </div>
    </div>
  );
}
