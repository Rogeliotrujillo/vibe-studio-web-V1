import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layout,
  Layers,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface TabItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
}

const TABS: TabItem[] = [
  {
    id: 'design',
    title: 'Diseño Creativo',
    subtitle: 'Estilo Visual Adaptable',
    description: 'Editor visual integrado para modificar layouts, colores y tipografías quirúrgicamente.',
    bullets: ['Inspector de código visual', 'Vista previa multidispositivo', 'Tipografías premium'],
  },
  {
    id: 'catalog',
    title: 'Gestión de Catálogo',
    subtitle: 'Inventario sin Estrés',
    description: 'Control total sobre tus productos, stock y precios en tiempo real sin complicaciones.',
    bullets: ['Edición directa de textos', 'Control de stock instantáneo', 'WhatsApp Quick-Order'],
  },
  {
    id: 'sales',
    title: 'Ventas y Finanzas',
    subtitle: 'Métricas Simplificadas',
    description: 'Dashboard simplificado para monitorear ingresos, pedidos y rendimiento de tu negocio.',
    bullets: ['Seguimiento de visitas directas', 'Gráficos interactivos avanzados', 'Simulación de ventas'],
  },
];

interface ProductMock {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function EditorSimulator() {
  const [activeTab, setActiveTab] = useState('design');

  // Interactive configurations for Tab 1 (Design)
  const [themeColor, setThemeColor] = useState<'indigo' | 'cyan' | 'purple'>('indigo');
  const [fontStyle, setFontStyle] = useState<'sans' | 'display' | 'mono'>('sans');
  const [heroText, setHeroText] = useState('La Nueva Colección está aquí');

