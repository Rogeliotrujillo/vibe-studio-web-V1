import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Trash2,
  Calendar,
  Layers,
  Phone,
  Palette,
  Eye,
  CheckCircle2,
  Inbox,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Download,
  ArchiveRestore,
  Settings,
  Search,
  Building,
  Clock,
  HelpCircle,
  Image as ImageIcon,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  FileDown
} from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'preview' | 'order' | 'trash'>('order');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [isUpdatingConfig, setIsUpdatingConfig] = useState<boolean>(false);
  const [activeInvoiceHTML, setActiveInvoiceHTML] = useState<string | null>(null);

  // Custom confirmation modal state to replace native confirm dialogues for iframe support
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Password change states
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string>('');
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        if (data.config && data.config.trashRetentionDays) {
          setRetentionDays(data.config.trashRetentionDays);
        }
      } else {
        console.error('Error fetching admin orders');
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('La contraseña actual es requerida');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('La nueva contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Error al cambiar contraseña');
      } else {
        setPasswordSuccess('¡Contraseña cambiada exitosamente!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordChangeModal(false);
          setPasswordSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setPasswordError('Error al contactar con el servidor');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToTrash = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Mover a la papelera?',
      description: '¿Seguro que deseas mover este pedido a la papelera de reciclaje? Permanecerá allí el tiempo estimado configurado antes de eliminarse de forma permanente.',
      confirmText: 'Mover a Papelera',
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deleted: true })
          });
          if (response.ok) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, deleted: true, deletedAt: new Date().toISOString() } : o));
            setExpandedOrderId(null);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleRestoreOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}/restore`, {
        method: 'POST'
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, deleted: false, deletedAt: null } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '⚠️ ELIMINACIÓN DE DATOS IRREVERSIBLE',
      description: '🚨 ADVERTENCIA: Esta acción eliminará permanentemente todos los datos, textos e imágenes de manera irreversible. No habrá forma de recuperar este registro ni de la base de datos local ni de Supabase. ¿Deseas continuar de todos modos?',
      confirmText: 'SÍ, BORRAR DEFINITIVAMENTE',
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/orders/${id}/permanent`, {
            method: 'DELETE'
          });
          if (response.ok) {
            setOrders(prev => prev.filter(o => o.id !== id));
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleSaveConfig = async (days: number) => {
    setIsUpdatingConfig(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trashRetentionDays: days })
      });
      if (response.ok) {
        setRetentionDays(days);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleDownloadZIP = (id: string) => {
    window.open(`/api/admin/orders/${id}/zip`, '_blank');
  };

  // Advanced PDF download function for invoices & preview request vouchers
  const handleDownloadPDF = (order: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isPreview = order.type === 'preview';

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
    doc.roundedRect(130, 18, 60, 8, 2, 2, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(73, 75, 214);
    doc.text(isPreview ? "VALE DE PREVIEW GRATIS" : "FACTURA PROFORMA", 133, 23.5);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Nro: ${order.clientInvoice?.invoiceNumber || order.id || 'VIBE-ORD-1122'}`, 130, 32);

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
    doc.text("EMITIDO PARA CLIENTE:", 120, 46);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(order.emailData?.businessName || order.clientInvoice?.businessName || "Su Negocio", 120, 51);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`${order.emailData?.fullName || order.clientInvoice?.contactChannel || 'Contacto'}`, 120, 56);
    doc.text(`Fecha: ${new Date(order.createdAt || Date.now()).toLocaleDateString("es-ES")}`, 120, 61);

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 68, 190, 68);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(140, 140, 140);
    doc.text("CONCEPTO / ITEM", 20, 74);
    doc.text("TOTAL", 170, 74);

    doc.line(20, 78, 190, 78);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    if (isPreview) {
      doc.text("Diseno de Concepto / Preview Interactiva", 20, 86);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Boceto de alta costura digital y maquetacion preliminar", 20, 92);
      doc.text("interactiva totalmente sin costo y sin compromiso.", 20, 97);

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 185, 129); // emerald Green
      doc.text("GRATUITO ($0.0)", 160, 86);
    } else {
      doc.text("Licencia Completa / Web Corporativa de Alta Moda", 20, 86);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Estructura Premium autogestionable, hosting incluido,", 20, 92);
      doc.text("y soporte tecnico prioritario de postventa.", 20, 97);

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(73, 75, 214);
      doc.text(`$${order.clientInvoice?.price || 20}.00 USD`, 165, 86);
    }

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 104, 190, 104);

    doc.setFillColor(248, 249, 255);
    doc.roundedRect(20, 112, 170, 16, 3, 3, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(73, 75, 214);
    if (isPreview) {
      doc.text("TOTAL MONTO DE INVERSION:", 25, 122);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("$0.00 USD", 98, 122);
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); 
      doc.text("v PREVIEW TOTALMENTE GRATUITA", 120, 122);
    } else {
      doc.text("TOTAL PRECIO DE DESARROLLO:", 25, 122);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`$${order.clientInvoice?.price || 20} USD`, 98, 122);
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text("v GARANTIA SATISFECHO O NO PAGAS", 120, 122);
    }

    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 134, 170, 34, 3, 3, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    if (isPreview) {
      doc.text("Informacion del Proceso & Siguiente Paso:", 25, 140);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.2);
      doc.setTextColor(100, 100, 100);
      doc.text("Maquetamos de forma personalizada un boceto interactivo exclusivo para tu marca.", 25, 146);
      doc.text("La preview se realiza sin solicitar datos de pago, sin contratos ni compromisos.", 25, 151);
      doc.text("Se te notificara cuando este lista para que puedas interactuar y experimentar.", 25, 156);
    } else {
      doc.text("Nota de Autogestion & Acuerdos de Garantia:", 25, 140);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.2);
      doc.setTextColor(100, 100, 100);
      doc.text("No necesitas tener toda la informacion lista desde el inicio, podras gestionarla de forma facil en tu web.", 25, 146);
      doc.text("Se te entregara un manual ilustrado para ensenarte a usar el panel de edicion personalizada y cambiar datos.", 25, 151);
      doc.text("Terminado el sitio, te enviaremos el enlace para tu conformidad. Solo pagas si estas 100% conforme.", 25, 156);
    }

    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text("Documento digital emitido por el sistema Vibe Studio.", 20, 180);
    doc.text("Id de control: " + (order.id || "N/A"), 20, 184);

    doc.save(`vibe-factura-${order.clientInvoice?.invoiceNumber || order.id || 'order'}.pdf`);
  };

  // Helper to compute remaining days in trash
  const getRemainingDays = (deletedAt: string) => {
    const delDate = new Date(deletedAt).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.floor((now - delDate) / (1000 * 60 * 60 * 24));
    const remains = retentionDays - elapsedDays;
    return remains > 0 ? remains : 0;
  };

  // Filter orders based on user query and selected category
  const filteredOrders = orders.filter(order => {
    // Separate deleted from non-deleted
    if (selectedCategory === 'trash') {
      if (!order.deleted) return false;
    } else {
      if (order.deleted) return false;
      if (order.type !== selectedCategory) return false;
    }

    // Match search query
    if (filterSearch.trim() !== '') {
      const query = filterSearch.toLowerCase();
      const bizName = (order.emailData?.businessName || '').toLowerCase();
      const contactName = (order.emailData?.fullName || order.clientInvoice?.contactChannel || '').toLowerCase();
      const orderId = (order.id || '').toLowerCase();
      return bizName.includes(query) || contactName.includes(query) || orderId.includes(query);
    }

    return true;
  });

  return (
    <div id="admin-management-portal" className="min-h-screen bg-[#070809] text-zinc-100 font-sans pb-24 pt-12 relative overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Upper Brand Nav */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 flex items-center justify-center">
              <Unlock className="w-5 h-5 text-brand-primary text-glow-primary" />
            </div>
            <div>
              <span className="text-[10px] text-brand-primary font-mono tracking-widest font-extrabold uppercase">
                Panel de Administración
              </span>
              <h1 className="font-display text-2xl font-black text-white">
                Gestión de Pedidos Vibe
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              title="Sincronizar"
              className="p-2 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all font-mono text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
              Sincronizar
            </button>

            <button
              onClick={() => setShowPasswordChangeModal(true)}
              className="p-2 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all font-mono text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-brand-secondary" />
              Cambiar Contraseña
            </button>

            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-white/15 text-zinc-300 font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-primary" />
              Salir del Panel
            </button>
          </div>
        </div>

        {/* Global overview metrics dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-zinc-950/30">
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">TOTAL PEDIDOS</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {orders.filter(o => !o.deleted).length}
            </span>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-zinc-950/30">
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">PÁGINAS DE PAGO</span>
            <span className="text-2xl font-black text-brand-primary mt-1 block">
              {orders.filter(o => !o.deleted && o.type === 'order').length}
            </span>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-zinc-950/30">
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">PREVIEWS GRATIS</span>
            <span className="text-2xl font-black text-brand-secondary mt-1 block">
              {orders.filter(o => !o.deleted && o.type === 'preview').length}
            </span>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-zinc-950/30">
            <span className="text-zinc-500 font-mono text-[10px] uppercase block">PAPELERA ACTIVA</span>
            <span className="text-2xl font-black text-red-400 mt-1 block">
              {orders.filter(o => o.deleted).length}
            </span>
          </div>
        </div>

        {/* Categories Selectors, Query Filters & Retention Expiration settings */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-zinc-950/40 border border-white/5">
          
          {/* Sub-lists Tabs */}
          <div className="flex flex-wrap bg-zinc-950 p-1 rounded-xl border border-white/5 self-start">
            <button
              onClick={() => { setSelectedCategory('order'); setExpandedOrderId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedCategory === 'order'
                  ? 'bg-brand-primary text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Páginas de Pago ({orders.filter(o => !o.deleted && o.type === 'order').length})
            </button>
            <button
              onClick={() => { setSelectedCategory('preview'); setExpandedOrderId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedCategory === 'preview'
                  ? 'bg-brand-secondary text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Previews Gratuitas ({orders.filter(o => !o.deleted && o.type === 'preview').length})
            </button>
            <button
              onClick={() => { setSelectedCategory('trash'); setExpandedOrderId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'trash'
                  ? 'bg-red-500 text-white'
                  : 'text-zinc-400 hover:text-red-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Papelera ({orders.filter(o => o.deleted).length})
            </button>
          </div>

          {/* Search bar & Admin parameters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* Search Query */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar pedidos..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary/45 font-sans"
              />
            </div>

            {/* Expire / Retention configuration parameter */}
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5">
              <Settings className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-500">Expira en papelera:</span>
              <select
                value={retentionDays}
                disabled={isUpdatingConfig}
                onChange={(e) => handleSaveConfig(Number(e.target.value))}
                className="bg-transparent border-none text-xs text-zinc-200 font-mono focus:outline-none cursor-pointer font-bold animate-pulse"
              >
                <option value={1} className="bg-zinc-950">1 Día</option>
                <option value={3} className="bg-zinc-950">3 Días</option>
                <option value={7} className="bg-zinc-950">7 Días (1 semana)</option>
                <option value={15} className="bg-zinc-950">15 Días (media quincena)</option>
                <option value={30} className="bg-zinc-950">30 Días (1 mes)</option>
                <option value={60} className="bg-zinc-950">60 Días (2 meses)</option>
                <option value={90} className="bg-zinc-950">90 Días (3 meses)</option>
                <option value={120} className="bg-zinc-950">120 Días (4 meses)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ORDER LIST CONTENT AREA */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mb-4" />
            <p className="text-zinc-500 font-mono text-xs">Sincronizando base de datos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center rounded-2xl border border-dashed border-white/5 bg-zinc-950/20 text-zinc-500">
            <Inbox className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-xs font-mono uppercase font-bold tracking-wider">No se encontraron registros</p>
            <p className="text-[11px] text-zinc-650 mt-1 max-w-sm mx-auto">
              {selectedCategory === 'trash'
                ? 'La papelera de reciclaje está vacía.'
                : `No existen registros cargados bajo la categoría de ${selectedCategory === 'order' ? 'Páginas de Pago' : 'Previews Gratuitas'}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const hasConfigData = order.type === 'order';
              const daysInTrash = order.deleted && order.deletedAt ? getRemainingDays(order.deletedAt) : null;

              return (
                <div
                  key={order.id}
                  className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? selectedCategory === 'trash' ? 'border-red-500/40 bg-zinc-950/50' : 'border-brand-primary/45 bg-zinc-950/50' 
                      : order.deleted ? 'border-red-500/10 hover:border-red-500/25 bg-zinc-950/10' : 'border-white/5 hover:border-white/10 bg-zinc-950/10'
                  }`}
                >
                  {/* Summary/Header row */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1 w-full md:w-auto">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">
                          ID: {order.id}
                        </span>
                        
                        {/* Status tag */}
                        {!order.deleted && (
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : order.status === 'in_progress'
                              ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                              : 'bg-zinc-800/80 text-zinc-400 border-white/5'
                          }`}>
                            {order.status === 'completed'
                              ? 'COMPLETADO'
                              : order.status === 'in_progress'
                              ? 'EN PROGRESO'
                              : 'POR COMPLETAR'}
                          </span>
                        )}

                        {/* Trash tag */}
                        {order.deleted && (
                          <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold border border-red-500/20 uppercase flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            Papelera ({daysInTrash !== null ? `${daysInTrash}d restantes` : ''})
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-black text-lg text-white leading-tight">
                        {order.emailData?.businessName || 'Negocio sin Nombre'}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-xs text-zinc-400 pt-0.5">
                        <span className="flex items-center gap-1 text-zinc-500 font-mono text-[10px]">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('es-ES')} - {new Date(order.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        
                        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                          <Phone className="w-3 h-3" />
                          {order.clientInvoice?.contactChannel || order.emailData?.fullName || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      {/* Price indicator */}
                      <span className="text-sm font-mono font-black text-white px-3 py-1 rounded bg-zinc-900 border border-white/5">
                        {order.type === 'preview' ? 'Boceto Gratis' : `$${order.clientInvoice?.price ?? 20} USD`}
                      </span>

                      {/* Quick delete button */}
                      {!order.deleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent toggling card expansion
                            handleMoveToTrash(order.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                          title="Mover a Papelera"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Dropdown handle arrow */}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                      >
                        <div className="border-t border-white/10 p-5 sm:p-6 bg-[#090b0d] space-y-6 text-sm">
                          
                          {/* Top Quick Actions Bar (Downloads & Admin markers) */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 px-4 rounded-xl bg-zinc-950 border border-white/5">
                            
                            {/* Status controls */}
                            {!order.deleted ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-extrabold">Estado:</span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'to_be_completed')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                      order.status === 'to_be_completed'
                                        ? 'bg-zinc-800 text-white border border-white/20'
                                        : 'bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent'
                                    }`}
                                  >
                                    Por Completar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                      order.status === 'in_progress'
                                        ? 'bg-brand-primary text-black border border-brand-primary'
                                        : 'bg-transparent text-zinc-500 hover:text-brand-primary border border-transparent'
                                    }`}
                                  >
                                    En Progreso
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                      order.status === 'completed'
                                        ? 'bg-emerald-500 text-black border border-emerald-500'
                                        : 'bg-transparent text-zinc-500 hover:text-emerald-400 border border-transparent'
                                    }`}
                                  >
                                    Completado
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span>Pedido en Papelera ({daysInTrash} días antes de purgarse permanentemente)</span>
                              </div>
                            )}

                            {/* Export / deletion operations */}
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                              
                              <button
                                onClick={() => handleDownloadZIP(order.id)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center"
                              >
                                <Download className="w-3.5 h-3.5 text-brand-primary" />
                                Descargar ZIP
                              </button>

                              {order.clientInvoice && (
                                <button
                                  onClick={() => handleDownloadPDF(order)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center"
                                >
                                  <FileDown className="w-3.5 h-3.5 text-brand-secondary" />
                                  Descargar Factura
                                </button>
                              )}

                              {!order.deleted ? (
                                <button
                                  onClick={() => handleMoveToTrash(order.id)}
                                  className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Eliminar
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRestoreOrder(order.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-950/20 hover:bg-emerald-920/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center"
                                  >
                                    <ArchiveRestore className="w-3.5 h-3.5" />
                                    Restaurar
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDelete(order.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer flex-grow sm:flex-grow-0 justify-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    Vaciar / Eliminar Irreversible
                                  </button>
                                </>
                              )}

                            </div>
                          </div>

                          {/* CATEGORY 1 DETAILED FIELDS: PREVIEW MODE */}
                          {order.type === 'preview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              
                              {/* Contact particulars */}
                              <div className="space-y-4">
                                <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2">
                                  Datos de Enlace
                                </h4>
                                <ul className="space-y-2 text-zinc-300">
                                  <li>
                                    <span className="text-zinc-500 font-mono text-[11px] block">Nombre Completo:</span>
                                    <span className="font-semibold">{order.emailData?.fullName || 'N/A'}</span>
                                  </li>
                                  <li>
                                    <span className="text-zinc-500 font-mono text-[11px] block">Instagram o TikTok:</span>
                                    <span className="text-brand-primary font-bold">@{order.emailData?.instagramOrTiktok || 'N/A'}</span>
                                  </li>
                                  <li>
                                    <span className="text-zinc-500 font-mono text-[11px] block">Sitio Actual (Opcional):</span>
                                    {order.emailData?.currentWebsite ? (
                                      <a
                                        href={order.emailData.currentWebsite.startsWith('http') ? order.emailData.currentWebsite : `https://${order.emailData.currentWebsite}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-brand-secondary underline hover:text-white"
                                      >
                                        {order.emailData.currentWebsite}
                                      </a>
                                    ) : (
                                      <span className="text-zinc-500 font-sans italic">Ninguno especificado</span>
                                    )}
                                  </li>
                                </ul>
                              </div>

                              {/* Business overview expectations */}
                              <div className="space-y-4">
                                <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2">
                                  Objetivos y Necesidades
                                </h4>
                                <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 min-h-[100px]">
                                  <p className="text-zinc-300 font-sans whitespace-pre-line leading-relaxed text-xs">
                                    {order.emailData?.goals || 'No se ingresaron comentarios o requerimientos especiales.'}
                                  </p>
                                </div>
                              </div>

                            </div>
                          )}

                          {/* CATEGORY 2 DETAILED FIELDS: PROJECT CONFIG ADVANCED WORKFLOW */}
                          {order.type === 'order' && (
                            <div className="space-y-6">
                              
                              {/* Row 1: Brand details and options */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2 mb-3">
                                    Identidad & Marca
                                  </h4>
                                  <ul className="space-y-3">
                                    <li>
                                      <span className="text-zinc-500 font-mono text-[10px] block">Canal de Contacto:</span>
                                      <span className="text-brand-secondary font-mono font-bold text-xs">{order.emailData?.contactChannel}</span>
                                    </li>
                                    <li>
                                      <span className="text-zinc-500 font-mono text-[10px] block">Red Social Provista:</span>
                                      <span>{order.emailData?.socialLink || 'Ninguna'}</span>
                                    </li>
                                    <li>
                                      <span className="text-zinc-500 font-mono text-[10px] block">Productos/Servicios que vende:</span>
                                      <span className="text-zinc-300 whitespace-nowrap overflow-ellipsis overflow-hidden block max-w-xs">{order.emailData?.servicesSoldCount || 'Sin especificar'}</span>
                                    </li>
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2 mb-3">
                                    Estructura de Secciones
                                  </h4>
                                  <ul className="space-y-1">
                                    <li className="flex items-center gap-2 text-xs text-zinc-300">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                      Borrador Textos Principales
                                    </li>
                                    {order.emailData?.specialSections?.map((sec: string) => (
                                      <li key={sec} className="flex items-center gap-2 text-xs text-zinc-350 capitalize">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                                        Sección Extra: {sec}
                                      </li>
                                    )) || <li className="text-zinc-500 text-xs italic">Ninguna sección extra elegida</li>}
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2 mb-3">
                                    Temática de Paleta
                                  </h4>
                                  <div className="flex items-center gap-3">
                                    {order.emailData?.themeColor === 'custom' ? (
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-6 h-6 rounded-lg border border-white/20" 
                                          style={{ backgroundColor: order.emailData?.customColorHex || '#494bd6' }}
                                        />
                                        <span className="text-xs font-mono text-zinc-300">Color Personalizado: {order.emailData?.customColorHex}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-lg border border-white/20 ${
                                          order.emailData?.themeColor === 'obsidian' ? 'bg-zinc-950' :
                                          order.emailData?.themeColor === 'indigo' ? 'bg-indigo-600' : 'bg-cyan-400'
                                        }`} />
                                        <span className="text-xs font-mono capitalize text-zinc-300">Vibe {order.emailData?.themeColor}</span>
                                      </div>
                                    )}
                                  </div>

                                  {order.emailData?.colorPaletteImage && (
                                    <div className="mt-2.5">
                                      <span className="text-zinc-500 font-mono text-[9px] block mb-1">Paleta de Referencia Subida:</span>
                                      <img
                                        src={order.emailData.colorPaletteImage}
                                        alt="Paleta"
                                        className="h-10 w-24 object-cover rounded border border-white/15"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: Customer Drafts Texts & Descriptions */}
                              <div className="space-y-4">
                                <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2">
                                  Borrador de Textos Cargados por el Cliente
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {order.emailData?.textDraft && (
                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                                      <span className="text-brand-primary text-[10px] font-mono block mb-1 uppercase font-bold">1. Borrador Principal (Presentación):</span>
                                      <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{order.emailData.textDraft}</p>
                                    </div>
                                  )}
                                  {order.emailData?.aboutUsText && (
                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                                      <span className="text-brand-secondary text-[10px] font-mono block mb-1 uppercase font-bold">2. Sobre Nosotros:</span>
                                      <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{order.emailData.aboutUsText}</p>
                                    </div>
                                  )}
                                  {order.emailData?.hoursText && (
                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                                      <span className="text-brand-primary text-[10px] font-mono block mb-1 uppercase font-bold">3. Horarios y Ubicaciones:</span>
                                      <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{order.emailData.hoursText}</p>
                                    </div>
                                  )}
                                  {order.emailData?.faqText && (
                                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                                      <span className="text-brand-secondary text-[10px] font-mono block mb-1 uppercase font-bold">4. Preguntas Frecuentes (FAQ):</span>
                                      <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{order.emailData.faqText}</p>
                                    </div>
                                  )}
                                </div>

                                {order.emailData?.additionalDetails && (
                                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/5">
                                    <span className="text-zinc-500 text-[10px] font-mono block mb-1 uppercase font-bold">Instrucciones Adicionales del Pedido:</span>
                                    <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">{order.emailData.additionalDetails}</p>
                                  </div>
                                )}
                              </div>

                              {/* Row 3: Design Reference images and Catalogue gallery images */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                
                                {/* Ref style images */}
                                <div>
                                  <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2 mb-3">
                                    Referencias Visuales Subidas ({order.emailData?.uploadedReferences?.length || 0})
                                  </h4>
                                  {order.emailData?.uploadedReferences && order.emailData?.uploadedReferences.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                      {order.emailData.uploadedReferences.map((ref: any, idx: number) => (
                                        <div key={idx} className="group relative aspect-square rounded-lg border border-white/10 overflow-hidden bg-zinc-900">
                                          <img
                                            src={ref.base64}
                                            alt={ref.name || 'Referencia'}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-[8px] text-zinc-300 truncate font-mono text-center">
                                            {ref.name || `Imagen ${idx + 1}`}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-zinc-500 font-sans italic text-xs">No se cargaron imágenes de referencia de diseño.</span>
                                  )}
                                </div>

                                {/* Catalogue items uploaded */}
                                <div>
                                  <h4 className="font-mono text-zinc-400 text-xs uppercase tracking-wider font-extrabold border-b border-white/5 pb-2 mb-3">
                                    Catálogo de Galería de Fotos del Negocio ({order.emailData?.galleryItems?.length || 0})
                                  </h4>
                                  {order.emailData?.galleryItems && order.emailData?.galleryItems.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      {order.emailData.galleryItems.map((item: any, idx: number) => (
                                        <div key={idx} className="rounded-xl border border-white/15 bg-zinc-950 p-2 space-y-1.5 flex flex-col">
                                          {item.base64 ? (
                                            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                                              <img
                                                src={item.base64}
                                                alt={item.fileName || 'Item Catalogo'}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          ) : (
                                            <div className="aspect-[4/3] rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700">
                                              <ImageIcon className="w-5 h-5" />
                                            </div>
                                          )}
                                          <div className="grow flex flex-col justify-between">
                                            <span className="text-[9px] font-mono text-zinc-500 truncate block font-bold">{item.fileName || `Foto ${idx + 1}`}</span>
                                            <span className="text-[9px] text-zinc-450 leading-relaxed font-sans line-clamp-2 italic">{item.desc || 'Sin descripción'}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-zinc-500 font-sans italic text-xs">No se agregaron productos o fotos de stock.</span>
                                  )}
                                </div>

                              </div>

                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
        {/* Change password modal overlay */}
        <AnimatePresence>
          {showPasswordChangeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 relative shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-secondary" />
                    <h3 className="font-display font-black text-lg text-white">Cambiar Contraseña</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordChangeModal(false);
                      setPasswordError('');
                      setPasswordSuccess('');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-zinc-500 hover:text-zinc-300 font-mono text-xl cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                      {passwordSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-zinc-500">Contraseña Actual</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:border-brand-secondary focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-zinc-500">Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:border-brand-secondary focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-zinc-500">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:border-brand-secondary focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3 rounded-xl bg-brand-secondary hover:bg-opacity-90 font-bold text-black text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : 'Guardar Nueva Contraseña'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Sandbox-Proof Confirmation Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-zinc-950 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5 relative shadow-[0_0_50px_rgba(239,68,68,0.08)]"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <span className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  </span>
                  <h3 className="font-display font-black text-lg uppercase tracking-tight">{confirmModal.title}</h3>
                </div>

                <p className="text-zinc-400 text-xs font-mono leading-relaxed">
                  {confirmModal.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                      confirmModal.isDanger 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-brand-primary text-black hover:bg-opacity-90'
                    }`}
                  >
                    {confirmModal.confirmText || 'Confirmar'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
