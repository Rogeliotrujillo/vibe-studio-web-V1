import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  Sparkles,
  Zap,
  CreditCard,
  Layers,
  Eye,
  Clock,
  Smartphone,
  MessageCircle,
  ArrowRight,
  Globe,
  Share2,
  CheckCircle2,
  Heart,
  Lock
} from 'lucide-react';

import { ProjectConfig, FreePreviewRequest } from './types';
import FloatingNav from './components/FloatingNav';
import Carousel from './components/Carousel';
import EditorSimulator from './components/EditorSimulator';
import WhatIsIncluded from './components/WhatIsIncluded';
import ProjectConfigForm from './components/ProjectConfigForm';
import RequestPreviewForm from './components/RequestPreviewForm';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentView, setView] = useState<'landing' | 'included-details' | 'request-preview' | 'config-project' | 'admin'>('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const { scrollY } = useScroll();
  // Pronounced elegant parallax effect, allowing more dynamic movement
  const bgY = useTransform(scrollY, [0, 3000], [0, -280]);

  // DAY TO NIGHT TRANSITION ON SCROLL
  // At the top (scrollY = 0), daylightOpacity is 1 (daytime). Fades to 0 as you scroll down (nighttime).
  const daylightOpacity = useTransform(scrollY, [0, 1800], [0.95, 0]);
  
  // As you scroll down, nightOverlayOpacity rises from 0 to 0.75, bringing a deep, dark nocturnal shade.
  const nightOverlayOpacity = useTransform(scrollY, [0, 1800], [0, 0.75]);

  // Subtle image opacity transform: slightly more prominent during early morning (daytime), and darker in midnight.
  const bgImgOpacity = useTransform(scrollY, [0, 1800], [0.55, 0.35]);

  // PAGODA LEVELS LIGHTING UP - Levels glow sequence depending on vertical scroll level
  const light5Opacity = useTransform(scrollY, [0, 450, 950], [0.95, 0.95, 0.15]);
  const light4Opacity = useTransform(scrollY, [350, 850, 1450], [0.15, 0.95, 0.15]);
  const light3Opacity = useTransform(scrollY, [950, 1550, 2150], [0.15, 0.95, 0.15]);
  const light2Opacity = useTransform(scrollY, [1650, 2250, 2850], [0.15, 0.95, 0.15]);
  const light1Opacity = useTransform(scrollY, [2350, 2850, 3450], [0.15, 0.95, 0.95]);

  // Interactive vertical benefit carousel state
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [isBenefitHovered, setIsBenefitHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Autoplay for the vertical benefit carousel
  useEffect(() => {
    if (isBenefitHovered || currentView !== 'landing') return;
    const interval = setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % 6);
    }, 4500);
    return () => clearInterval(interval);
  }, [isBenefitHovered, currentView]);

  // Multi-step custom sub-list state to display in active orders panel
  const [orders, setOrders] = useState<ProjectConfig[]>([]);
  const [previews, setPreviews] = useState<FreePreviewRequest[]>([]);

  // Refresh dynamic submissions from localStorage
  const refreshSubmissions = () => {
    const cachedOrders = localStorage.getItem('vibe_projects');
    const cachedPreviews = localStorage.getItem('vibe_previews_requested');
    setOrders(cachedOrders ? JSON.parse(cachedOrders) : []);
    setPreviews(cachedPreviews ? JSON.parse(cachedPreviews) : []);
  };

  useEffect(() => {
    refreshSubmissions();
  }, [currentView]);

  // Premium auto-scroll magnet system
  useEffect(() => {
    if (currentView !== 'landing') return;

    let isLocked = false;
    let touchStartY = 0;
    let lastScrollTime = Date.now();
    let wheelEvents: { time: number; deltaY: number }[] = [];
    let touchEvents: { time: number; y: number }[] = [];

    const sections = [
      'hero-section',
      'experiencias',
      'por-que-elegirnos',
      'administrador-section',
      'contacto-footer'
    ];

    const getClosestSectionIndex = () => {
      const scrollCenter = window.scrollY + window.innerHeight / 2;
      let minDistance = Infinity;
      let closestIndex = 0;

      sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + window.scrollY + rect.height / 2;
        const distance = Math.abs(scrollCenter - elementCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    };

    const navigateToSection = (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= sections.length) return;
      const el = document.getElementById(sections[targetIndex]);
      if (!el) return;

      isLocked = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Unlock after transition cools down
      setTimeout(() => {
        isLocked = false;
      }, 750);
    };

    const handleWheel = (e: WheelEvent) => {
      // Check if scrolling inside interactive sections
      const path = (e.composedPath ? e.composedPath() : []) as HTMLElement[];
      const isInsideInteractive = path.some(el => {
        if (!el || !el.classList) return false;
        return (
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.classList.contains('stack-container') ||
          el.classList.contains('benefit-stack-container') ||
          el.classList.contains('overflow-y-auto') ||
          el.classList.contains('overflow-x-auto') ||
          el.id === 'interactive-preview-sandbox'
        );
      });

      if (isInsideInteractive) return;

      if (isLocked) {
        e.preventDefault();
        return;
      }

      const now = Date.now();
      // Record wheel events in last 250ms to judge rate of acceleration
      wheelEvents = wheelEvents.filter(ev => now - ev.time < 250);
      wheelEvents.push({ time: now, deltaY: e.deltaY });

      // Calculate total cumulative deltaY to detect fast wheel rotations
      const totalDelta = wheelEvents.reduce((sum, ev) => sum + Math.abs(ev.deltaY), 0);
      
      // Determine if they did a strong scroll flick / fast scroll effort
      const isVeryFast = totalDelta > 380 || Math.abs(e.deltaY) > 130;

      if (isVeryFast) {
        // Only trigger snap scroll if scrolling extremely quickly, otherwise let natural scrolling flow
        e.preventDefault();

        if (now - lastScrollTime < 750) return; // limit frequency of snappy navigation
        lastScrollTime = now;

        const currentIndex = getClosestSectionIndex();
        if (e.deltaY > 0) {
          navigateToSection(currentIndex + 1);
        } else if (e.deltaY < 0) {
          navigateToSection(currentIndex - 1);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchEvents = [{ time: Date.now(), y: touchStartY }];
    };

    const handleTouchMove = (e: TouchEvent) => {
      const path = (e.composedPath ? e.composedPath() : []) as HTMLElement[];
      const isInsideInteractive = path.some(el => {
        if (!el || !el.classList) return false;
        return (
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.classList.contains('stack-container') ||
          el.classList.contains('benefit-stack-container') ||
          el.classList.contains('overflow-y-auto') ||
          el.classList.contains('overflow-x-auto') ||
          el.id === 'interactive-preview-sandbox'
        );
      });

      if (isInsideInteractive) return;

      if (isLocked) {
        e.preventDefault();
        return;
      }

      const now = Date.now();
      const currentY = e.touches[0].clientY;
      
      // Keep touch moves history to calculate velocity
      touchEvents.push({ time: now, y: currentY });
      touchEvents = touchEvents.filter(ev => now - ev.time < 150);

      const deltaY = touchStartY - currentY;

      // Estimate touch swap velocity (pixels per millisecond)
      let velocity = 0;
      if (touchEvents.length >= 2) {
        const first = touchEvents[0];
        const last = touchEvents[touchEvents.length - 1];
        const timeDiff = last.time - first.time;
        if (timeDiff > 10) {
          velocity = Math.abs(first.y - last.y) / timeDiff;
        }
      }

      // Snaps only on a high-velocity swipe / "flick" motion
      const isFlick = velocity > 1.3 && Math.abs(deltaY) > 60;

      if (isFlick) {
        e.preventDefault();

        if (now - lastScrollTime < 750) return;
        lastScrollTime = now;

        const currentIndex = getClosestSectionIndex();
        if (deltaY > 0) {
          navigateToSection(currentIndex + 1);
        } else {
          navigateToSection(currentIndex - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentView]);

  // Share action event
  const [showToast, setShowToast] = useState(false);
  const [adminClicks, setAdminClicks] = useState<number>(0);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    if (adminClicks > 0) {
      const timer = setTimeout(() => {
        setAdminClicks(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [adminClicks]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (response.ok) {
        setShowAuthModal(false);
        setAdminPassword('');
        setAuthError('');
        setView('admin');
      } else {
        const d = await response.json();
        setAuthError(d.error || 'Contraseña incorrecta');
      }
    } catch (err) {
      setAuthError('Error de conexión con el de servidor');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vibe Studio',
        text: 'Tu negocio con una presencia web de alta gama.',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
    }
  };

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#070809] text-zinc-100 font-sans selection:bg-brand-primary selection:text-black antialiased relative overflow-x-hidden">
        <AdminPanel onBack={() => { setView('landing'); refreshSubmissions(); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010202] text-zinc-100 font-sans selection:bg-brand-primary selection:text-black antialiased relative overflow-x-hidden">
      
      {/* Atmospheric Misty Mountain Shrine Cinematic Background overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <motion.div
          style={{ y: bgY }}
          className="relative w-full h-[140%] origin-top pr-0 gpu-accelerated"
        >
          {/* BACKGROUND TEMPLE IMAGE: Slightly brighter when scrolling up/day, darker when scrolling down/night */}
          <motion.img
            src="/images/misty_temple_1780836265051.png"
            alt="Atmospheric misty traditional screen"
            referrerPolicy="no-referrer"
            style={{ opacity: bgImgOpacity }}
            className="w-full h-full object-cover object-[75%_center] md:object-center scale-[1.15] gpu-accelerated"
          />

          {/* DAYTIME ATMOSPHERE OVERLAYS: Glows warm sunrise/day vibes at the top */}
          <motion.div
            style={{ opacity: daylightOpacity }}
            className="absolute inset-0 bg-gradient-to-tr from-amber-400/25 via-sky-400/20 to-transparent mix-blend-screen pointer-events-none gpu-accelerated"
          />
          <motion.div
            style={{ opacity: daylightOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-amber-100/10 to-transparent mix-blend-overlay pointer-events-none gpu-accelerated"
          />

          {/* NIGHTTIME ATMOSPHERE OVERLAY: Darkens the scenery into deep midnight colors as you scroll down */}
          <motion.div
            style={{ opacity: nightOverlayOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-zinc-950/50 to-black pointer-events-none mix-blend-multiply gpu-accelerated"
          />

          {/* PAGODA WINDOW CANDLES / LIGHTS */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            {/* The pagoda is roughly in the middle height, horizontally centered based on responsive focal alignment */}
            <div className="absolute left-[64%] sm:left-[59%] md:left-[50.5%] -translate-x-1/2 w-8 h-48 sm:h-56 md:h-64 flex flex-col justify-between items-center top-[18%] sm:top-[20%] md:top-[22%] select-none pointer-events-none">
              
              {/* LEVEL 5 (Topmost pagoda floor) */}
              <motion.div
                style={{ opacity: light5Opacity }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-100 shadow-[0_0_12px_#f59e0b,0_0_24px_#ffd700] transition-opacity duration-300 animate-pulse"
              />

              {/* LEVEL 4 */}
              <motion.div
                style={{ opacity: light4Opacity }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-100 shadow-[0_0_12px_#f59e0b,0_0_24px_#ffd700] transition-opacity duration-300 animate-pulse"
              />

              {/* LEVEL 3 */}
              <motion.div
                style={{ opacity: light3Opacity }}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-200 shadow-[0_0_12px_#f59e0b,0_0_24px_#ffd700] transition-opacity duration-300 animate-pulse"
              />

              {/* LEVEL 2 */}
              <motion.div
                style={{ opacity: light2Opacity }}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-200 shadow-[0_0_12px_#f59e0b,0_0_24px_#ffd700] transition-opacity duration-300 animate-pulse"
              />

              {/* LEVEL 1 (Lowest pagoda floor) */}
              <motion.div
                style={{ opacity: light1Opacity }}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-300 shadow-[0_0_14px_#f59e0b,0_0_28px_#ffd700] transition-opacity duration-300 animate-pulse"
              />
            </div>
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#010202]/80 via-[#010202]/45 to-[#010202]" />
      </div>

      {/* Ambient Backlight Highlights matching the gold and misty periwinkle palette */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[500px] h-[500px] bg-brand-primary/10 -top-[100px] -left-[100px] blur-[150px]" />
        <div className="orb w-[600px] h-[600px] bg-brand-secondary/10 -bottom-[200px] -right-[100px] blur-[150px]" />
        <div className="orb w-[400px] h-[400px] bg-brand-cyan/5 top-[20%] right-[10%] blur-[120px]" />
      </div>

      {/* Absolute Header Menu across views */}
      {currentView === 'landing' && (
        <FloatingNav
          currentView={currentView}
          setView={setView}
          orderCount={orders.length}
          previewCount={previews.length}
        />
      )}

      {/* Pages switcher with AnimatePresence */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Main Landing Page */}
        {currentView === 'landing' && (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Ambient Background Glowing elements */}
            <div className="absolute top-[5%] left-[10%] w-[450px] h-[450px] rounded-full bg-brand-primary/10 blur-[140px] pointer-events-none animate-float" />
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-secondary/8 blur-[160px] pointer-events-none animate-pulse-slow" />
            
            {/* HERO MODULE */}
            <motion.section
              id="hero-section"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.98 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[100dvh] w-full flex flex-col justify-center items-center relative px-4 py-6 text-center snap-center"
            >
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Visual badges/tags */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs md:text-[20px] w-auto h-auto md:w-[612.317px] md:h-[20.0637px] mx-auto"
                >
                  <span className="backdrop-blur-md bg-white/5 border border-white/10 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-mono font-bold text-zinc-300 tracking-wide shadow-sm flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-primary/80 animate-pulse" />
                    Pago Único Total
                  </span>
                  <span className="backdrop-blur-md bg-cyan-950/10 border border-brand-cyan/15 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-mono font-bold text-brand-cyan/90 tracking-wide shadow-sm">
                    Entrega en 2-5 días
                  </span>
                </motion.div>

                {/* Spectacular Display Headline exactly from layout */}
                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="font-display font-bold md:font-extrabold tracking-tight text-white animate-fade-in text-[23.2px] md:text-[51.2px] leading-tight md:leading-[1.1]"
                  >
                    Tu negocio merece una web
                    <span className="block mt-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-cyan bg-clip-text text-transparent text-glow-primary text-[29.2px] md:text-[49.2px]">
                      Tu web desde $20 USD
                    </span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="text-zinc-400 font-sans text-[11px] md:text-[17px] max-w-2xl mx-auto leading-relaxed px-2"
                  >
                    Diseños modernos, panel fácil de manejar, precio accesible sin mensualidades y preview gratis antes de pagar.
                  </motion.p>
                </div>

                {/* Call to Actions flow */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="space-y-4"
                >
                  <div className="flex flex-row justify-center items-center gap-3 px-2 max-w-sm sm:max-w-md mx-auto">
                    <button
                      onClick={() => setView('request-preview')}
                      className="vibe-button-glow cursor-pointer flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold text-[11px] md:text-[13px] tracking-wider uppercase rounded-full shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-95 text-center truncate"
                    >
                      PREVIEW GRATIS
                    </button>
                    <button
                      onClick={() => setView('config-project')}
                      className="vibe-button-glow cursor-pointer flex-1 py-3 bg-transparent text-white font-mono font-semibold text-[11px] md:text-[13px] tracking-wide rounded-full border border-white/15 hover:bg-white/10 hover:border-brand-primary/50 transition-transform duration-300 hover:scale-[1.03] active:scale-95 text-center truncate"
                    >
                      PEDIR UNA WEB
                    </button>
                  </div>
                  
                  <p className="text-[10px] md:text-[12px] font-bold font-mono text-zinc-500 uppercase tracking-widest leading-none pt-2">
                    Verás tu página web sin compromisos de pago por adelantado
                  </p>
                </motion.div>
              </div>
            </motion.section>

            {/* CASE STUDIES CAROUSEL */}
            <Carousel />

            {/* BENEFIT GRID / CAROUSEL "¿Por qué elegirnos?" */}
            <motion.section
              id="por-que-elegirnos"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.98 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[100dvh] w-full flex flex-col justify-center items-center relative border-t border-white/5 bg-zinc-950/20 px-4 py-6 snap-center"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                
                {/* Header block */}
                <div className="text-center mb-10 md:mb-12 space-y-3">
                  <h2 className="font-display text-[25px] font-extrabold tracking-tight text-white">
                    Simple, rápido y potente
                  </h2>
                  <p className="text-zinc-400 font-sans text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                    Diseñado meticulosamente para que tu negocio crezca con profesionalismo y distinción.
                  </p>
                </div>

                {/* 1. Desktop widescreen grid: Shown only on large screens (lg:grid) */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: CreditCard,
                      title: '20 USD pago único',
                      desc: 'Sin mensualidades ni renovaciones sorpresivas. Pagas una única vez y el sitio es de tu propiedad para siempre.',
                    },
                    {
                      icon: Layers,
                      title: 'Panel intuitivo',
                      desc: 'Sistema de edición directa. Modifica tus productos, precios, fotos, o textos sin depender de programadores.',
                    },
                    {
                      icon: Eye,
                      title: 'Preview sin costo',
                      desc: 'Transparencia total. Visualiza y experimenta el resultado final de tu web antes de realizar cualquier pago.',
                    },
                    {
                      icon: Clock,
                      title: '2-5 días hábiles',
                      desc: 'Velocidad de carga de vanguardia. Tu presencia digital de nivel superior estará lista en menos de una semana.',
                    },
                    {
                      icon: Smartphone,
                      title: 'Diseño Adaptable',
                      desc: 'Visualización impecable calibrada para dispositivos móviles, tablets y ordenadores de escritorio.',
                    },
                    {
                      icon: MessageCircle,
                      title: 'Contacto Directo',
                      desc: 'Integración directa de tus botones para pedidos prácticos hacia WhatsApp o Instagram sin comisiones.',
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-8 rounded-2xl bg-zinc-950/50 border border-white/5 hover:border-brand-primary/40 hover:bg-zinc-950/80 hover:shadow-[0_0_30px_rgba(192,193,255,0.12)] transition-all duration-300 relative group flex flex-col gap-4 overflow-hidden text-left"
                    >
                      {/* Interactive glowing background orb inside cards */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/15 transition-all duration-500" />
                      
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-brand-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-primary/10 transition-all duration-300">
                        <item.icon className="w-5 h-5 text-brand-primary group-hover:text-glow-primary" />
                      </div>
                      <div className="space-y-2 relative z-10">
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 2. Interactive benefit deck: Shown only on tablets and mobile devices (< lg) */}
                <div className="lg:hidden block pt-2 overflow-visible relative">
                  <div 
                    className="benefit-stack-container"
                    onTouchStart={(e) => {
                      setTouchStartX(e.touches[0].clientX);
                      setIsBenefitHovered(true);
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartX === null) return;
                      const diffX = touchStartX - e.changedTouches[0].clientX;
                      const threshold = 40;
                      if (Math.abs(diffX) > threshold) {
                        if (diffX > 0) {
                          setActiveBenefit((prev) => (prev + 1) % 6);
                        } else {
                          setActiveBenefit((prev) => (prev - 1 + 6) % 6);
                        }
                      }
                      setTouchStartX(null);
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const diff = (idx - activeBenefit + 6) % 6;
                      let classStr = "benefit-stack-card";
                      if (diff === 0) {
                        classStr += " active";
                      } else if (diff === 1 || (activeBenefit === 5 && idx === 0)) {
                        classStr += " next";
                      } else if (diff === 5 || (activeBenefit === 0 && idx === 5)) {
                        classStr += " prev";
                      } else if (diff < 3) {
                        classStr += " hidden-right";
                      } else {
                        classStr += " hidden-left";
                      }

                      const itemIcon = [CreditCard, Layers, Eye, Clock, Smartphone, MessageCircle][idx];
                      const itemTitle = ['20 USD pago único', 'Panel intuitivo', 'Preview sin costo', '2-5 días hábiles', 'Diseño Adaptable', 'Contacto Directo'][idx];
                      const itemDesc = [
                        'Sin mensualidades ni renovaciones sorpresivas. Pagas una única vez y el sitio es de tu propiedad para siempre.',
                        'Sistema de edición directa. Modifica tus productos, precios, fotos, o textos sin depender de programadores.',
                        'Transparencia total. Visualiza y experimenta el resultado final de tu web antes de realizar cualquier pago.',
                        'Velocidad de carga de vanguardia. Tu presencia digital de nivel superior estará lista en menos de una semana.',
                        'Visualización impecable calibrada para dispositivos móviles, tablets y ordenadores de escritorio.',
                        'Integración directa de tus botones para pedidos prácticos hacia WhatsApp o Instagram sin comisiones.'
                      ][idx];

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveBenefit(idx);
                            setIsBenefitHovered(true);
                          }}
                          className={classStr}
                        >
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl" />
                          
                          <div className="space-y-2.5 relative z-10 text-left flex flex-col justify-between h-full w-full">
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-brand-primary flex items-center justify-center shrink-0">
                                  {React.createElement(itemIcon, { className: "w-4 h-4 text-brand-primary text-glow-primary" })}
                                </div>
                                <h3 className="font-display font-extrabold text-[11px] sm:text-xs text-white leading-tight">
                                  {itemTitle}
                                </h3>
                              </div>
                              <p className="text-zinc-300 font-sans text-[10px] leading-relaxed font-normal">
                                {itemDesc}
                              </p>
                            </div>

                            <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                              <span>DESLIZA</span>
                              <span>{idx + 1} / 6</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Call to action "¿QUE INCLUYE LA WEB? →" */}
                <div className="text-center mt-12">
                  <button
                    onClick={() => setView('included-details')}
                    className="cursor-pointer px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all border border-white/10 text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 group shadow-sm active:scale-95"
                  >
                    ¿QUE INCLUYE LA WEB?
                    <ArrowRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* INTERACTIVE ADMIN SANDBOX */}
            <EditorSimulator />

            {/* FOOTER SECTION */}
            <footer id="contacto-footer" className="py-12 md:py-16 relative bg-zinc-950 border-t border-white/5 snap-end">
              <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 text-sm">
                
                {/* Brand description column */}
                <div className="md:col-span-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-base md:text-lg tracking-tight text-white logo-text text-glow-primary">
                      Vibe Studio
                    </span>
                  </div>
                  
                  <p className="text-zinc-400 font-sans text-xs leading-relaxed max-w-sm">
                    Ecosistemas digitales de alto nivel e ingeniería visual contemporánea. Impulsamos marcas con interfaces dinámicas de velocidad infinita y absoluto control autogestionable.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleShare}
                      aria-label="Compartir Vibe"
                      className="cursor-pointer w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-white/5"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      aria-label="Sitio seguro"
                      className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-emerald-400 border border-white/5"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Services Column */}
                <div className="md:col-span-3 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold font-mono text-zinc-500">
                     Sistemas & Soluciones
                  </span>
                  <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                    <li className="hover:text-brand-primary hover:text-glow-primary transition-colors cursor-pointer" onClick={() => setView('config-project')}>Estrategia Digital y Soporte de WhatsApp</li>
                    <li className="hover:text-brand-primary hover:text-glow-primary transition-colors cursor-pointer" onClick={() => setView('config-project')}>Desarrollo de Páginas Web Autogestionables</li>
                    <li className="hover:text-brand-primary hover:text-glow-primary transition-colors cursor-pointer" onClick={() => setView('config-project')}>Edición Directa y Gestión de Catálogo</li>
                  </ul>
                </div>

                {/* Contacts Column */}
                <div className="md:col-span-4 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold font-mono text-zinc-500">
                    Canales de Enlace
                  </span>
                  <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                    <li>
                      <a href="https://instagram.com/vstudio.22" target="_blank" rel="noreferrer" className="hover:text-brand-primary transition-colors">
                        📷 Instagram: @vstudio.22
                      </a>
                    </li>
                    <li className="text-zinc-500">
                      <span className="font-mono">✉️ Email:</span> vibe.studio.webs@gmail.com
                    </li>
                  </ul>
                </div>
              </div>

              {/* Lower watermark bar */}
              <div className="max-w-6xl mx-auto px-6 border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setAdminClicks(prev => {
                        const next = prev + 1;
                        if (next >= 3) {
                          setShowAuthModal(true);
                          setAdminPassword('');
                          setAuthError('');
                          return 0;
                        }
                        return next;
                      });
                    }}
                    className="w-8 h-8 opacity-0 select-none cursor-pointer focus:outline-none pointer-events-auto shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-left">Vibe Studio — Alta Costura Digital & Ingeniería Web de Elite © 2026</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {/* VIEW 2: Included Details page */}
        {currentView === 'included-details' && (
          <motion.div
            key="details-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <WhatIsIncluded setView={setView} />
          </motion.div>
        )}

        {/* VIEW 3: Request Preview template */}
        {currentView === 'request-preview' && (
          <motion.div
            key="preview-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <RequestPreviewForm setView={setView} onPreviewRequested={refreshSubmissions} />
          </motion.div>
        )}

        {/* VIEW 4: Configure Project Form */}
        {currentView === 'config-project' && (
          <motion.div
            key="config-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <ProjectConfigForm setView={setView} onOrderSubmitted={refreshSubmissions} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#131315]/95 backdrop-blur-xl border border-white/10 px-5 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <CheckCircle2 className="w-5 h-5 text-brand-primary" />
            <span className="text-xs font-sans font-medium text-white">¡Enlace de Vibe Studio copiado al portapapeles!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Lock Trigger deleted - now nested beautifully in footer watermark bar */}

      {/* Passcode Unlock Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-[#0a0b0d]/95 p-6 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-center relative overflow-hidden"
            >
              {/* Decorative radial brand glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-secondary/15 border border-brand-primary/20 flex items-center justify-center mx-auto mb-4 relative z-10">
                <Lock className="w-5 h-5 text-brand-primary text-glow-primary animate-pulse" />
              </div>

              <h3 className="font-display font-black text-white text-lg tracking-tight relative z-10">
                Acceso de Administración
              </h3>
              <p className="text-zinc-400 font-sans text-xs mt-1 mb-5 leading-relaxed relative z-10">
                Ingresa la contraseña maestra para administrar los pedidos de la base de datos de Vibe Studio.
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
                <input
                  type="password"
                  placeholder="••••"
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl py-3 text-center text-white text-lg font-mono tracking-widest focus:outline-none focus:border-brand-primary/45 focus:shadow-[0_0_15px_rgba(192,193,255,0.08)] transition-all"
                />

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono text-center animate-shake"
                  >
                    {authError}
                  </motion.div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-brand-primary text-black font-extrabold text-xs uppercase tracking-wider hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer shadow-[0_4px_15px_rgba(192,193,255,0.2)]"
                  >
                    Desbloquear
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