  // Interactive configurations for Tab 2 (Catalog)
  const [products, setProducts] = useState<ProductMock[]>([
    { id: 'p1', name: 'Zapatillas Urban Tech', price: 69, stock: 12 },
    { id: 'p2', name: 'Hoodie Over-sized Void', price: 42, stock: 8 },
    { id: 'p3', name: 'Chaqueta Impermeable', price: 110, stock: 4 },
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(25);

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    const newProd: ProductMock = {
      id: `p-${Date.now()}`,
      name: newProductName,
      price: Number(newProductPrice) || 20,
      stock: 15,
    };
    setProducts([...products, newProd]);
    setNewProductName('');
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateStock = (id: string, delta: number) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const freshStock = Math.max(0, p.stock + delta);
          return { ...p, stock: freshStock };
        }
        return p;
      })
    );
  };

  // Interactive configurations for Tab 3 (Sales)
  const [mockSalesData, setMockSalesData] = useState<number[]>([150, 310, 240, 520, 480, 710, 940]);
  const [totalRevenue, setTotalRevenue] = useState(3350);

  const handleSimulateSale = () => {
    const saleAmount = Math.floor(Math.random() * 80) + 20;
    setTotalRevenue((prev) => prev + saleAmount);
    setMockSalesData((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = copy[copy.length - 1] + saleAmount;
      return copy;
    });
  };

  const handleResetSale = () => {
    setMockSalesData([150, 310, 240, 520, 480, 710, 940]);
    setTotalRevenue(3350);
  };

  return (
    <motion.section
      id="administrador-section"
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.98 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[100dvh] w-full flex flex-col justify-center items-center relative bg-zinc-950/20 px-4 py-6 snap-center"
    >
      {/* Dynamic Background highlights */}
      <div className="absolute top-[50%] right-[-100px] w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[10%] left-[-100px] w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* Header Block */}
        <div className="text-center mb-8 md:mb-12 border-t border-transparent">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Toma el Control con el <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Modo Editor</span>
          </h2>
          <p className="text-zinc-400 font-sans text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            No dependas de nadie. Nuestro sistema simplificado te permite actualizar contenidos, precios, fotos y stock en tiempo real. ¡Pruébalo ahora debajo tocando las pestañas!
          </p>
        </div>

        {/* Content Splitting Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch pt-2">
          
          {/* Left Panel: Tabs list (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center gap-4">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 relative cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-zinc-900/80 border-white/12 shadow-xl shadow-brand-primary/5'
                      : 'bg-transparent border-white/5 hover:bg-zinc-900/35 hover:border-white/10'
                  }`}
                >
                  {/* Neon slide marker */}
                  {isSelected && (
                    <motion.div
                      layoutId="tabVerticalBorder"
                      className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-brand-primary"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-brand-primary font-bold tracking-wider uppercase">
                      {tab.subtitle}
                    </span>
                    {isSelected && (
                      <span className="text-brand-cyan text-xs font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                        Activo
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold text-white">
                    {tab.title}
                  </h3>

                  <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                    {tab.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {tab.bullets.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-300 font-medium px-2 py-0.5 rounded bg-white/5 border border-white/5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                        {b}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Compact Tab Switcher for Mobile & Tablet (Only shown on < lg) */}
          <div className="lg:hidden w-full relative z-10 mb-1">
            <div className="flex items-center justify-around bg-zinc-900/90 border border-white/5 p-1 rounded-xl">
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 px-1 rounded-lg text-[10px] sm:text-xs font-sans font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/10'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.id === 'design' && <Layout className="w-3.5 h-3.5" />}
                    {tab.id === 'catalog' && <Layers className="w-3.5 h-3.5" />}
                    {tab.id === 'sales' && <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{tab.id === 'design' ? 'Diseño' : tab.id === 'catalog' ? 'Catálogo' : 'Métricas'}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Active Tab brief subtitle description box (highly optimized, collapsible) */}
            <div className="mt-2 px-3.5 py-2.5 rounded-xl bg-[#111113]/80 border border-white/5 text-[10px] sm:text-[11px] font-sans text-zinc-400 flex items-center justify-between">
              <span>{TABS.find((t) => t.id === activeTab)?.subtitle} — {TABS.find((t) => t.id === activeTab)?.description.slice(0, 65)}...</span>
              <span className="text-glow-primary text-brand-primary shrink-0 hidden sm:inline ml-2 font-mono font-bold text-[9px]">ONLINE ⚡</span>
            </div>
          </div>

          {/* Right Panel: Interactive Visual Sandbox */}
          <div className="lg:col-span-7 w-[299.35px] max-w-full mx-auto h-[497px] text-[3px] glass-panel rounded-2xl md:rounded-3xl border border-white/10 p-1 flex flex-col overflow-hidden relative shadow-2xl">
            {/* Window bar header simulating browser */}
            <div className="bg-zinc-900/60 border-b border-white/5 px-2.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="rounded-md bg-zinc-950 px-3 sm:px-4 py-1 flex items-center gap-1.5 border border-white/5 text-[10px] sm:text-[11px] font-mono text-zinc-450 w-3/5 sm:w-1/2 justify-center select-none truncate">
                <span className="text-zinc-500 font-bold">vibes.app/</span>editor/workspace
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-brand-primary font-mono shrink-0">
                <span className="hidden xs:inline">Simulador</span>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
            </div>

            {/* Sandbox Container */}
            <div className="flex-1 bg-zinc-950/70 p-4 sm:p-6 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {/* Visual Editor Dashboard (Tab 1: design) */}
                {activeTab === 'design' && (
                  <motion.div
                    key="design-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Simulator Controls inside panel */}
                    <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white uppercase text-glow-primary">
                          Controles del Panel Editor
                        </span>
                        <span className="text-[10px] bg-indigo-500/10 text-brand-primary px-2 py-0.5 rounded-full font-mono border border-indigo-500/20">
                          Panel de Control
                        </span>
                      </div>

                      {/* Theme colors option */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-400 block font-semibold">Tono de Acento (Vibe Accent)</label>
                          <div className="flex gap-2">
                            <button
                              aria-label="Color Indigo"
                              onClick={() => setThemeColor('indigo')}
                              className={`w-6 h-6 rounded-full bg-indigo-500 border cursor-pointer transition-all ${
                                themeColor === 'indigo' ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                            <button
                              aria-label="Color Cyan"
                              onClick={() => setThemeColor('cyan')}
                              className={`w-6 h-6 rounded-full bg-cyan-400 border cursor-pointer transition-all ${
                                themeColor === 'cyan' ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                            <button
                              aria-label="Color Purple"
                              onClick={() => setThemeColor('purple')}
                              className={`w-6 h-6 rounded-full bg-fuchsia-400 border cursor-pointer transition-all ${
                                themeColor === 'purple' ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Font Style options */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-400 block font-semibold">Familia Tipográfica</label>
                          <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-lg border border-white/5">
                            {['sans', 'display', 'mono'].map((f) => (
                              <button
                                key={f}
                                onClick={() => setFontStyle(f as any)}
                                className={`text-[9px] font-mono px-2 py-0.5 rounded capitalize cursor-pointer transition-all flex-1 ${
                                  fontStyle === f
                                    ? 'bg-brand-primary text-black font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Input to edit live heading */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 block font-semibold">Editar Texto del Título</label>
                        <input
                          type="text"
                          value={heroText}
                          onChange={(e) => setHeroText(e.target.value)}
                          maxLength={36}
                          placeholder="Configura el título..."
                          className="w-full text-xs font-sans text-white bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    {/* Previsualización del Sitio (Simulating a beautiful phone glass mockup container) */}
                    <div className="relative pt-1 border-t border-white/5">
                      <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase flex items-center justify-between">
                        <span>Vista previa del sitio resultante</span>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                          <span className="text-[9px]">Sincronizado</span>
                        </div>
                      </div>

                      {/* Simulated web block */}
                      <div className="glass-panel rounded-xl p-6 border border-white/5 relative overflow-hidden backdrop-blur-sm">
                        {/* Glow indicator based on theme color */}
                        <div
                          className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-40 transition-all duration-300 ${
                            themeColor === 'indigo'
                              ? 'bg-indigo-500'
                              : themeColor === 'cyan'
                              ? 'bg-cyan-500'
                              : 'bg-fuchsia-500'
                          }`}
                        />

                        {/* Styled mini navbar inside preview */}
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/5 text-[10px] font-mono text-zinc-400">
                          <span className="font-bold text-white flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-white" /> ShopVibe
                          </span>
                          <span className="text-[9px]">Menú ☰</span>
                        </div>

                        {/* Title text */}
                        <div className="space-y-2">
                          <span
                            className={`text-[9px] font-mono font-bold uppercase transition-all ${
                              themeColor === 'indigo'
                                ? 'text-indigo-400'
                                : themeColor === 'cyan'
                                ? 'text-cyan-400'
                                : 'text-fuchsia-300'
                            }`}
                          >
                            ⭐ Lanzamiento Especial
                          </span>

                          <h4
                            className={`text-lg md:text-xl font-bold text-white leading-tight transition-all uppercase tracking-wide ${
                              fontStyle === 'sans'
                                ? 'font-sans'
                                : fontStyle === 'display'
                                ? 'font-display'
                                : 'font-mono'
                            }`}
                          >
                            {heroText || 'Introduce un texto...'}
                          </h4>

                          <p className="text-[10px] text-zinc-400 font-sans max-w-sm">
                            El diseño es contemporáneo, ultra rápido, y está listo para empezar a capturar ventas y cotizaciones.
                          </p>
                        </div>

                        {/* Action buttons preview inside */}
                        <div className="flex gap-2 mt-4 pt-1">
                          <button
                            className={`text-[9px] font-bold px-3 py-1.5 rounded-lg text-black transition-all ${
                              themeColor === 'indigo'
                                ? 'bg-indigo-300 hover:bg-white'
                                : themeColor === 'cyan'
                                ? 'bg-cyan-300 hover:bg-white'
                                : 'bg-fuchsia-300 hover:bg-white'
                            }`}
                          >
                            Comprar Ahora
                          </button>
                          <button className="text-[9px] text-white font-medium border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                            Saber Más
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Catalog Database Simulator (Tab 2: catalog) */}
                {activeTab === 'catalog' && (
                  <motion.div
                    key="catalog-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Add Product Inline form */}
                    <form
                      onSubmit={addProduct}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-wrap sm:flex-nowrap items-end gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-zinc-400 block font-semibold">Nombre de Producto</label>
                        <input
                          type="text"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="Ej: Gorra Premium Obsidian"
                          className="w-full text-xs font-sans text-white bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] text-zinc-400 block font-semibold">Precio (USD)</label>
                        <input
                          type="number"
                          value={newProductPrice || ''}
                          onChange={(e) => setNewProductPrice(Number(e.target.value))}
                          placeholder="45"
                          className="w-full text-xs font-sans text-white bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer px-3.5 py-2.5 rounded-full bg-brand-primary text-black font-semibold text-xs transition-transform active:scale-95 flex items-center gap-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir
                      </button>
                    </form>

                    {/* Interactive table of products */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1 text-[10px] font-mono text-zinc-500 uppercase">
                        <span>Catálogo Digital</span>
                        <span>{products.length} Items Registrados</span>
                      </div>

                      {/* Grid / List of active items */}
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                        <AnimatePresence initial={false}>
                          {products.map((p) => (
                            <motion.div
                              key={p.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-between gap-4 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-bold text-xs text-brand-primary">
                                  <ShoppingBag className="w-4 h-4 text-brand-secondary" />
                                </div>
                                <div>
                                  <span className="text-xs text-white font-medium block leading-none mb-1">
                                    {p.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-brand-cyan">
                                    ${p.price} USD
                                  </span>
                                </div>
                              </div>

                              {/* Interactive stock control */}
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase mr-1.5">Stock:</span>
                                  <button
                                    onClick={() => updateStock(p.id, -1)}
                                    className="w-5 h-5 rounded bg-zinc-950 hover:bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-white cursor-pointer border border-white/5"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs text-white font-mono font-bold w-6 text-center">
                                    {p.stock}
                                  </span>
                                  <button
                                    onClick={() => updateStock(p.id, 1)}
                                    className="w-5 h-5 rounded bg-zinc-950 hover:bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-white cursor-pointer border border-white/5"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeProduct(p.id)}
                                  className="w-7 h-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                                  aria-label="Eliminar producto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Sales dashboard Simulator (Tab 3: sales) */}
                {activeTab === 'sales' && (
                  <motion.div
                    key="sales-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Upper metrics block */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
                          <span>Total Ingresos</span>
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight">
                          ${totalRevenue}.00 <span className="text-xs font-sans text-brand-primary font-bold">USD</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-mono block">Actualizado justo ahora</span>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
                          <span>Pedidos hoy</span>
                          <TrendingUp className="w-3.5 h-3.5 text-brand-secondary" />
                        </div>
                        <div className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight">
                          {Math.round(totalRevenue / 46)} <span className="text-xs font-sans text-emerald-400 font-bold block sm:inline">+12%</span>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5 leading-none mt-1">
                          🟢 Tráfico Seguro
                        </span>
                      </div>
                    </div>

                    {/* Simulated SVG Graph */}
                    <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 relative">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-3">Gráfico de Rendimiento (Últimos 7 días)</span>
                      
                      {/* Simple SVG diagram */}
                      <div className="h-28 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Line shading */}
                          <path
                            d={`M 0 ${30 - mockSalesData[0]/35} L 16.6 ${30 - mockSalesData[1]/35} L 33.3 ${30 - mockSalesData[2]/35} L 50 ${30 - mockSalesData[3]/35} L 66.6 ${30 - mockSalesData[4]/35} L 83.3 ${30 - mockSalesData[5]/35} L 100 ${30 - mockSalesData[6]/35} L 100 30 L 0 30 Z`}
                            fill="url(#chartGrad)"
                          />
                          
                          {/* Main stroke line */}
                          <path
                            d={`M 0 ${30 - mockSalesData[0]/35} L 16.6 ${30 - mockSalesData[1]/35} L 33.3 ${30 - mockSalesData[2]/35} L 50 ${30 - mockSalesData[3]/35} L 66.6 ${30 - mockSalesData[4]/35} L 83.3 ${30 - mockSalesData[5]/35} L 100 ${30 - mockSalesData[6]/35}`}
                            fill="none"
                            stroke="#c0c1ff"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />

                          {/* Dots */}
                          {mockSalesData.map((val, idx) => {
                            const cx = idx * 16.6;
                            const cy = 30 - val/35;
                            return (
                              <circle
                                key={idx}
                                cx={cx}
                                cy={cy}
                                r="1"
                                className="fill-brand-secondary stroke-zinc-950"
                                strokeWidth="0.4"
                              />
                            );
                          })}
                        </svg>

                        {/* Labels for graph days */}
                        <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[8px] font-mono text-zinc-500 uppercase pt-1 border-t border-white/5">
                          <span>Lun</span>
                          <span>Mar</span>
                          <span>Mié</span>
                          <span>Jue</span>
                          <span>Vie</span>
                          <span>Sáb</span>
                          <span>Hoy</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulating actions buttons */}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleResetSale}
                        className="text-[10px] text-zinc-400 font-mono bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reiniciar Métricas
                      </button>

                      <button
                        onClick={handleSimulateSale}
                        className="text-[10px] text-black font-semibold bg-brand-primary hover:bg-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Simular Venta Directa (+$45)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
