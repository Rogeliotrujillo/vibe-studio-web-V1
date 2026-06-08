import React from 'react';
import { motion } from 'motion/react';

interface FloatingNavProps {
  currentView: 'landing' | 'included-details' | 'request-preview' | 'config-project';
  setView: (view: 'landing' | 'included-details' | 'request-preview' | 'config-project') => void;
  orderCount: number;
  previewCount: number;
}

export default function FloatingNav({ currentView, setView, orderCount, previewCount }: FloatingNavProps) {
  const totalSubmissions = orderCount + previewCount;

  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-panel w-[92%] md:w-auto md:min-w-[760px] rounded-full px-6 md:px-8 py-2 md:py-2.5 flex items-center justify-between gap-4 border border-white/10 shadow-xl transition-all duration-300 hover:scale-[1.01]"
      >
        {/* Logo */}
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 group text-left cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
        >
          <span className="font-display font-extrabold text-white text-base md:text-lg tracking-tight block leading-none logo-text text-glow-primary">
            Vibe Studio
          </span>
        </button>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => {
              setView('landing');
              setTimeout(() => {
                document.getElementById('experiencias')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:bg-white/10 ${
              currentView === 'landing' ? 'text-brand-primary text-glow-primary bg-white/5 border border-white/5' : 'text-zinc-300'
            }`}
          >
            Proyectos
          </button>

          <button
            onClick={() => {
              setView('landing');
              setTimeout(() => {
                document.getElementById('por-que-elegirnos')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-4 py-2 rounded-full text-xs font-sans font-semibold text-zinc-300 hover:text-brand-secondary hover:text-glow-secondary transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:bg-white/10"
          >
            Servicios
          </button>

          <button
            onClick={() => {
              setView('included-details');
            }}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:bg-white/10 ${
              currentView === 'included-details' ? 'text-brand-cyan text-glow-cyan bg-white/5 border border-white/5' : 'text-zinc-300'
            }`}
          >
            ¿Qué Incluye?
          </button>
        </nav>

        {/* Right Buttons / Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setView('config-project')}
            className={`vibe-button-glow cursor-pointer px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-sans text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-300 relative overflow-hidden flex items-center gap-1 sm:gap-1.5 shadow-lg shrink-0 ${
              currentView === 'config-project'
                ? 'bg-white text-black shadow-white/20'
                : 'bg-brand-primary text-black hover:bg-white hover:shadow-[0_0_20px_rgba(192,193,255,0.7)]'
            }`}
          >
            Lanzar Proyecto
          </button>
        </div>
      </motion.nav>
    </header>
  );
}
