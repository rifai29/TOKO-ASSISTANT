import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Package, Calendar as CalendarIcon, Check, ArrowLeft, Sparkles, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DayPicker } from 'react-day-picker';
import { id } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface ProductDetailPageProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  gondolas: any[]; // Using any for simplicity in this context, but ideally Gondola[]
}

export default function ProductDetailPage({ products, onUpdateProduct, gondolas }: ProductDetailPageProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  const product = products.find(p => p.id === productId);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F2F2F7]">
        <p className="text-gray-500 mb-4">Produk tidak ditemukan</p>
        <Button onClick={() => navigate('/')}>Kembali ke Planogram</Button>
      </div>
    );
  }

  // Find location info for active product and its parent gondola
  const activeGondola = gondolas.find(g => 
    g.shelves.some((shelf: Product[]) => shelf.some(p => p.id === product.id))
  );

  // Get all unique products in the same gondola 
  // We use a Map to ensure unique products by ID
  const siblingProductsMap = new Map<string, Product>();
  if (activeGondola) {
    activeGondola.shelves.forEach((shelf: Product[]) => {
      shelf.forEach(p => {
        if (!siblingProductsMap.has(p.id)) {
          siblingProductsMap.set(p.id, p);
        }
      });
    });
  }
  
  const siblingProducts = Array.from(siblingProductsMap.values());
  if (siblingProducts.length === 0) siblingProducts.push(product);

  const siblingIndex = siblingProducts.findIndex(p => p.id === product.id);
  const visibleProductCount = 10;
  const startIdx = Math.max(0, Math.min(siblingIndex - 5, Math.max(0, siblingProducts.length - visibleProductCount)));
  const productsToShow = siblingProducts.slice(startIdx, Math.min(startIdx + visibleProductCount, siblingProducts.length));
  
  // Find specific coordinates in the current gondola for display labels
  let activeLoc = { shelfIdx: -1, slotIdx: -1 };
  if (activeGondola) {
    activeGondola.shelves.forEach((shelf: Product[], sIdx: number) => {
      const foundIdx = shelf.findIndex(prod => prod.id === product.id);
      if (foundIdx !== -1) activeLoc = { shelfIdx: sIdx, slotIdx: foundIdx };
    });
  }

  const currentExpiryDate = product.expiryDate 
    ? parse(product.expiryDate, 'dd/MM/yyyy', new Date())
    : undefined;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 px-4 h-14 flex items-center border-b border-gray-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-gray-100 shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <span className="text-lg font-black text-gray-900 ml-4 tracking-tight">Detail Produk</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto flex flex-col items-center bg-[#F8F9FB] w-full py-4 md:py-10">
        <div className="w-full max-w-sm md:max-w-6xl px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-auto">
          
          {/* Left Column: Spotlight Image Card & Sibling Slider */}
          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="w-full px-2">
              <div className="relative flex items-center justify-center">
                <div className="flex overflow-x-auto scrollbar-hide snap-x flex-row gap-4 px-2 pt-2 pb-5 w-full">
                  {productsToShow.map((p) => (
                    <div
                      key={p.id}
                      className="flex-shrink-0 snap-center w-full max-w-[240px] md:max-w-[280px]"
                    >
                      <button
                        onClick={() => navigate(`/product/${p.id}`)}
                        className={cn(
                          "w-full aspect-square bg-white rounded-[2.5rem] flex items-center justify-center p-6 relative overflow-hidden transition-all duration-500 border border-gray-100 outline-none",
                          product.id === p.id 
                            ? "shadow-[0_20px_50px_rgba(0,0,0,0.06)] scale-100 border-primary/20" 
                            : "opacity-45 scale-90 grayscale hover:opacity-75 transition-opacity"
                        )}
                      >
                        {p.image ? (
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-contain p-2"
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 text-gray-200">
                            <Package size={80} strokeWidth={1} />
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop-only Context Card */}
            <div className="hidden md:flex flex-col gap-4 p-6 bg-white w-full rounded-[2.5rem] border border-gray-100/60 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary-500 text-blue-500" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">INFORMASI DISPLAY RAK</span>
              </div>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                Produk ini bagian dari rak <span className="text-gray-900 font-extrabold">"{activeGondola?.settings?.name || '---'}"</span> di ambalan/selving {activeLoc.shelfIdx + 1}. Ada total {siblingProducts.length} produk lain dalam kelompok display ini.
              </p>
            </div>
          </div>

          {/* Right Column: Title, Metal Technical Specs, Expiry, Action Grid */}
          <div className="w-full space-y-8">
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Product Title */}
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <Tag size={12} className="text-primary" />
                  <span className="text-[8px] md:text-[9.5px] font-mono font-black text-primary uppercase tracking-widest">PRODUK AKTIF</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                  {product.name}
                </h2>
              </div>

              {/* Technical Information Dotted List */}
              <div className="space-y-6 pt-1">
                {[
                  { label: 'BARIS', value: String(activeLoc.shelfIdx + 1).padStart(2, '0') },
                  { label: 'SELVING', value: String(activeLoc.slotIdx + 1).padStart(2, '0') },
                  { label: 'BARCODE/PLU', value: product.plu || '-' },
                  { label: 'INTERNAL SKU', value: product.sku || '-' },
                  { label: 'RH', value: String(product.rh || '0') },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#A5ADC5] uppercase tracking-widest flex-shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 border-b border-dotted border-gray-300 mb-0.5"></div>
                    <span className="text-base font-black text-[#1A1F36] tracking-tight tabular-nums">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Expiry Picker Row */}
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full h-20 px-6 bg-white rounded-[2rem] flex items-center justify-between transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-white hover:border-gray-100"
                >
                  <div className="flex flex-col items-start translate-y-0.5">
                    <span className="text-[10px] font-bold text-[#A5ADC5] uppercase tracking-widest mb-1.5">TANGGAL KEDALUWARSA</span>
                    <span className={cn("text-lg font-black tracking-tight", !product.expiryDate ? "text-[#C1C9DD]" : "text-[#1A1F36]")}>
                      {product.expiryDate || 'Pilih Tanggal...'}
                    </span>
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    isCalendarOpen ? "bg-primary/10 text-primary" : "text-[#A5ADC5] bg-gray-50"
                  )}>
                    <CalendarIcon size={24} />
                  </div>
                </button>

                <AnimatePresence>
                  {isCalendarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 bottom-full mb-4 z-[120] bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-2xl shadow-black/10 w-full"
                    >
                      <div className="flex flex-col items-center">
                        <DayPicker
                          mode="single"
                          selected={currentExpiryDate}
                          onSelect={(date) => {
                            if (date) {
                              onUpdateProduct(product.id, { expiryDate: format(date, 'dd/MM/yyyy') });
                              setIsCalendarOpen(false);
                            }
                          }}
                          locale={id}
                          className="m-0"
                          showOutsideDays
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { 
                    id: 'exp', 
                    label: 'EXP', 
                    subLabel: 'PRODUK', 
                    active: !!product.lastChecked,
                    color: 'bg-primary shadow-primary/20',
                    onClick: () => {
                      const now = new Date().toLocaleString('id-ID', { 
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      });
                      onUpdateProduct(product.id, { lastChecked: product.lastChecked ? undefined : now });
                    }
                  },
                  { 
                    id: 'rp', 
                    label: 'RP', 
                    subLabel: 'SELVING', 
                    active: activeGondola?.shelves[activeLoc.shelfIdx]?.every((p: any) => p.tidyChecked),
                    color: 'bg-green-500 shadow-green-500/20',
                    onClick: () => {
                      if (!activeGondola || activeLoc.shelfIdx === -1) return;
                      const currentShelf = activeGondola.shelves[activeLoc.shelfIdx];
                      const anyMissing = currentShelf.some((p: any) => !p.tidyChecked);
                      currentShelf.forEach((p: any) => onUpdateProduct(p.id, { tidyChecked: anyMissing }));
                    }
                  },
                  { 
                    id: 'hr', 
                    label: 'HR', 
                    subLabel: 'RAK', 
                    active: activeGondola?.shelves.flat().every((p: any) => p.priceChecked),
                    color: 'bg-yellow-500 shadow-yellow-500/20 text-gray-900',
                    onClick: () => {
                      if (!activeGondola) return;
                      const allProducts = activeGondola.shelves.flat();
                      const anyMissing = allProducts.some((p: any) => !p.priceChecked);
                      allProducts.forEach((p: any) => onUpdateProduct(p.id, { priceChecked: anyMissing }));
                    }
                  },
                  { 
                    id: 'so', 
                    label: 'SO', 
                    subLabel: 'SEMUA', 
                    active: activeGondola?.shelves.flat().every((p: any) => p.soChecked),
                    color: 'bg-orange-500 shadow-orange-500/20',
                    onClick: () => {
                      if (!activeGondola) return;
                      const allProducts = activeGondola.shelves.flat();
                      const anyMissing = allProducts.some((p: any) => !p.soChecked);
                      const now = new Date().toLocaleString('id-ID', { 
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      });
                      allProducts.forEach((p: any) => onUpdateProduct(p.id, { soChecked: anyMissing ? now : null }));
                    }
                  },
                ].map((btn) => (
                  <div key={btn.id} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={btn.onClick}
                      className={cn(
                        "w-full h-14 md:h-16 rounded-[1.5rem] flex items-center justify-center transition-all active:scale-90 shadow-lg text-sm font-black",
                        btn.active ? btn.color + " text-white" : "bg-white text-[#C1C9DD] shadow-[0_10px_20px_rgba(0,0,0,0.02)]"
                      )}
                    >
                      {btn.label}
                    </button>
                    <span className="text-[7.5px] md:text-[9.5px] font-black text-[#A5ADC5] uppercase tracking-wider">{btn.subLabel}</span>
                  </div>
                ))}
              </div>

              {/* Footer Text */}
              <div className="pt-4 flex flex-col items-center md:items-start">
                <p className="text-[10px] font-black text-[#A5ADC5] uppercase tracking-[0.25em]">
                  {product.lastChecked ? `TERAKHIR: ${product.lastChecked}` : 'BELUM DICEK'}
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
