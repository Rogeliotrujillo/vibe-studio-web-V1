import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Rocket,
  Trash2,
  Calendar,
  Layers,
  Phone,
  Palette,
  Eye,
  CheckCircle2,
  HelpCircle,
  Inbox
} from 'lucide-react';
import { ProjectConfig, FreePreviewRequest } from '../types';

interface ActiveOrdersProps {
  orders: ProjectConfig[];
  previews: FreePreviewRequest[];
  onRefresh: () => void;
}

export default function ActiveOrders({ orders, previews, onRefresh }: ActiveOrdersProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'previews'>('projects');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!deletingId) return;
    const t = setTimeout(() => setDeletingId(null), 4000);
    return () => clearTimeout(t);
  }, [deletingId]);

  const handleDeleteProjectClick = (id: string) => {
    if (deletingId === id) {
      const existing: ProjectConfig[] = JSON.parse(localStorage.getItem('vibe_projects') || '[]');
      const filtered = existing.filter((o) => o.id !== id);
      localStorage.setItem('vibe_projects', JSON.stringify(filtered));
      setDeletingId(null);
      onRefresh();
    } else {
      setDeletingId(id);
    }
  };

  const handleDeletePreviewClick = (id: string) => {
    if (deletingId === id) {
      const existing: FreePreviewRequest[] = JSON.parse(localStorage.getItem('vibe_previews_requested') || '[]');
      const filtered = existing.filter((p) => p.id !== id);
      localStorage.setItem('vibe_previews_requested', JSON.stringify(filtered));
      setDeletingId(null);
      onRefresh();
    } else {
      setDeletingId(id);
    }
  };

  const totalSubmissions = orders.length + previews.length;

  if (totalSubmissions === 0) return null;

  return (
    <motion.section
      id="active-submissions-section"
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.98 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[100dvh] w-full flex flex-col justify-center items-center relative border-t border-white/5 bg-zinc-950/60 scroll-mt-24 px-4 py-8 snap-center"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Section title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] text-brand-primary font-mono tracking-widest font-extrabold uppercase block mb-1">
              Tu Panel Local
            </span>
            <h2 className="font-display text-2xl font-extrabold text-white">
              Mis Proyectos y Previews Solicitados
            </h2>
            <p className="text-zinc-400 font-sans text-xs mt-1">
              Aquí puedes ver y gestionar las propuestas que has configurado en esta sesión.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-brand-primary text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Configuraciones ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('previews')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'previews'
                  ? 'bg-brand-secondary text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Bocetos Gratis ({previews.length})
            </button>
          </div>
        </div>

        {/* Content displays */}
        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {orders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-white/5 text-zinc-500">
                  <Inbox className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs font-mono uppercase">Sin configuraciones activas</p>
                  <p className="text-[11px] text-zinc-600 mt-1">Lanza un proyecto para empezar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="glass-panel rounded-2xl p-6 border border-brand-primary/20 hover:border-brand-primary/40 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">ID: {ord.id}</span>
                            <h3 className="font-display font-extrabold text-base text-white mt-0.5">
                              {ord.businessName}
                            </h3>
                          </div>
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded font-mono border border-brand-primary/30 font-bold uppercase">
                            ${ord.pricing} USD
                          </span>
                        </div>

                        <ul className="space-y-1.5 text-xs text-zinc-400 font-sans border-t border-white/5 pt-3">
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Rubro:</span>
                            <span className="text-zinc-300 truncate max-w-[140px]">{ord.servicesSoldCount || 'Sin especificar'}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Color Primario:</span>
                            <span className="text-zinc-300 capitalize font-mono text-[10px]">{ord.themeColor}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Contacto:</span>
                            <span className="text-brand-cyan font-mono font-bold text-[10px]">{ord.contactChannel}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Secciones Extras:</span>
                            <span className="text-zinc-300 text-[10px] font-mono">
                              {ord.specialSections.length > 0 ? ord.specialSections.join(', ') : 'Ninguna'}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Bocetando
                        </span>

                        <button
                          onClick={() => handleDeleteProjectClick(ord.id)}
                          className={`p-1.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono border ${
                            deletingId === ord.id
                              ? 'text-red-400 bg-red-950/40 border-red-500/40 font-bold px-2'
                              : 'text-zinc-500 hover:text-red-400 border-transparent hover:bg-zinc-900'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingId === ord.id ? '¿Descartar?' : 'Descartar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="previews-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {previews.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-white/5 text-zinc-500">
                  <Inbox className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs font-mono uppercase">Sin bocetos solicitados</p>
                  <p className="text-[11px] text-zinc-600 mt-1">Pide tu preview gratis para empezar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previews.map((prv) => (
                    <div
                      key={prv.id}
                      className="glass-panel rounded-2xl p-6 border border-brand-secondary/20 hover:border-brand-secondary/40 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Ref: {prv.id}</span>
                            <h3 className="font-display font-extrabold text-base text-white mt-0.5">
                              {prv.businessName}
                            </h3>
                          </div>
                          <span className="text-[9px] bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded font-mono border border-brand-secondary/20 font-bold uppercase">
                            Preview Gratis
                          </span>
                        </div>

                        <ul className="space-y-1.5 text-xs text-zinc-400 font-sans border-t border-white/5 pt-3">
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Solicitante:</span>
                            <span className="text-zinc-300 font-medium">{prv.fullName}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Instagram/TikTok:</span>
                            <span className="text-brand-primary font-mono font-bold text-[10px]">@{prv.instagramOrTiktok}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="font-semibold text-zinc-500">Fecha de solicitud:</span>
                            <span className="text-zinc-400 font-mono text-[10px]">{new Date(prv.createdAt).toLocaleDateString()}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-brand-secondary flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                          Extrayendo Vibe
                        </span>

                        <button
                          onClick={() => handleDeletePreviewClick(prv.id)}
                          className={`p-1.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono border ${
                            deletingId === prv.id
                              ? 'text-red-400 bg-red-950/40 border-red-500/40 font-bold px-2'
                              : 'text-zinc-500 hover:text-red-400 border-transparent hover:bg-zinc-900'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingId === prv.id ? '¿Borrar?' : 'Borrar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
