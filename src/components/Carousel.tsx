import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Smartphone, Eye } from 'lucide-react';
import { ProjectDemo } from '../types';

const DEMO_PROJECTS: ProjectDemo[] = [
  {
    id: '1',
    title: 'Lumiére',
    category: 'Skincare',
    badge: 'Premium Glow',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtNqOKL1grtM84VSsg61V299fnQeYpa2ctFZT0kaSXD0t43yuOrdFG74CVy-JBa-J4YtKPLWJqCcJNKQLkTngBr2TKH2DoucD0rpOEo_VxMxJ2COJYEMQ44hG_NHKUWZlRcGt34WeJe8bMTt5hUvf1ezfwH2EzGT1jwYB3x2Ikg6-QrUktbz6ak7GWJthgoCOB96hA99KUrX-JZjFspi0ioTVkGOG-Y38aGPHhx9Yji-FKoXYKde6KYBSX68NdW5-EvlbW1cdw8XKe',
    description: 'Estética minimalista y catálogo de cosmética natural de alta gama. Integramos paneles interactivos para actualizar stock y precios sin complicaciones.',
    tags: ['E-commerce', 'Minimalista', 'Fast Load'],
    link: '#demo-lumiere',
  },
  {
    id: '2',
    title: 'Neo-Edo',
    category: 'Streetwear',
    badge: 'Avant-garde',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMgEmK_lyir3sA7DFjeOSbKnJCncLU9FOfIyoZbXzWv1651EndrRefVd7P1L1AcD_1RJwe1AQ3ukGx3ME4LlV0ZanCGqOHwAgmm2DbUeohifbLs2-UdTHTybZolfwVHN2S00CJrIXY4y58tc_S_1pRDp91HoLo8h9KHzmgrMsblqV-3nhUJhC_r3AW62HVISt1_o_mXaUuRUuo-9V-xOjTvLiVL5BICoEWmhGOmna9ds4dbLViXuUio87FCk939Yp2Mj5fIhX7uIwR',
    description: 'Grid interactivo y catálogo visual audaz de moda urbana. Conexión automatizada a redes y botones de compra directa.',
    tags: ['Diseño Bold', 'Streetwear', 'Catálogo'],
    link: '#demo-neo-edo',
  },
  {
    id: '3',
    title: 'Luxe Brew',
    category: 'Coffee Shop',
    badge: 'Warm Blend',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf4ohpIPsrdjPjsDfbh7HvH_F7VZtgt2BSIaBlb1ohOkm-eDvTFh6cOUZZ6Bn18uD4tcTDLSccRiYdOyVRnDogtmTB3bLm4NNDBRyUvbN3-ZAIaE5VoquMc1FOF-k50xFsWw1xPCdKjdPstgCURaAC4jBrxv39hdvdTExiom1KpLpkyYNLVHksHYBuW5GCSx4doDe2o1Vt-5hccraLYIP-oZ9isbCfqno-tOLzGuEPavnHt1-OWbIVIRSB0yjMQP1MxCQ5Wj7mk0Vu',
    description: 'Menú digital moderno para cafetería y tostaduría artesanal. Modifica precios y variedades en segundos.',
    tags: ['Carta Digital', 'Cálido', 'WhatsApp Order'],
    link: '#demo-luxe-brew',
  },
  {
    id: '4',
    title: 'ModaFlex',
    category: 'Sportswear',
    badge: 'Dynamic Action',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWKHrNCIMvai-sfQakps5ytfh_g-CMq1czyyPvS0aI_gWYVdA3izu4FISzActKB3Eis9Sxt_GmxNSMiN0qWWcXBdXl7BmFgJywEL5DuCB9q3OCVuwVqeaMxdeNh9PKpleEBNoJ3qoPYsqQ8rIRW4CgryzV6IV8x469131BQQS5SCgxzrknU5WBaqkkdssEpP6W7-nnYgoCKIY_UMXe690iB30X9yu7d7cUDr48g7kCbUNpkmr5AIHjdyHrL7SgQuO7V_TQmfU61t5P',
    description: 'Catálogo de indumentaria deportiva con animaciones premium y filtros sencillos de categoría para tus compradores habituales.',
    tags: ['Responsive', 'Deportivo', 'Boutique'],
    link: '#demo-modaflex',
  },
  {
    id: '5',
    title: 'Hilos Sweet',
    category: 'Crochet & Deco',
    badge: 'Cozy Pastels',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbKs5K9YfRDJKHNN-nq22uDcm47YgGN19sBMaSVPK6WJp87G0DtGPyHCb4YW97nCUFSgX7QcoRfiF7RkAAv-nB5-4XRJZ-7L1byfJ-T0NMtUyYHXzDeLvvPg_lGRurpa_4OuG9rBE1-43oLnWt1PERjvBOp0eOHcqs7l1nDWiPHVSRB1lSnMC4mKeAydof1myhicgGY5hlsWSbrMnhRKjWQ8aYjBnSfQqNeKKdnTVtaEiAP4aEDEm9xApL8zDdooZs62_qaLTifvOW',
    description: 'Boutique acogedora con cuadrícula elegante de productos hechos a mano e integración con WhatsApp para cotizar diseños a medida.',
    tags: ['Crochet', 'WhatsApp Chat', 'Pastel'],
    link: '#demo-hilos-sweet',
  },
  {
    id: '6',
    title: 'Void Archive',
    category: 'Tech-wear',
    badge: 'Brutalist Concept',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTok11dI2w8yTdNbLXg-eSXyeiheW0IP20RMRRnB0RodXsJkBCRjNv24j9QpPI26hzET7vvKSQYFaOhj3jVRhnCfefxi2oM4Jj-nFLIHGYHWFPM384im1GeKwIh8DqmfxG_RrhGTI3QLp2AOgzV8sZRc3tWK3eJ2Vk09R5hsq5qzkEKghAn8bsoCQqoPFDG4vxL9xUfpMkW58PJP8qt6Jvw3BFrut3BU2DHyjmgpuAYQbSmqnorJyNuRoQlNpOBIsUu2ZBy0XJ7r_V',
    description: 'Estética underground y catálogo de indumentaria técnica cyberpunk. Experiencia de navegación inmersiva y de alto impacto.',
    tags: ['Brutalista', 'Modo Oscuro', 'Techwear'],
    link: '#demo-void-archive',
  },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start centering Luxe Brew
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 45;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % DEMO_PROJECTS.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + DEMO_PROJECTS.length) % DEMO_PROJECTS.length);
      }
    }
    setTouchStartX(null);
  };

  // Gentle auto-advance timer that rotates slide every 8.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEMO_PROJECTS.length);
    }, 8500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      id="experiencias"
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.98 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[100dvh] w-full flex flex-col justify-center items-center relative overflow-hidden px-4 py-6 snap-center"
    >
      {/* Light glow elements */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header with reduced spacing as requested */}
        <div className="text-center mb-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2"
          >
            Experiencias Recientes
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 font-sans text-[12px] max-w-2xl mx-auto leading-relaxed px-2"
          >
            Explora nuestra selección de proyectos recientes que transforman marcas. ¿Estás listo para dar el salto digital con un diseño de élite?
          </motion.p>
        </div>

        {/* 3D Stack Container with Touch listeners */}
        <div 
          className="stack-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {DEMO_PROJECTS.map((project, i) => {
            const len = DEMO_PROJECTS.length;
            const diff = (i - currentIndex + len) % len;
            
            let cardClass = "hidden-right";
            if (diff === 0) {
              cardClass = "active";
            } else if (diff === len - 1) {
              cardClass = "prev";
            } else if (diff === 1) {
              cardClass = "next";
            } else if (diff === len - 2) {
              cardClass = "hidden-left";
            } else if (diff < len / 2) {
              cardClass = "hidden-right";
            } else {
              cardClass = "hidden-left";
            }

            return (
              <div
                key={project.id}
                onClick={() => {
                  if (i !== currentIndex) {
                    setCurrentIndex(i);
                  }
                }}
                className={`stack-card group ${cardClass}`}
              >
                {/* Visual Glass highlights inside card */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                
                <img
                  src={project.image}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Gradient bottom cover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-6 sm:p-8" />
                
                {/* Details overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-1 text-left pointer-events-none">
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-none pb-1">
                    {project.title}
                  </h3>
                </div>

                {/* Quick actions indicator */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="backdrop-blur-md bg-black/60 px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-brand-cyan" />
                    Vista Responsiva
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
}
