import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowLeft, Lightbulb, Ban, Sparkles } from 'lucide-react';

interface WhatIsIncludedProps {
  setView: (view: 'landing' | 'included-details' | 'request-preview' | 'config-project') => void;
}

export default function WhatIsIncluded({ setView }: WhatIsIncludedProps) {
  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-transparent text-white font-sans flex flex-col items-center justify-center">
      {/* Liquid Refraction Background Effects matching exactly */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[700px] h-[700px] bg-brand-secondary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar perfectly matched */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#010202]/40 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 md:px-20 py-5 max-w-6xl mx-auto">
          <div className="font-display text-lg sm:text-2xl font-black text-white flex items-center gap-2 logo-text">
            Vibe Studio
          </div>
          <button 
            onClick={() => setView('landing')}
            className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-primary" />
            Regresar al sitio
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl px-6 relative z-10 flex flex-col items-center">
        
        {/* Animated header layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full space-y-10 sm:space-y-12"
        >
          {/* Header text */}
          <div className="text-center space-y-2 sm:space-y-4 max-w-2xl mx-auto">
            <h1 
              style={{ fontSize: 'clamp(1.5rem, 5.5vw, 42px)' }}
              className="font-display font-black text-white tracking-tight leading-tight animate-fade-in"
            >
              Todo lo que recibes por <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary text-glow-primary">20 USD</span>
            </h1>
          </div>

          {/* Form Card Container - Flat & beautiful glass theme match */}
          <div 
            className="w-full bg-[#131315]/40 backdrop-blur-[40px] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Internal Decorative Glow Elements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-primary/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-secondary/5 blur-3xl rounded-full pointer-events-none" />

            {/* Content Columns list alignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* LO QUE INCLUYE Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4.5 h-4.5 text-brand-primary" />
                  <h2 className="font-display font-bold text-xs tracking-widest text-[#a1a1aa] uppercase">
                    LO QUE INCLUYE
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Diseño profesional & Responsive',
                      desc: 'Optimizado para todos los dispositivos.',
                    },
                    {
                      title: 'Catálogo de Productos',
                      desc: 'Hasta 100 productos con gestión de stock.',
                    },
                    {
                      title: 'Panel de Control Intuitivo (Modo Editor)',
                      desc: 'Control total para editar textos e imágenes en tiempo real.',
                    },
                    {
                      title: 'Infraestructura Gratuita',
                      desc: 'Hosting y base de datos (Netlify/Supabase) sin costo.',
                    },
                    {
                      title: 'Botón de Contacto Directo',
                      desc: 'WhatsApp e Instagram integrados.',
                    },
                    {
                      title: 'Código QR',
                      desc: 'Acceso rápido para tus clientes físicos.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3.5 flex gap-3.5 items-center hover:border-brand-primary/25 hover:bg-white/[0.04] transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-cyan shrink-0" />
                      <div className="space-y-0.5 text-left">
                        <h3 className="text-xs font-semibold text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-sans leading-none">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LO QUE NO INCLUYE Column */}
              <div className="flex flex-col justify-between gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5">
                    <Ban className="w-4.5 h-4.5 text-red-400/80 shrink-0" />
                    <h2 className="font-display font-bold text-xs tracking-widest text-[#a1a1aa] uppercase">
                      LO QUE NO INCLUYE
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Dominio propio .com',
                        desc: 'Se utiliza subdominio gratuito .netlify.app',
                      },
                      {
                        title: 'Pagos Online',
                        desc: 'Venta directa vía WhatsApp (sin comisiones).',
                      },
                      {
                        title: 'Email Corporativo',
                        desc: 'Configuración de Gmail estándar.',
                      },
                      {
                        title: 'SEO Avanzado',
                        desc: 'Optimización de metabuscadores estándar incluida.',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 px-1 text-left items-start">
                        <span className="w-5 h-5 rounded-full bg-red-950/10 border border-red-900/10 text-red-400/60 font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                          ✕
                        </span>
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-semibold text-[#d4d4d8] leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-sans leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ELECCIÓN INTELIGENTE Box */}
                <div className="bg-brand-primary/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden space-y-4 text-left">
                  <div className="flex items-center gap-2 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 shrink-0 text-brand-cyan" />
                    ELECCIÓN INTELIGENTE
                  </div>
                  <ul className="text-xs space-y-2 text-zinc-400 list-disc list-inside">
                    <li><strong className="text-white">Herramientas Pro gratuitas</strong> (Netlify/Supabase)</li>
                    <li><strong className="text-white">Sin costos de mantenimiento</strong> de servidor</li>
                    <li><strong className="text-white">Ahorro directo</strong> transferido a tu negocio</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Start button footer of the detail card */}
            <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs text-zinc-400 font-sans text-center sm:text-left max-w-sm leading-relaxed">
                Obtén tu demo gratis hoy mismo sin ningún compromiso y decide después de ver los resultados de tu propuesta.
              </p>
              <div className="flex flex-row gap-3 w-full sm:w-auto shrink-0 justify-stretch md:justify-end">
                <button
                  onClick={() => setView('request-preview')}
                  className="cursor-pointer flex-1 sm:flex-initial px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.98] text-center truncate shadow-[0_0_20px_rgba(111,0,190,0.3)] hover:shadow-[0_0_30px_rgba(111,0,190,0.5)]"
                >
                  PREVIEW GRATIS
                </button>
                <button
                  onClick={() => setView('config-project')}
                  className="cursor-pointer flex-1 sm:flex-initial px-5 py-3 rounded-full bg-[#1b1b1f] border border-white/5 text-zinc-300 hover:text-white transition-all text-[10px] sm:text-xs font-mono tracking-wide uppercase active:scale-[0.98] text-center truncate"
                >
                  CONFIGURAR WEB
                </button>
              </div>
            </div>

          </div>
        </motion.div>
        
      </div>
    </main>
  );
}
