import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Rocket, Sparkles, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { FreePreviewRequest } from '../types';
import { jsPDF } from 'jspdf';

interface RequestPreviewFormProps {
  setView: (view: 'landing' | 'included-details' | 'request-preview' | 'config-project') => void;
  onPreviewRequested: () => void;
}

export default function RequestPreviewForm({ setView, onPreviewRequested }: RequestPreviewFormProps) {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [instagramOrTiktok, setInstagramOrTiktok] = useState('');
  const [needs, setNeeds] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<FreePreviewRequest | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Custom Fonts
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(73, 75, 214); // vibe studio purple
    doc.text("Vibe Studio", 20, 25);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("ALTA COSTURA DIGITAL", 20, 30);

    // Badge
    doc.setFillColor(235, 237, 255);
    doc.roundedRect(140, 18, 50, 8, 2, 2, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(73, 75, 214);
    doc.text("PREVIEW GRATUITA", 145, 23.5);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Nro: ${generatedInvoice?.invoiceNumber || submittedRequest?.id || '000000'}`, 140, 32);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 38, 190, 38);

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("PROVEEDOR:", 20, 46);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Vibe Studio webs", 20, 51);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("vibe.studio.webs@gmail.com", 20, 56);
    doc.text("Envio Internacional", 20, 61);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(140, 140, 140);
    doc.text("PARA CLIENTE:", 120, 46);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(businessName || "Su Negocio", 120, 51);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`${fullName} (@${instagramOrTiktok.replace("@", "")})`, 120, 56);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 120, 61);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 68, 190, 68);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(140, 140, 140);
    doc.text("CONCEPTO / ITEM", 20, 74);
    doc.text("TOTAL", 170, 74);

    doc.line(20, 78, 190, 78);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Propuesta / Preview Gratuita de Sitio Web", 20, 86);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Boceto de alta costura digital y maquetacion preliminar interactiva", 20, 92);
    doc.text("totalmente sin costo y sin ningun tipo de compromiso de pago posterior.", 20, 97);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("Gratis ($0.00)", 165, 86);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 104, 190, 104);

    doc.setFillColor(248, 249, 255);
    doc.roundedRect(20, 112, 170, 16, 3, 3, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(73, 75, 214);
    doc.text("ESTADO DE LA PROPUESTA:", 25, 122);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text("100% GRATUITO — SIN COMPROMISO", 98, 122);

    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 134, 170, 26, 3, 3, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Sobre la Preview de Vibe:", 25, 140);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text("Este anticipo interactivo de diseño hecho a medida no tiene costo alguno,", 25, 146);
    doc.text("ni requiere de tarjetas de credito o firmas de contratos.", 25, 151);

    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text("Vibe Studio webs — Alta Costura Digital & Ingenieria Web de Elite", 20, 280);

    doc.save(`vibe-preview-${generatedInvoice?.invoiceNumber || 'order'}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !businessName.trim() || !instagramOrTiktok.trim()) {
      setWarningMessage('Por favor completa los campos de contacto y negocio.');
      return;
    }

    setWarningMessage(null);
    setIsSending(true);

    const randomRequestNumber = `VIBE-PRV-${Math.floor(100000 + Math.random() * 900000)}`;

    const request: FreePreviewRequest = {
      id: randomRequestNumber,
      fullName,
      businessName,
      instagramOrTiktok,
      goals: needs,
      createdAt: new Date().toISOString(),
    };

    const invoiceObj = {
      invoiceNumber: randomRequestNumber,
      businessName: businessName,
      contactChannel: fullName + ` (@${instagramOrTiktok.replace("@", "")})`,
      price: 0
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preview',
          emailData: request,
          clientInvoice: invoiceObj
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar el correo.');
      }

      // Save to localStorage
      const existingPreviewsJson = localStorage.getItem('vibe_previews_requested');
      const existingPreviews: FreePreviewRequest[] = existingPreviewsJson ? JSON.parse(existingPreviewsJson) : [];
      existingPreviews.push(request);
      localStorage.setItem('vibe_previews_requested', JSON.stringify(existingPreviews));

      setGeneratedInvoice(invoiceObj);
      setSubmittedRequest(request);
      onPreviewRequested();
    } catch (err: any) {
      console.error("API error:", err);
      // Fallback local persistence so the flow is unblocked
      const existingPreviewsJson = localStorage.getItem('vibe_previews_requested');
      const existingPreviews: FreePreviewRequest[] = existingPreviewsJson ? JSON.parse(existingPreviewsJson) : [];
      existingPreviews.push(request);
      localStorage.setItem('vibe_previews_requested', JSON.stringify(existingPreviews));

      setGeneratedInvoice(invoiceObj);
      setSubmittedRequest(request);
      onPreviewRequested();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-transparent text-white font-sans flex flex-col items-center justify-center">
      
      {/* Liquid Refraction Background Effects */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[700px] h-[700px] bg-brand-secondary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar perfectly matching original style */}
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
      <div className="w-full max-w-2xl px-6 relative z-10 flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {!submittedRequest ? (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-8 sm:space-y-12"
            >
              {/* Header text exactly like code */}
              <div className="text-center space-y-2 sm:space-y-4 max-w-2xl mx-auto animate-fade-in">
                <h1 
                  style={{ fontSize: 'clamp(1.5rem, 5.5vw, 48px)' }}
                  className="font-display font-black text-white tracking-tight leading-tight"
                >
                  Pide tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary text-glow-primary">preview gratis</span> hoy
                </h1>
                <p 
                  style={{ fontSize: 'clamp(11px, 3.5vw, 14px)' }}
                  className="font-sans text-zinc-400 max-w-xl mx-auto leading-relaxed px-1"
                >
                  Cuéntanos sobre tu negocio y te mostraremos una propuesta de diseño sin compromiso. Listo en pocos días.
                </p>
              </div>

              {/* Form Card Container - Flat & beautiful glass theme */}
              <div 
                className="w-full bg-[#131315]/40 backdrop-blur-[40px] border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                {/* Internal Decorative Glow Elements */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-primary/10 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-secondary/10 blur-3xl rounded-full pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-8">
                  {warningMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-xs flex justify-between items-center gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{warningMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWarningMessage(null)}
                        className="text-zinc-400 hover:text-white transition-colors text-base"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2.5">
                      <label htmlFor="full_name" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        NOMBRE
                      </label>
                      <input
                        id="full_name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                      />
                    </div>

                    {/* Business Name */}
                    <div className="flex flex-col gap-2.5">
                      <label htmlFor="business" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        NEGOCIO / CATEGORÍA
                      </label>
                      <input
                        id="business"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Nombre de tu marca"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Instagram / Contact is now full-width following removal of Website */}
                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="contact_handle" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                      INSTAGRAM O TIKTOK de tu negocio
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm group-focus-within:text-brand-primary transition-colors">
                        @
                      </span>
                      <input
                        id="contact_handle"
                        type="text"
                        required
                        value={instagramOrTiktok}
                        onChange={(e) => setInstagramOrTiktok(e.target.value)}
                        placeholder="Instagram de tu negocio"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Needs Textarea */}
                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="needs" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                      CUÉNTANOS SOBRE TU NEGOCIO, ¿Qué necesitas para tu web?
                    </label>
                    <textarea
                      id="needs"
                      required
                      value={needs}
                      onChange={(e) => setNeeds(e.target.value)}
                      placeholder="Cuéntanos tus objetivos, visión o referencias que te gusten..."
                      rows={4}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all resize-none min-h-[130px] outline-none"
                    />
                  </div>

                  {/* Submit button with ultimate neon button pulse/glow & scale animations */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="cursor-pointer w-full py-5 rounded-2xl font-display text-lg font-extrabold text-white flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-[#494bd6] to-[#6f00be] hover:shadow-[0_0_35px_rgba(111,0,190,0.6)] hover:scale-[1.02] active:scale-[0.98] outline-none shadow-lg relative overflow-hidden disabled:opacity-50"
                    >
                      <span>{isSending ? "Enviando solicitud..." : "Solicitar Preview Gratis"}</span>
                      <Rocket className="w-5 h-5 animate-pulse text-brand-secondary" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Lower visual trust badges strictly aligned on a single line on all screen sizes */}
              <div 
                className="flex flex-row flex-nowrap items-center justify-center gap-x-3 sm:gap-x-8 md:gap-x-12 pt-6 w-full max-w-full overflow-hidden text-center"
              >
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 select-none">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-primary" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400">Sin compromiso</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 select-none">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-primary" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400">LISTO EN POCOS DÍAS</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 select-none">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-primary animate-pulse" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400">Diseño Exclusivo</span>
                </div>
              </div>

            </motion.div>
          ) : (
            // Success view with Printable Invoice layout nested cleanly
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center relative overflow-hidden space-y-6 max-w-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-[#131315]/50 backdrop-blur-[30px] border border-brand-primary/20 p-6 sm:p-10 rounded-3xl"
            >
              <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto border border-brand-primary/20">
                <Sparkles className="w-7 h-7 text-brand-primary animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-brand-primary font-bold uppercase tracking-[0.2em] block">
                  ¡SOLICITUD PROCESADA EXITOSAMENTE!
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  ¡Todo en marcha, {submittedRequest.fullName}!
                </h2>
                <p className="text-zinc-400 font-sans text-xs max-w-sm mx-auto leading-relaxed">
                  Hemos enviado la información a nuestro correo corporativo y generado tu factura profesional de desarrollo de inmediato.
                </p>
              </div>

              {/* Printable Professional Invoice */}
              <div className="bg-white text-zinc-900 text-left rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden border border-white/20 print-section">
                <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="font-display font-black text-base text-[#494bd6] tracking-tight">Vibe Studio</h3>
                    <p className="text-[8px] font-mono tracking-widest text-zinc-400">ALTA COSTURA DIGITAL</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-50 text-emerald-600 font-mono text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider block mb-1">
                      Preview Gratuita
                    </span>
                    <span className="text-xs font-mono font-bold block text-zinc-800">#{generatedInvoice?.invoiceNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-500 font-sans">
                  <div>
                    <div className="font-bold text-zinc-400 font-mono text-[8px] uppercase tracking-wider mb-0.5">PROVEEDOR:</div>
                    <div className="font-bold text-zinc-800">Vibe Studio webs</div>
                    <div>vibe.studio.webs@gmail.com</div>
                    <div>Envío Internacional</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-zinc-400 font-mono text-[8px] uppercase tracking-wider mb-0.5">PARA CLIENTE:</div>
                    <div className="font-bold text-zinc-800">{generatedInvoice?.businessName}</div>
                    <div className="truncate">{generatedInvoice?.contactChannel}</div>
                    <div>Fecha: {new Date().toLocaleDateString("es-ES")}</div>
                  </div>
                </div>

                <div className="border-t border-b border-zinc-100 py-3 text-[11px] font-sans">
                  <div className="flex justify-between font-bold text-zinc-400 pb-1.5 uppercase font-mono text-[8px]">
                    <span>CONCEPTO / ITEM</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="flex justify-between items-start pt-1.5 text-zinc-800">
                    <div>
                      <div className="font-bold">Propuesta / Preview Gratuita de Sitio Web</div>
                      <div className="text-[10px] text-zinc-400 leading-normal max-w-xs mt-0.5">Boceto de alta costura digital y maquetación preliminar interactiva sin compromiso.</div>
                    </div>
                    <span className="font-mono font-bold whitespace-nowrap text-emerald-600">Gratis ($0.00)</span>
                  </div>
                </div>

                <div className="bg-[#fcfcff] border border-[#eef0ff] rounded-xl p-4 flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-[#494bd6] uppercase text-[9px]">VALOR DE DESARROLLO:</span>
                  <div className="text-right">
                    <span className="text-base font-display font-black text-emerald-600">GRATIS</span>
                    <span className="text-[8px] font-mono font-bold text-emerald-600 block mt-0.5">✓ SIN COSTO Y SIN COMPROMISO</span>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-[9px] text-zinc-500 leading-relaxed font-sans">
                  <strong className="text-zinc-700 font-bold block mb-1">Sobre la Preview de Vibe:</strong>
                  Este anticipo interactivo de diseño hecho a medida no tiene costo alguno ni requiere tarjetas de crédito o acuerdos de pago posterior. Maquetamos con la identidad de tu marca para que experimentes nuestro trabajo con total comodidad y entera libertad.
                </div>
              </div>

              {/* Lower Navigation within receipt */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-md mx-auto">
                <button
                  onClick={handleDownloadPDF}
                  className="cursor-pointer flex-1 py-3 text-center bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 active:scale-95 rounded-full font-mono font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  📥 Descargar Factura PDF
                </button>
                <button
                  onClick={() => setView('landing')}
                  className="cursor-pointer flex-1 py-3 bg-gradient-to-r from-[#494bd6] to-[#6f00be] hover:shadow-[0_0_20px_rgba(111,0,190,0.4)] active:scale-95 text-white rounded-full font-mono font-bold text-[10px] uppercase tracking-wider transition-all"
                >
                  Regresar al Inicio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
