import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Settings,
  FileText,
  Palette,
  Link2,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Camera,
  HeartHandshake,
  Upload,
  Plus,
  Users,
  Image as ImageIcon,
  Send,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ProjectConfig } from '../types';
import { jsPDF } from 'jspdf';

// Palette specifications
const PALETTES = {
  obsidian: [
    { name: 'Carbono Puro', hex: '#1C1917' },
    { name: 'Gris Espacial', hex: '#27272A' },
    { name: 'Negro Mate', hex: '#0F0F10' }
  ],
  indigo: [
    { name: 'Neon Indigo', hex: '#4f46e5' },
    { name: 'Violeta Vibe', hex: '#7c3aed' },
    { name: 'Azul Cósmico', hex: '#3b82f6' }
  ],
  cyan: [
    { name: 'Cian Neón', hex: '#06b6d4' },
    { name: 'Turquesa Eléctrico', hex: '#0d9488' },
    { name: 'Aqua Elit', hex: '#00ced1' }
  ]
};

interface ProjectConfigFormProps {
  setView: (view: 'landing' | 'included-details' | 'request-preview' | 'config-project') => void;
  onOrderSubmitted: () => void;
}

export default function ProjectConfigForm({ setView, onOrderSubmitted }: ProjectConfigFormProps) {
  // Input fields state
  const [businessName, setBusinessName] = useState('');
  const [servicesSoldCount, setServicesSoldCount] = useState('');
  const [socialLink, setSocialLink] = useState('');
  
  // Custom Color Palette Image Reference instead of color directly
  const [colorPaletteImage, setColorPaletteImage] = useState<string | null>(null);
  const [colorPaletteFileName, setColorPaletteFileName] = useState<string>('');
  
  const [contactChannel, setContactChannel] = useState('');
  const [hasTexts, setHasTexts] = useState<'yes' | 'need_help' | 'no'>('yes');
  const [specialSections, setSpecialSections] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Texts Draft Modal state
  const [showTextDraftModal, setShowTextDraftModal] = useState(false);
  const [textDraft, setTextDraft] = useState('');

  // Special Sections data entry states
  const [aboutUsText, setAboutUsText] = useState('');
  const [hoursText, setHoursText] = useState('');
  const [faqText, setFaqText] = useState('');
  const [galleryItems, setGalleryItems] = useState<{ id: string; url: string; fileName: string; desc: string; base64?: string }[]>([]);
  
  // Track open special section modal
  const [activeSectionModal, setActiveSectionModal] = useState<'nosotros' | 'galeria' | 'horarios' | 'faq' | null>(null);

  // Uploaded general reference files (storing actual base64)
  const [mockUploads, setMockUploads] = useState<{ id: string; name: string; size: string; base64?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // Success state
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

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
    doc.text("FACTURA PROFORMA", 143, 23.5);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Nro: ${generatedInvoice?.invoiceNumber || submittedOrder?.id || 'VIBE-ORD-1122'}`, 140, 32);

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
    doc.text(`${contactChannel || 'Contacto'}`, 120, 56);
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
    doc.text("Licencia Completa / Web Corporativa de Alta Moda", 20, 86);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Estructura Premium autogestionable, hosting incluido,", 20, 92);
    doc.text("y soporte tecnico prioritario de postventa.", 20, 97);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(73, 75, 214);
    doc.text("$20.00 USD", 165, 86);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 104, 190, 104);

    doc.setFillColor(248, 249, 255);
    doc.roundedRect(20, 112, 170, 16, 3, 3, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(73, 75, 214);
    doc.text("TOTAL PRECIO DE DESARROLLO:", 25, 122);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("$20 USD", 98, 122);
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text("✓ GARANTIA SATISFECHO O NO PAGAS", 120, 122);

    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 134, 170, 34, 3, 3, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Nota de Autogestion & Acuerdos de Garantia:", 25, 140);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(100, 100, 100);
    doc.text("No necesitas tener toda la informacion lista desde el inicio, podras gestionarla de forma facil en tu web.", 25, 146);
    doc.text("Se te entregara un manual ilustrado para enseñarte a usar el panel de edicion personalizada y cambiar datos.", 25, 151);
    doc.text("Terminado el sitio, te enviaremos el enlace para tu conformidad. Solo pagas si estas 100% conforme.", 25, 156);

    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text("Vibe Studio webs — Alta Costura Digital & Ingenieria Web de Elite", 20, 280);

    doc.save(`vibe-factura-${generatedInvoice?.invoiceNumber || 'order'}.pdf`);
  };

  // Color palette reference file uploader
  const handleColorPaletteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setColorPaletteFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setColorPaletteImage(loadEvt.target?.result as string);
      setIsUploading(false);
    };
    reader.onerror = (err) => {
      console.error(err);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handler for special sections checking/unchecking
  const handleSpecialSectionToggle = (sectionId: string) => {
    const isCurrentlyActive = specialSections.includes(sectionId);
    if (!isCurrentlyActive) {
      setSpecialSections([...specialSections, sectionId]);
      // Immediately display the popup window for data entry
      setActiveSectionModal(sectionId as any);
    } else {
      setSpecialSections(specialSections.filter((s) => s !== sectionId));
    }
  };

  // Gallery device image upload (converting to base64 for transmission)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newPromises = Array.from(files).map((file: any) => {
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          resolve({
            id: `gal-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            fileName: file.name,
            desc: '',
            base64: loadEvent.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPromises).then((results) => {
      setGalleryItems((prev) => [...prev, ...results]);
      setIsUploading(false);
    }).catch((err) => {
      console.error(err);
      setIsUploading(false);
    });
  };

  // Drag & drop zone upload converting files directly to Base64
  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (mockUploads.length >= 5) {
      setWarningMessage('Puedes adjuntar un máximo de 5 imágenes de referencia.');
      return;
    }

    setIsUploading(true);
    setWarningMessage(null);

    const newFilesPromises = Array.from(files).slice(0, 5 - mockUploads.length).map((file: any) => {
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          resolve({
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            base64: loadEvent.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newFilesPromises).then((results) => {
      setMockUploads((prev) => [...prev, ...results]);
      setIsUploading(false);
    }).catch((err) => {
      console.error(err);
      setIsUploading(false);
    });
  };

  const removeUpload = (id: string) => {
    setMockUploads(mockUploads.filter((u) => u.id !== id));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactChannel.trim()) {
      setWarningMessage('Por favor completa el nombre de tu negocio y tu contacto para podernos comunicar.');
      return;
    }

    setWarningMessage(null);
    setIsSending(true);

    const randomRequestNumber = `VIBE-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Compile all advanced data inputs elegantly into compiledDetails
    let compiledDetails = additionalDetails || '';
    if (textDraft.trim()) {
      compiledDetails += `\n\n[TEXTOS PLAN/DRAFT]: ${textDraft.trim()}`;
    }
    if (aboutUsText.trim()) {
      compiledDetails += `\n\n[SECCION NOSOTROS]: ${aboutUsText.trim()}`;
    }
    if (hoursText.trim()) {
      compiledDetails += `\n\n[SECCION HORARIOS]: ${hoursText.trim()}`;
    }
    if (faqText.trim()) {
      compiledDetails += `\n\n[SECCION PREGUNTAS]: ${faqText.trim()}`;
    }
    if (galleryItems.length > 0) {
      compiledDetails += `\n\n[GALERÍA IMÁGENES]: ${galleryItems.map(g => `${g.fileName}: "${g.desc || 'Sin descripción'}"`).join(', ')}`;
    }

    const orderPayload = {
      id: randomRequestNumber,
      businessName,
      servicesSoldCount,
      socialLink,
      colorPaletteFileName,
      colorPaletteImage,
      contactChannel,
      hasTexts,
      specialSections,
      textDraft,
      aboutUsText,
      hoursText,
      faqText,
      galleryItems: galleryItems.map(g => ({ fileName: g.fileName, desc: g.desc, base64: g.base64 })),
      uploadedReferences: mockUploads.map(m => ({ name: m.name, base64: m.base64 })),
      additionalDetails: compiledDetails,
      createdAt: new Date().toISOString(),
      pricing: 20
    };

    const invoiceObj = {
      invoiceNumber: randomRequestNumber,
      businessName: businessName,
      contactChannel: contactChannel,
      price: 20
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          emailData: orderPayload,
          clientInvoice: invoiceObj
        })
      });

      if (!response.ok) {
        throw new Error('Error de transmisión de correo.');
      }

      // Save Order parameters locally to localStorage
      const existingOrdersJson = localStorage.getItem('vibe_projects');
      const existingOrders: any[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
      existingOrders.push(orderPayload);
      localStorage.setItem('vibe_projects', JSON.stringify(existingOrders));

      setGeneratedInvoice(invoiceObj);
      setSubmittedOrder(orderPayload);
      onOrderSubmitted();
    } catch (err: any) {
      console.error("Transmission error:", err);
      setWarningMessage('Tu solicitud fue procesada localmente pero hubo un error de transmisión de red. El administrador podrá revisarlo.');
      
      // Local persistence fallback
      const existingOrdersJson = localStorage.getItem('vibe_projects');
      const existingOrders: any[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
      existingOrders.push(orderPayload);
      localStorage.setItem('vibe_projects', JSON.stringify(existingOrders));

      setGeneratedInvoice(invoiceObj);
      setSubmittedOrder(orderPayload);
      onOrderSubmitted();
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
      <div className="w-full max-w-2xl px-6 relative z-10 flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {!submittedOrder ? (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-8 sm:space-y-12"
            >
              {/* Header text exactly matching style */}
              <div className="text-center space-y-2 sm:space-y-4 max-w-2xl mx-auto">
                <h1 
                  style={{ fontSize: 'clamp(1.5rem, 5.5vw, 48px)' }}
                  className="font-display font-black text-white tracking-tight leading-tight"
                >
                  Configura tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary text-glow-primary">proyecto web</span>
                </h1>
                <p 
                  style={{ fontSize: 'clamp(11px, 3.5vw, 14px)' }}
                  className="font-sans text-zinc-400 max-w-xl mx-auto leading-relaxed px-1"
                >
                  Personaliza los datos esenciales de tu marca, catálogo y diseño para activar tu desarrollo web sin compromisos de pago por adelantado.
                </p>
              </div>

              {/* Form Card Container - Glass theme matching RequestPreviewForm */}
              <div 
                className="w-full bg-[#131315]/40 backdrop-blur-[40px] border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                {/* Internal Decorative Glow Elements */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-primary/10 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-secondary/10 blur-3xl rounded-full pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-10">
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
                  
                  {/* CATEGORY 1: Información básica */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <FileText className="w-4 h-4 text-brand-primary" />
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Información básica</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Business Name */}
                      <div className="flex flex-col gap-2.5">
                        <label htmlFor="business_name" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                          NOMBRE DE TU NEGOCIO
                        </label>
                        <input
                          id="business_name"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Ej: Panadería Don Juan"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                        />
                      </div>

                      {/* Services sold */}
                      <div className="flex flex-col gap-2.5">
                        <label htmlFor="services_sold" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                          ¿QUÉ PRODUCTOS O SERVICIOS VENDES?
                        </label>
                        <input
                          id="services_sold"
                          type="text"
                          value={servicesSoldCount}
                          onChange={(e) => setServicesSoldCount(e.target.value)}
                          placeholder="Ej: Panes artesanales, facturas, café"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Social Link */}
                    <div className="flex flex-col gap-2.5">
                      <label htmlFor="social_link" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        ENLACE HACIA EL CATÁLOGO DE TUS PRODUCTOS (O REDES SOCIALES)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-5 text-zinc-500 font-mono text-sm">
                          <Link2 className="w-4 h-4" />
                        </span>
                        <input
                          id="social_link"
                          type="url"
                          value={socialLink}
                          onChange={(e) => setSocialLink(e.target.value)}
                          placeholder="Enlace de catálogo (Instagram, Facebook o Web actual)"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-400 font-sans px-1 leading-normal">
                        <strong>El enlace de información básica de tu producto web:</strong> Especifica aquí un enlace hacia el catálogo de tus productos —o sea, donde aparezcan los productos de los cuales podamos tomar las imágenes y descripciones para así integrarlos a la web principal.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Upload Color Palette reference images */}
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                          Imagen de Referencia de Colores o Paleta
                        </label>
                        
                        {!colorPaletteImage ? (
                          <label className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-brand-primary/40 transition-all duration-300 cursor-pointer text-center outline-none min-h-[120px]">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleColorPaletteUpload}
                              className="sr-only"
                            />
                            <Palette className="w-5 h-5 text-zinc-500 group-hover:text-brand-primary group-hover:scale-110 mb-2 transition-all" />
                            <span className="text-[11px] font-sans text-zinc-400 block font-medium">
                              Sube una imagen de referencia o paleta
                            </span>
                            <span className="text-[9px] text-zinc-600 block mt-1 font-mono uppercase tracking-wider">
                              Arrastra o haz click para subir
                            </span>
                          </label>
                        ) : (
                          <div className="relative group rounded-2xl overflow-hidden border border-brand-primary/20 bg-zinc-950/40 p-3 flex items-center justify-between gap-3 animate-fade-in">
                            <div className="flex items-center gap-3">
                              <img
                                src={colorPaletteImage}
                                alt="Paleta sugerida"
                                className="w-12 h-12 rounded-xl object-cover border border-white/10"
                              />
                              <div className="overflow-hidden">
                                <span className="text-xs text-white font-medium block truncate max-w-[150px]">
                                  {colorPaletteFileName}
                                </span>
                                <span className="text-[9px] font-mono text-emerald-500 block">
                                  ✓ Paleta cargada
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setColorPaletteImage(null);
                                setColorPaletteFileName('');
                              }}
                              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-zinc-500 italic px-1 leading-normal">
                          Sube un logo, captura o paleta con los colores que visualizas para tu web corporativa.
                        </p>
                      </div>

                      {/* Contact Route Channel - WhatsApp removed, email and Instagram remains */}
                      <div className="flex flex-col gap-2.5">
                        <label htmlFor="contact_channel" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                          TU EMAIL O INSTAGRAM
                        </label>
                        <input
                          id="contact_channel"
                          type="text"
                          required
                          value={contactChannel}
                          onChange={(e) => setContactChannel(e.target.value)}
                          placeholder="Tu email o cuenta de Instagram (@usuario)"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                        />
                        <p className="text-[10px] text-zinc-500 italic px-1 leading-normal">
                          Te enviaremos los primeros bocetos interactivos directamente a este canal.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CATEGORY 2: Opciones Avanzadas */}
                  <div className="space-y-6 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 pb-2">
                      <Settings className="w-4 h-4 text-brand-secondary" />
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Opciones Avanzadas (Opcional)</h3>
                    </div>

                    {/* Has texts options */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        ¿TIENES TEXTOS YA ESCRITOS PARA TU WEB?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'yes', label: 'Sí, listos' },
                          { id: 'need_help', label: 'Tengo ideas, ocupo ayuda' },
                          { id: 'no', label: 'No tengo nada redactado' }
                        ].map((txtOption) => (
                          <label
                            key={txtOption.id}
                            onClick={() => {
                              if (txtOption.id === 'yes' || txtOption.id === 'need_help') {
                                setHasTexts(txtOption.id as any);
                                setShowTextDraftModal(true);
                              } else {
                                setHasTexts('no');
                              }
                            }}
                            className={`cursor-pointer border border-white/10 rounded-2xl px-4 py-3.5 bg-white/[0.01] hover:bg-white/[0.05] flex items-center gap-3 transition-all ${
                              hasTexts === txtOption.id ? 'border-brand-primary bg-brand-primary/5' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="has_texts"
                              checked={hasTexts === txtOption.id}
                              readOnly
                              className="w-4 h-4 border-white/10 bg-transparent text-brand-primary cursor-pointer focus:ring-0"
                            />
                            <span className="text-xs font-sans text-zinc-300 font-medium">{txtOption.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Display Edit button to customize drafts anytime */}
                      {(hasTexts === 'yes' || hasTexts === 'need_help') && (
                        <div className="px-1 pt-1 flex items-center justify-between">
                          <p className="text-[10px] text-brand-cyan flex items-center gap-1">
                            ✓ {textDraft.trim() ? 'Textos guardados correctamente' : 'Listo para ingresar tus apuntes...'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowTextDraftModal(true)}
                            className="text-[10px] text-brand-primary hover:text-brand-secondary underline font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Editar apuntes
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Special Sections Toggle Grid with mandatory data entry windows */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        ¿QUIERES SECCIONES ESPECIALES? (HAGA CLIC PARA INGRESAR DATOS)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { id: 'nosotros', label: 'Nosotros', icon: Users, completed: !!aboutUsText.trim() },
                          { id: 'galeria', label: 'Galería', icon: ImageIcon, completed: galleryItems.length > 0 },
                          { id: 'horarios', label: 'Horarios', icon: Clock, completed: !!hoursText.trim() },
                          { id: 'faq', label: 'Preguntas', icon: HelpCircle, completed: !!faqText.trim() },
                        ].map((sect) => {
                          const active = specialSections.includes(sect.id);
                          return (
                            <div
                              key={sect.id}
                              onClick={() => handleSpecialSectionToggle(sect.id)}
                              className={`cursor-pointer border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-between min-h-[105px] bg-white/[0.01] hover:bg-white/[0.05] transition-all text-center relative ${
                                active ? 'border-brand-primary bg-brand-primary/5' : ''
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <sect.icon className={`w-4 h-4 ${active ? 'text-brand-primary' : 'text-zinc-500'}`} />
                                <span className="text-[11px] font-sans font-semibold text-zinc-300">{sect.label}</span>
                              </div>
                              
                              {active && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveSectionModal(sect.id as any);
                                  }}
                                  className={`mt-2 text-[9px] w-full py-1 rounded-lg transition-all text-center uppercase font-bold select-none cursor-pointer ${
                                    sect.completed 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                      : 'bg-brand-primary/20 text-brand-cyan border border-brand-primary/20 hover:bg-brand-primary/40'
                                  }`}
                                >
                                  {sect.completed ? '✓ Editado' : '📝 Cargar'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Image uploads for style reference */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        IMÁGENES DE REFERENCIA DE DISEÑO (HASTA 5)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="border border-dashed border-white/25 hover:border-brand-primary/50 rounded-2xl aspect-square flex flex-col items-center justify-center gap-1 bg-white/[0.01] hover:bg-white/[0.05] cursor-pointer relative group transition-all">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleSimulatedUpload}
                            disabled={isUploading}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          {isUploading ? (
                            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-zinc-400 group-hover:text-brand-primary transition-colors" />
                              <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Subir</span>
                            </>
                          )}
                        </div>

                        {[0, 1, 2, 3].map((idx) => {
                          const itemFile = mockUploads[idx];
                          return (
                            <div key={idx} className="border border-white/5 bg-white/[0.01] rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden">
                              {itemFile ? (
                                <div className="absolute inset-0 p-2 flex flex-col justify-between bg-black/80 font-mono text-[9px]">
                                  <button
                                    type="button"
                                    onClick={() => removeUpload(itemFile.id)}
                                    className="self-end text-red-400 hover:text-red-300 font-bold p-0.5"
                                  >
                                    ✕
                                  </button>
                                  <div className="text-center font-sans tracking-tight text-[8px] truncate text-zinc-300">
                                    <Camera className="w-3.5 h-3.5 mx-auto mb-0.5 text-brand-primary" />
                                    {itemFile.name}
                                  </div>
                                </div>
                              ) : (
                                <ImageIcon className="w-4 h-4 text-zinc-700/50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional comments */}
                    <div className="flex flex-col gap-2.5">
                      <label htmlFor="additional_details" className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 px-1">
                        ¿HAY ALGO MÁS QUE DEBAMOS SABER?
                      </label>
                      <textarea
                        id="additional_details"
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                        placeholder="Ej: Necesito sección para reservar turnos, mi logo tiene color rosa..."
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all resize-none min-h-[90px] outline-none"
                      />
                    </div>
                  </div>

                  {/* SUMMARY TABLE */}
                  <div className="space-y-6 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-400">Incluido en tu web por $20 USD</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 font-sans text-xs">
                      <div className="space-y-2 text-zinc-300">
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Diseño moderno adaptable</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Panel autogestionable</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Botones WhatsApp/Instagram</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Base de datos Supabase</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-zinc-300">
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>URL personalizada (Netlify)</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Entrega rápida de 2 a 5 días</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Totalmente gratis antes de pagar</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Sin comisiones ni mensuales</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit actions */}
                  <div className="pt-4 space-y-4">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="cursor-pointer w-full py-5 rounded-2xl font-display text-lg font-extrabold text-white flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-[#494bd6] to-[#6f00be] hover:shadow-[0_0_35px_rgba(111,0,190,0.6)] hover:scale-[1.02] active:scale-[0.98] outline-none shadow-lg relative overflow-hidden disabled:opacity-50"
                    >
                      <span>{isSending ? "Enviando Solicitud..." : "Solicitar Web Completa"}</span>
                      <Send className="w-5 h-5 animate-pulse text-brand-secondary" />
                    </button>
                    <p className="text-center text-[9px] text-zinc-500 font-mono uppercase tracking-widest leading-normal">
                      Pagas únicamente cuando estés satisfecho con el entregable final
                    </p>
                  </div>

                </form>
              </div>

              {/* Lower visual trust badges strictly matching RequestPreviewForm */}
              <div className="flex flex-row flex-nowrap items-center justify-center gap-x-3 sm:gap-x-8 md:gap-x-12 pt-2 max-w-full overflow-hidden text-center">
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 select-none">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-primary" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400">Sin riesgo</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 select-none">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-primary" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400">Entrega Veloz</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 select-none">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-brand-primary animate-pulse" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400">DISEÑO EXCLUSIVO</span>
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
                  ¡DESARROLLO COMPLETO SOLICITADO!
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  ¡Proyecto Recibido en Vibe!
                </h2>
                <p className="text-zinc-400 font-sans text-xs max-w-sm mx-auto leading-relaxed">
                  Hemos enviado ordenadamente tus datos. Autogenerada la factura pro forma con validez de garantía.
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
                    <span className="bg-[#494bd6]/10 text-[#494bd6] font-mono text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider block mb-1">
                      Factura Proforma
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
                      <div className="font-bold">Licencia Completa / Web Corporativa de Alta Moda</div>
                      <div className="text-[10px] text-zinc-400 leading-normal max-w-xs mt-0.5">
                        Estructura Premium autogestionable, hosting incluido y soporte técnico prioritario de postventa.
                      </div>
                    </div>
                    <span className="font-mono font-bold whitespace-nowrap">$20.00 USD</span>
                  </div>
                </div>

                <div className="bg-[#fcfcff] border border-[#eef0ff] rounded-xl p-4 flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-[#494bd6] uppercase text-[9px]">TOTAL PRECIO TOTAL:</span>
                  <div className="text-right">
                    <span className="text-base font-display font-black text-[#494bd6]">$20 USD</span>
                    <span className="text-[8px] font-mono font-bold text-emerald-600 block mt-0.5">✓ GARANTÍA SATISFECHO O NO PAGAS</span>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 text-[10px] text-zinc-500 leading-relaxed font-sans space-y-1.5">
                  <strong className="text-zinc-700 font-bold block">Autogestión, Garantía & Entrega:</strong>
                  <p>
                    <strong>Personalización Flexible:</strong> Las opciones del panel de edición de tu web te permitirán realizar cambios y ajustes a tu página en cualquier momento de forma fácil. No necesitas tener toda la información de tu negocio lista desde el inicio, podrás gestionarla con total autonomía desde tu propia web.
                  </p>
                  <p>
                    <strong>Manual de Soporte:</strong> Te proporcionaremos un manual explicativo paso a paso donde se te enseñará detalladamente cómo usar el panel de gestión para customizar y administrar tu web.
                  </p>
                  <p>
                    <strong>Acuerdo de Entrega:</strong> Una vez terminado de diseñar el sitio, te enviaremos el enlace para que compruebes su perfecto funcionamiento. El pago único y traspaso de credenciales se procesará únicamente cuando estés 100% conforme con el resultado final.
                  </p>
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

      {/* Aligned humble system footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-white/5 py-12 px-8 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 text-[10px] text-zinc-500 font-mono mt-16">
        <span className="font-sans font-bold text-zinc-400">Vibe Studio — Para Visionarios © 2026</span>
        <span>Ingeniería Visual de Elite — Alta Costura Digital</span>
      </footer>

      {/* POPUP SELECTION MODALS FOR WRITTEN TEXTS & SPECIAL SECTIONS */}

      {/* A. Written Texts entry window (modal) */}
      <AnimatePresence>
        {showTextDraftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#010202]/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#131315] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)] space-y-6 relative"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-white text-md sm:text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-primary" />
                  <span>
                    {hasTexts === 'yes' ? 'Ingresa tus textos ya listos' : 'Ingresa tus ideas o notas'}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTextDraftModal(false)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  {hasTexts === 'yes'
                    ? 'Por favor escribe o pega la redacción, metas o eslóganes que deseas incluir en tu sitio web.'
                    : 'Escribe ideas claves, un borrador o notas sueltas. Nosotros nos encargaremos de vestirlos como de alta gama.'}
                </p>

                <textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder="Escribe tus borradores teatrales o comerciales aquí..."
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTextDraftModal(false)}
                  className="cursor-pointer flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#494bd6] to-[#6f00be] text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(111,0,190,0.5)] transition-all duration-300 text-center"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* B. Special section: Nosotros modal window */}
      <AnimatePresence>
        {activeSectionModal === 'nosotros' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#010202]/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#131315] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)] space-y-6 relative"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-white text-md sm:text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-primary animate-pulse" />
                  <span>Configurar: Quiénes Somos / Nosotros</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Cuéntanos un poco sobre la historia de tu marca, misión, valores o lo que hace único a tu negocio.
                </p>

                <textarea
                  value={aboutUsText}
                  onChange={(e) => setAboutUsText(e.target.value)}
                  placeholder="Fundamos nuestro negocio en el 2022 con el objetivo de traer el auténtico pan artesanal a la comunidad..."
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="cursor-pointer flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#494bd6] to-[#6f00be] text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(111,0,190,0.5)] transition-all duration-300 text-center"
                >
                  Establecer sección
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* C. Special section: Galeria modal window */}
      <AnimatePresence>
        {activeSectionModal === 'galeria' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#010202]/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#131315] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-[0_32px_64px_rgba(0,0,0,0.8)] space-y-6 relative overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-white text-md sm:text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-primary animate-pulse" />
                  <span>Configurar: Galería de imágenes</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Sube las imágenes reales de tus productos o servicios directamente desde tu dispositivo e ingresa la descripción para cada una de ellas para agregarlas al portafolio.
                </p>

                {/* Real File Input Device selector */}
                <div className="border border-dashed border-white/15 hover:border-brand-primary/40 rounded-2xl p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-all relative flex flex-col items-center justify-center text-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="w-6 h-6 text-brand-primary" />
                  <span className="text-xs font-semibold">Seleccionar archivos de imagen</span>
                  <span className="text-[10px] text-zinc-500">Admite .png, .jpg y .webp desde tu móvil u ordenador</span>
                </div>

                {/* Uploaded items lists with inputs */}
                {galleryItems.length > 0 && (
                  <div className="space-y-3 pt-2 max-h-[220px] overflow-y-auto pr-1">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl items-center">
                        <img 
                          referrerPolicy="no-referrer"
                          src={item.url} 
                          alt="preview" 
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10" 
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="text-[10px] text-zinc-400 font-mono truncate">{item.fileName}</div>
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => {
                              setGalleryItems(galleryItems.map(g => g.id === item.id ? { ...g, desc: e.target.value } : g));
                            }}
                            placeholder="Ej: Tarta de fresa con crema de nopal"
                            className="w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 transition-all outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setGalleryItems(galleryItems.filter(g => g.id !== item.id))}
                          className="text-red-400 hover:text-red-300 font-bold p-1 cursor-pointer text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="cursor-pointer flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#494bd6] to-[#6f00be] text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(111,0,190,0.5)] transition-all duration-300 text-center"
                >
                  Guardar Galería ({galleryItems.length} fotos)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* D. Special section: Horarios modal window */}
      <AnimatePresence>
        {activeSectionModal === 'horarios' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#010202]/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#131315] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)] space-y-6 relative"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-white text-md sm:text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-primary animate-pulse" />
                  <span>Configurar: Horarios comerciales</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Detalla los horarios de apertura de tu local, atención telefónica, delivery o reservas de turnos.
                </p>

                <textarea
                  value={hoursText}
                  onChange={(e) => setHoursText(e.target.value)}
                  placeholder="Lunes a Viernes: 08:30 AM - 07:00 PM&#10;Sábados: 09:00 AM - 02:00 PM&#10;Domingos: Cerrado"
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="cursor-pointer flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#494bd6] to-[#6f00be] text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(111,0,190,0.5)] transition-all duration-300 text-center"
                >
                  Guardar Horarios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* E. Special section: FAQ modal window */}
      <AnimatePresence>
        {activeSectionModal === 'faq' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#010202]/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#131315] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)] space-y-6 relative"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-white text-md sm:text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-primary animate-pulse" />
                  <span>Configurar: Preguntas Frecuentes (FAQ)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Ingresa las preguntas y respuestas típicas con las que te contactan tus clientes (ej: envíos, métodos de pago, devoluciones).
                </p>

                <textarea
                  value={faqText}
                  onChange={(e) => setFaqText(e.target.value)}
                  placeholder="P: ¿Hacen envíos a todo el país?&#10;R: Sí, despachamos vía encomienda en 24 horas.&#10;&#10;P: ¿Cuáles son las formas de pago?&#10;R: Tarjetas de crédito, debito, transferencias bancarias y efectivo."
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="cursor-pointer flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#494bd6] to-[#6f00be] text-white font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(111,0,190,0.5)] transition-all duration-300 text-center"
                >
                  Guardar FAQ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
